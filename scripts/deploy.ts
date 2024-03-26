import { ethers, run } from 'hardhat'
import { type ContractTransaction } from 'ethers'

async function main() {
	console.log('Starting deploy script on sbt-tokens...')

	const [signer] = await ethers.getSigners()
	console.log('Signer is: ', signer.address)
	console.log()

	// @TODO: modify this when deploying...
	const minterUpdater = signer.address
	// @TODO: modify this when deploying...
	const minters = [signer.address]
	// @TODO: modify this address when deploying...
	const proxyAdmin = '0xec4562C829661c891FcEadb44F831c8a5e71bC8F'

	// >>> Deploy SBT implementation >>>
	console.log('Deploying SBT implementation...')
	const sbtFactory = await ethers.getContractFactory('SBT')
	const sbtImplementation = await sbtFactory.deploy()
	const sbtImplementationDeployTxn = sbtImplementation.deployTransaction
	console.log(
		` - SBT implementation deploying at txn hash:${sbtImplementationDeployTxn.hash}`
	)
	await sbtImplementation.deployed()
	console.log(
		` - SBT implementation deployed at address:${sbtImplementation.address}`
	)
	await sbtImplementationDeployTxn.wait(2)
	console.log()

	// >>> Deploy SBTProxy >>>
	console.log('Deploying SBT proxy...')
	const sbtProxyFactory = await ethers.getContractFactory('SBTProxy')
	const sbtProxyInstance = await sbtProxyFactory.deploy(
		sbtImplementation.address,
		proxyAdmin,
		ethers.utils.arrayify('0x')
	)
	const sbtProxyInstanceDeployTxn = sbtProxyInstance.deployTransaction
	console.log(
		` - SBT proxy deploying at txn hash:${sbtProxyInstanceDeployTxn.hash}`
	)
	await sbtProxyInstance.deployed()
	console.log(` - SBT proxy deployed at address:${sbtProxyInstance.address}`)
	await sbtProxyInstanceDeployTxn.wait(2)
	console.log()

	// >>> Initialize SBT Proxy >>>
	console.log('Initializing SBT proxy...')
	const sbtProxy = sbtFactory.attach(sbtProxyInstance.address)
	const tx = (await sbtProxy.functions.initialize(
		minterUpdater,
		minters
	)) as ContractTransaction
	console.log(` - Initializing at transaction with hash:${tx.hash}`)
	await tx.wait(1)
	console.log(` - Initializing done.`)
	console.log()

	// >>> Verify SBTImplementation code >>>
	console.log('Verifying SBT implementation contract...')
	await run(`verify:verify`, {
		address: sbtImplementation.address,
		constructorArguments: [],
	})
	console.log()

	// >>> Verify SBTProxy code >>>
	console.log('Verifying SBT proxy contract...')
	await run(`verify:verify`, {
		address: sbtProxyInstance.address,
		contract: 'contracts/SBTProxy.sol:SBTProxy',
		constructorArguments: [
			sbtImplementation.address,
			proxyAdmin,
			ethers.utils.arrayify('0x'),
		],
	})
	console.log()
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
