import { ethers } from 'ethers'
import { Registry as RegistryContract } from '@airswap/registry/typechain/contracts'
import { Registry__factory } from '@airswap/registry/typechain/factories/contracts'
import { chainIds } from '@airswap/constants'

import { Server, ServerOptions } from './Server'
import { SwapERC20 } from './SwapERC20'

import * as registryDeploys from '@airswap/registry/deploys.js'

export class Registry {
  public chainId: number
  private contract: RegistryContract

  public constructor(chainId = chainIds.MAINNET, signer: ethers.Signer) {
    this.chainId = chainId
    this.contract = Registry__factory.connect(
      Registry.getAddress(chainId),
      signer
    )
  }

  public static getAddress(chainId = chainIds.MAINNET): string {
    if (chainId in registryDeploys) {
      return registryDeploys[chainId]
    }
    throw new Error(`Registry deploy not found for chainId ${chainId}`)
  }

  public async getServers(
    quoteToken: string,
    baseToken: string,
    options?: ServerOptions
  ): Promise<Array<Server>> {
    const quoteTokenURLs: string[] = await this.contract.getServerURLsForToken(
      quoteToken
    )
    const baseTokenURLs: string[] = await this.contract.getServerURLsForToken(
      baseToken
    )
    const serverPromises = await Promise.allSettled(
      quoteTokenURLs
        .filter((value) => baseTokenURLs.includes(value))
        .map((url) => {
          return Server.at(url, {
            swapContract:
              options?.swapContract || SwapERC20.getAddress(this.chainId),
            chainId: this.chainId,
            initializeTimeout: options?.initializeTimeout,
          })
        })
    )
    const servers: PromiseFulfilledResult<Server>[] = serverPromises.filter(
      (value): value is PromiseFulfilledResult<Server> =>
        value.status === 'fulfilled'
    )
    return servers.map((value) => value.value)
  }
}
