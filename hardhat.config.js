require('dotenv').config({ path: '../../.env' })
require('@typechain/hardhat')
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('hardhat-gas-reporter')
require('solidity-coverage')

const {
  ChainIds,
  apiUrls,
  explorerUrls,
  explorerApiUrls,
} = require('@airswap/utils')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    mainnet: {
      url: apiUrls[ChainIds.MAINNET],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    bsctestnet: {
      url: apiUrls[ChainIds.BSCTESTNET],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    bsc: {
      url: apiUrls[ChainIds.BSC],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    fuji: {
      url: apiUrls[ChainIds.FUJI],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    avalanche: {
      url: apiUrls[ChainIds.AVALANCHE],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    mumbai: {
      url: apiUrls[ChainIds.MUMBAI],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    polygon: {
      url: apiUrls[ChainIds.POLYGON],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    arbitrum: {
      url: apiUrls[ChainIds.ARBITRUM],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    arbitrumsepolia: {
      url: apiUrls[ChainIds.ARBITRUMSEPOLIA],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    rsk: {
      url: apiUrls[ChainIds.RSK],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    rsktestnet: {
      url: apiUrls[ChainIds.RSKTESTNET],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    lineagoerli: {
      url: apiUrls[ChainIds.LINEAGOERLI],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    linea: {
      url: apiUrls[ChainIds.LINEA],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    basesepolia: {
      url: apiUrls[ChainIds.BASESEPOLIA],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    base: {
      url: apiUrls[ChainIds.BASE],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    telostestnet: {
      url: apiUrls[ChainIds.TELOSTESTNET],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    telos: {
      url: apiUrls[ChainIds.TELOS],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    sepolia: {
      url: apiUrls[ChainIds.SEPOLIA],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    holesky: {
      url: apiUrls[ChainIds.HOLESKY],
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.8.23',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
      avalanche: process.env.SNOWTRACE_API_KEY,
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY,
      holesky: process.env.ETHERSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      linea: process.env.LINEASCAN_API_KEY,
      lineagoerli: process.env.LINEASCAN_API_KEY,
      base: process.env.BASESCAN_API_KEY,
      basesepolia: process.env.BASESCAN_API_KEY,
      rsk: process.env.BLOCKSCOUT_API_KEY,
      rsktestnet: process.env.BLOCKSCOUT_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: 'rsk',
        chainId: ChainIds.RSK,
        urls: {
          apiURL: explorerApiUrls[ChainIds.RSK],
          browserURL: explorerUrls[ChainIds.RSK],
        },
      },
      {
        network: 'rsktestnet',
        chainId: ChainIds.RSKTESTNET,
        urls: {
          apiURL: explorerApiUrls[ChainIds.RSKTESTNET],
          browserURL: explorerUrls[ChainIds.RSKTESTNET],
        },
      },
      {
        network: 'holesky',
        chainId: ChainIds.HOLESKY,
        urls: {
          apiURL: explorerApiUrls[ChainIds.HOLESKY],
          browserURL: explorerUrls[ChainIds.HOLESKY],
        },
      },
      {
        network: 'linea',
        chainId: ChainIds.LINEA,
        urls: {
          apiURL: explorerApiUrls[ChainIds.LINEA],
          browserURL: explorerUrls[ChainIds.LINEA],
        },
      },
      {
        network: 'lineagoerli',
        chainId: ChainIds.LINEAGOERLI,
        urls: {
          apiURL: explorerApiUrls[ChainIds.LINEAGOERLI],
          browserURL: explorerUrls[ChainIds.LINEAGOERLI],
        },
      },
      {
        network: 'base',
        chainId: ChainIds.BASE,
        urls: {
          apiURL: explorerApiUrls[ChainIds.BASE],
          browserURL: explorerUrls[ChainIds.BASE],
        },
      },
      {
        network: 'basesepolia',
        chainId: ChainIds.BASESEPOLIA,
        urls: {
          apiURL: explorerApiUrls[ChainIds.BASESEPOLIA],
          browserURL: explorerUrls[ChainIds.BASESEPOLIA],
        },
      },
      {
        network: 'arbitrumSepolia',
        chainId: ChainIds.ARBITRUMSEPOLIA,
        urls: {
          apiURL: explorerApiUrls[ChainIds.ARBITRUMSEPOLIA],
          browserURL: explorerUrls[ChainIds.ARBITRUMSEPOLIA],
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true' ? true : false,
  },
  paths: {
    artifacts: './build',
  },
}
