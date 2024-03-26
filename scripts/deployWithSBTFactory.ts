/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

import { ethers, run } from 'hardhat'
import type { ContractTransaction } from 'ethers'

async function main() {
	console.log('Starting deploySBTFactory script on sbt-tokens...')

	const [signer] = await ethers.getSigners()
	console.log('Signer is: ', signer.address)
	console.log()

	// @TODO: modify this when deploying...
	const minterUpdater = signer.address
	// @TODO: modify this when deploying...
	const minters = [signer.address]
	// @TODO: change this whenever required.
	const proxyCalldata = ethers.utils.arrayify('0x')
	// @TODO: modify this address when deploying...
	const proxyAdmin = '0xec4562C829661c891FcEadb44F831c8a5e71bC8F'
	// @TODO: check and change this whenever required.
	const identifier = ethers.utils.formatBytes32String('First SBT')
	// @TODO: check and change this whenever required.
	const sbtFactoryAddress = '0x0F0b8697169aF45FC61814C3e5b4d784a909b9A7'

	// >>> Deploy using SBTFactory >>>
	console.log('Deploying new SBT using SBTFactory...')
	const sbtFactoryInstance = await ethers.getContractAt(
		'SBTFactory',
		sbtFactoryAddress
	)
	const txn = (await sbtFactoryInstance.functions.makeNewSBT(
		proxyAdmin,
		proxyCalldata,
		minterUpdater,
		minters,
		identifier
	)) as ContractTransaction
	console.log(` - SBT deployment using SBTFactory at txn:${txn.hash}`)
	const txReceipt = await txn.wait(2)
	const logs = txReceipt.logs.map((log) =>
		sbtFactoryInstance.interface.parseLog(log)
	)
	const proxyCreationLog = logs.find((log) => log.name === 'SBTProxyCreated')
	const implementationCreationLog = logs.find(
		(log) => log.name === 'SBTImplementationCreated'
	)

	const proxyContractAddress = proxyCreationLog?.args.at(1) as string
	const implementationContractAddress = implementationCreationLog?.args.at(
		1
	) as string

	if (implementationCreationLog) {
		console.log(
			` - SBT implementation deployed at addr:${implementationContractAddress}`
		)
		console.log(' - Verifying SBT implementation contract...')
		await run(`verify:verify`, {
			address: implementationContractAddress,
			contract: 'contracts/SBT.sol:SBT',
			constructorArguments: [],
		})
	}

	if (proxyCreationLog) {
		console.log(` - SBT proxy deployed at addr:${proxyContractAddress}`)
		console.log(' - Verifying SBT proxy contract...')
		await run(`verify:verify`, {
			address: proxyContractAddress,
			contract: 'contracts/SBTProxy.sol:SBTProxy',
			constructorArguments: [
				implementationContractAddress,
				proxyAdmin,
				proxyCalldata,
			],
		})
	}

	console.log()
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
