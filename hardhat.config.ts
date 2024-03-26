/* eslint-disable @typescript-eslint/naming-convention */

import '@typechain/hardhat'
import * as dotenv from 'dotenv'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import type { HardhatUserConfig } from 'hardhat/config'

dotenv.config()

const mnemnoc =
	typeof process.env.MNEMONIC === 'undefined' ? '' : process.env.MNEMONIC

const privateKey =
	typeof process.env.PRIVATE_KEY === 'undefined' ? '' : process.env.PRIVATE_KEY

const config: HardhatUserConfig = {
	solidity: {
		compilers: [
			{
				version: '0.8.9',
				settings: {
					optimizer: {
						enabled: true,
						runs: 1000,
					},
				},
			},
			{
				version: '0.8.4',
				settings: {
					optimizer: {
						enabled: true,
						runs: 1000,
					},
				},
			},
		],
	},
	networks: {
		mainnet: {
			url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: mnemnoc
				? {
						mnemonic: mnemnoc,
				  }
				: [privateKey],
		},
		arbitrumOne: {
			url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: mnemnoc
				? {
						mnemonic: mnemnoc,
				  }
				: [privateKey],
		},
		arbitrumRinkeby: {
			url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: mnemnoc
				? {
						mnemonic: mnemnoc,
				  }
				: [privateKey],
		},
		polygonMainnet: {
			url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: mnemnoc
				? {
						mnemonic: mnemnoc,
				  }
				: [privateKey],
		},
		polygonMumbai: {
			url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env
				.ALCHEMY_API_KEY!}`,
			accounts: mnemnoc
				? {
						mnemonic: mnemnoc,
				  }
				: [privateKey],
		},
	},
	Etherscan: {
		apiKey: {
			...((k) => (k ? { mainnet: k } : undefined))(process.env.ETHERSCAN_KEY),
			...((k) => (k ? { arbitrumOne: k, arbitrumTestnet: k } : undefined))(
				process.env.ARBISCAN_KEY
			),
			...((k) => (k ? { polygon: k, polygonMumbai: k } : undefined))(
				process.env.POLYGONSCAN_KEY
			),
		},
	},
}

export default config
