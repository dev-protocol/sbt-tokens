import { ethers, run, upgrades } from 'hardhat'
import type { SBTFactory__factory } from '../typechain-types'

const proxyAddress = '0x362AA10263ba04a54390E544E6Ca8F4aCdE19a44'

async function main() {
	console.log('Starting upgradeSBTFactory script on sbt-tokens...')

	const [signer] = await ethers.getSigners()
	console.log('Signer is: ', signer.address)
	console.log()

	// >>> Upgrade SBTFactory >>>
	console.log('Upgrading SBTFactory...')
	const sbtFactoryFactory = (await ethers.getContractFactory(
		'SBTFactory'
	)) as SBTFactory__factory
	const sbtFactoryInstance = await upgrades.upgradeProxy(
		proxyAddress,
		sbtFactoryFactory
	)

	const sbtFactoryInstanceDeployTxn = sbtFactoryInstance.deployTransaction
	console.log(
		` - SBTFactory deploying at txn:${sbtFactoryInstanceDeployTxn.hash}`
	)
	await sbtFactoryInstance.deployed()
	console.log(` - SBTFactory deployed at address:${sbtFactoryInstance.address}`)
	await sbtFactoryInstanceDeployTxn.wait(2)
	console.log()

	// >>> Verify SBTFactory code >>>
	console.log('Verifying SBTFactory contract...')
	await run(`verify:verify`, {
		address: sbtFactoryInstance.address,
		constructorArguments: [],
	})
	console.log()
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
