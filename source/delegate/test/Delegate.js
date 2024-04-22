const { expect } = require('chai')

const { ethers, waffle } = require('hardhat')
const { deployMockContract } = waffle
const IERC20 = require('@openzeppelin/contracts/build/contracts/IERC20.json')
const SWAP_ERC20 = require('@airswap/swap-erc20/build/contracts/SwapERC20.sol/SwapERC20.json')
const {
  ADDRESS_ZERO,
  createOrderERC20,
  orderERC20ToParams,
  createOrderERC20Signature,
} = require('@airswap/utils')
const CHAIN_ID = 31337
const DEFAULT_BALANCE = '100000'
const DEFAULT_SENDER_AMOUNT = '10000'
const DEFAULT_SIGNER_AMOUNT = '10000'
const PROTOCOL_FEE = '5'
const REBATE_SCALE = '10'
const REBATE_MAX = '100'

describe('Delegate Unit', () => {
  let deployer
  let sender
  let signer
  let swapERC20
  let senderToken
  let signerToken
  let delegate
  let signatory
  let snapshotId

  async function createSignedOrderERC20(params, signatory) {
    const unsignedOrder = createOrderERC20({
      protocolFee: PROTOCOL_FEE,
      signerWallet: signer.address,
      signerToken: signerToken.address,
      signerAmount: DEFAULT_SIGNER_AMOUNT,
      senderWallet: delegate.address,
      senderToken: senderToken.address,
      senderAmount: DEFAULT_SENDER_AMOUNT,
      ...params,
    })
    return orderERC20ToParams({
      ...unsignedOrder,
      ...(await createOrderERC20Signature(
        unsignedOrder,
        signatory,
        swapERC20.address,
        CHAIN_ID
      )),
    })
  }

  async function setUpAllowances(
    senderWallet,
    senderAmount,
    signerWallet,
    signerAmount
  ) {
    await senderToken.mock.allowance
      .withArgs(senderWallet, delegate.address)
      .returns(senderAmount)
    await signerToken.mock.allowance
      .withArgs(signerWallet, swapERC20.address)
      .returns(signerAmount)
  }

  async function setUpBalances(senderWallet, signerWallet) {
    await senderToken.mock.balanceOf
      .withArgs(senderWallet)
      .returns(DEFAULT_BALANCE)
    await signerToken.mock.balanceOf
      .withArgs(signerWallet)
      .returns(DEFAULT_BALANCE)
    await signerToken.mock.balanceOf
      .withArgs(delegate.address)
      .returns(DEFAULT_SIGNER_AMOUNT)
  }

  async function setUpApprovals() {
    await senderToken.mock.approve
      .withArgs(delegate.address, DEFAULT_SENDER_AMOUNT)
      .returns(true)

    await senderToken.mock.approve
      .withArgs(swapERC20.address, DEFAULT_SENDER_AMOUNT)
      .returns(true)

    await signerToken.mock.approve
      .withArgs(swapERC20.address, DEFAULT_SIGNER_AMOUNT)
      .returns(true)
  }

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot')
  })

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId])
  })

  before(async () => {
    ;[deployer, sender, signer, signatory, anyone] = await ethers.getSigners()

    const swapERC20Factory = await ethers.getContractFactory(
      SWAP_ERC20.abi,
      SWAP_ERC20.bytecode
    )
    swapERC20 = await swapERC20Factory.deploy(
      PROTOCOL_FEE,
      PROTOCOL_FEE,
      deployer.address,
      REBATE_SCALE,
      REBATE_MAX
    )

    delegate = await (
      await ethers.getContractFactory('Delegate')
    ).deploy(swapERC20.address)
    await delegate.deployed()

    senderToken = await deployMockContract(deployer, IERC20.abi)
    signerToken = await deployMockContract(deployer, IERC20.abi)
    await senderToken.mock.transferFrom.returns(true)
    await signerToken.mock.transferFrom.returns(true)
    await senderToken.mock.transfer.returns(true)
    await signerToken.mock.transfer.returns(true)

    setUpApprovals()
  })

  describe('Constructor', async () => {
    it('swap ERC20 address is set', async () => {
      expect(await delegate.swapERC20()).to.equal(swapERC20.address)
    })
  })

  describe('Rules', async () => {
    it('sets a Rule', async () => {
      await expect(
        delegate
          .connect(sender)
          .setRule(
            sender.address,
            senderToken.address,
            DEFAULT_SENDER_AMOUNT,
            signerToken.address,
            DEFAULT_SIGNER_AMOUNT
          )
      )
        .to.emit(delegate, 'SetRule')
        .withArgs(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT
        )
    })

    it('unsets a Rule', async () => {
      await expect(
        delegate
          .connect(sender)
          .unsetRule(sender.address, senderToken.address, signerToken.address)
      )
        .to.emit(delegate, 'UnsetRule')
        .withArgs(sender.address, senderToken.address, signerToken.address)
    })

    it('a signatory can set a Rule', async () => {
      await delegate.connect(sender).authorize(signatory.address)
      await expect(
        delegate
          .connect(signatory)
          .setRule(
            sender.address,
            senderToken.address,
            DEFAULT_SENDER_AMOUNT,
            signerToken.address,
            DEFAULT_SIGNER_AMOUNT
          )
      )
        .to.emit(delegate, 'SetRule')
        .withArgs(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT
        )
    })

    it('a signatory can unset a Rule', async () => {
      await delegate.connect(sender).authorize(signatory.address)
      await delegate
        .connect(signatory)
        .setRule(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT
        )

      await expect(
        delegate
          .connect(signatory)
          .unsetRule(sender.address, senderToken.address, signerToken.address)
      )
        .to.emit(delegate, 'UnsetRule')
        .withArgs(sender.address, senderToken.address, signerToken.address)
    })

    it('setting a Rule updates the rule balance', async () => {
      await delegate
        .connect(sender)
        .setRule(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT
        )

      const rule = await delegate.rules(
        sender.address,
        senderToken.address,
        signerToken.address
      )

      expect(rule.senderAmount.toString()).to.equal(DEFAULT_SENDER_AMOUNT)
    })

    it('unsetting a Rule updates the rule balance', async () => {
      await delegate
        .connect(sender)
        .setRule(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT
        )

      let rule = await delegate.rules(
        sender.address,
        senderToken.address,
        signerToken.address
      )

      await delegate
        .connect(sender)
        .unsetRule(sender.address, senderToken.address, signerToken.address)

      rule = await delegate.rules(
        sender.address,
        senderToken.address,
        signerToken.address
      )

      expect(rule.senderAmount.toString()).to.equal('0')
    })
  })

  describe('Test authorization', async () => {
    it('test authorized is set', async () => {
      await delegate.connect(anyone).authorize(signer.address)
      expect(await delegate.authorized(anyone.address)).to.equal(signer.address)
    })

    it('test authorize with zero address', async () => {
      await expect(
        delegate.connect(deployer).authorize(ADDRESS_ZERO)
      ).to.be.revertedWith('SignatoryInvalid')
    })

    it('test revoke', async () => {
      await delegate.connect(anyone).revoke()
      expect(await delegate.authorized(anyone.address)).to.equal(ADDRESS_ZERO)
    })
  })

  describe('Swap', async () => {
    it('successfully swaps', async () => {
      await delegate
        .connect(sender)
        .setRule(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT
        )

      const order = await createSignedOrderERC20({}, signer)

      await setUpAllowances(
        sender.address,
        DEFAULT_SENDER_AMOUNT,
        signer.address,
        DEFAULT_SIGNER_AMOUNT + PROTOCOL_FEE
      )
      await setUpBalances(signer.address, sender.address)

      await expect(
        delegate.connect(signer).swap(sender.address, ...order)
      ).to.emit(delegate, 'DelegateSwap')
    })

    it('successfully swaps with a signatory', async () => {
      await delegate.connect(sender).authorize(signatory.address)

      await delegate
        .connect(signatory)
        .setRule(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT
        )

      const order = await createSignedOrderERC20({}, signer)

      await setUpAllowances(
        sender.address,
        DEFAULT_SENDER_AMOUNT,
        signer.address,
        DEFAULT_SIGNER_AMOUNT + PROTOCOL_FEE
      )
      await setUpBalances(signer.address, sender.address)

      await expect(
        delegate.connect(signer).swap(sender.address, ...order)
      ).to.emit(delegate, 'DelegateSwap')
    })

    it('fails to swap with no rule', async () => {
      const order = await createSignedOrderERC20({}, signer)

      await setUpAllowances(
        signer.address,
        DEFAULT_SENDER_AMOUNT + PROTOCOL_FEE,
        sender.address,
        DEFAULT_SIGNER_AMOUNT
      )
      await setUpBalances(signer.address, sender.address)

      await signerToken.mock.balanceOf
        .withArgs(delegate.address)
        .returns(DEFAULT_SIGNER_AMOUNT)

      await expect(delegate.connect(signer).swap(sender.address, ...order)).to
        .be.reverted
    })

    it('fails to swap with insufficient remaining sender amount on Rule', async () => {
      await senderToken.mock.approve
        .withArgs(delegate.address, DEFAULT_SENDER_AMOUNT - 1)
        .returns(true)

      await delegate
        .connect(sender)
        .setRule(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT - 1,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT - 1
        )

      const order = await createSignedOrderERC20({}, signer)

      await setUpAllowances(
        sender.address,
        DEFAULT_SENDER_AMOUNT,
        signer.address,
        DEFAULT_SIGNER_AMOUNT + PROTOCOL_FEE
      )
      await setUpBalances(signer.address, sender.address)

      await signerToken.mock.balanceOf
        .withArgs(signer.address)
        .returns(DEFAULT_SIGNER_AMOUNT - 1)

      await expect(
        delegate.connect(signer).swap(sender.address, ...order)
      ).to.be.revertedWith('InsufficientDelegateAllowance')
    })

    it('fails to swap with insufficient signer amount on Rule', async () => {
      await senderToken.mock.approve
        .withArgs(delegate.address, DEFAULT_SENDER_AMOUNT - 1)
        .returns(true)

      await delegate
        .connect(sender)
        .setRule(
          sender.address,
          senderToken.address,
          DEFAULT_SENDER_AMOUNT,
          signerToken.address,
          DEFAULT_SIGNER_AMOUNT
        )

      const order = await createSignedOrderERC20(
        {
          signerAmount: DEFAULT_SIGNER_AMOUNT - 1,
        },
        signer
      )

      await setUpAllowances(
        sender.address,
        DEFAULT_SENDER_AMOUNT,
        signer.address,
        DEFAULT_SIGNER_AMOUNT + PROTOCOL_FEE
      )
      await setUpBalances(signer.address, sender.address)

      await signerToken.mock.balanceOf
        .withArgs(signer.address)
        .returns(DEFAULT_SIGNER_AMOUNT - 1)

      await expect(
        delegate.connect(signer).swap(sender.address, ...order)
      ).to.be.revertedWith('InsufficientSignerAmount')
    })
  })
})
