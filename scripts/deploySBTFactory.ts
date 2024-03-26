import { ethers, run } from 'hardhat'

async function main() {
	console.log('Starting deploySBTFactory script on sbt-tokens...')

	const [signer] = await ethers.getSigners()
	console.log('Signer is: ', signer.address)
	console.log()

	// >>> Deploy SBTFactory >>>
	console.log('Deploying SBTFactory...')
	const sbtFactoryFactory = await ethers.getContractFactory('SBTFactory')
	const sbtFactoryInstance = await sbtFactoryFactory.deploy()
	const sbtFactoryInstanceDeployTxn = sbtFactoryInstance.deployTransaction
	console.log(
		` - SBTFactory deploying at txn:${sbtFactoryInstanceDeployTxn.hash}`
	)
	await sbtFactoryInstance.deployed()
	console.log(` - SBTFactory deployed at address:${sbtFactoryInstance.address}`)
	await sbtFactoryInstanceDeployTxn.wait(2)
	console.log()

	// >>> Verify SBTFactory code >>>
	console.log('Verifying SBT implementation contract...')
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
