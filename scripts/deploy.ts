import { ethers } from 'hardhat'

async function main() {
	console.log('Starting deploy script on sbt-tokens...')

	const [signer] = await ethers.getSigners()
	console.log('Signer is: ', signer.address)

	// @TODO: modify this address when deploying...
	const proxyAdmin = '0x2e8fCbd8d3968252f1FC427Ff06928343B650bc3'

	// >>> Deploy SBT implementation >>>
	console.log('Deploying SBT implementation...')
	const sbtFactory = await ethers.getContractFactory('SBT')
	const sbtImplementation = await sbtFactory.deploy()
	await sbtImplementation.deployed()

	// >>> Deploy SBTProxy >>>
	console.log('Deploying SBT proxy...')
	const sbtProxyFactory = await ethers.getContractFactory('SBTProxy')
	const sbtProxyInstance = await sbtProxyFactory.deploy(
		sbtImplementation.address,
		proxyAdmin,
		ethers.utils.arrayify('0x')
	)
	await sbtProxyInstance.deployed()

	// >>> Initialize SBT Proxy >>>
	console.log('Initializing SBT proxy...')
	const sbtProxy = sbtFactory.attach(sbtProxyInstance.address)
	await sbtProxy.functions.initialize(signer.address, [signer.address])

	console.log('Signer:', signer.address)
	console.log('SBTProxy deployed to:', sbtProxyInstance.address)
	console.log('SBTImplementation deployed to:', sbtImplementation.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
