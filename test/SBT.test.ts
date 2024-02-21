/* eslint-disable @typescript-eslint/naming-convention */

import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { type Contract, constants } from 'ethers'

import { deploy, getSigners } from './utils'

use(solidity)

describe('SBT', () => {
	const init = async (): Promise<Contract> => {
		const signers = await getSigners()
		const sbt = await deploy('SBT')
		await sbt.initialize(signers.minterUpdater.address, [
			signers.minterA.address,
			signers.minterB.address,
		])
		return sbt
	}

	describe('initialize', () => {
		it('The initialize function can only be executed once', async () => {
			const sbt = await init()
			await expect(
				sbt.initialize(constants.AddressZero, [
					constants.AddressZero,
					constants.AddressZero,
				])
			).to.be.revertedWith('Initializable: contract is already initialized')
		})
	})

	describe('setProxyAdmin', () => {
		it('The setProxyAdmin function should execute once', async () => {
			const sbt = await init()
			const signers = await getSigners()
			await expect(sbt.setProxyAdmin(signers.proxyAdmin.address))
				.to.emit(sbt, 'SetProxyAdmin')
				.withArgs(signers.proxyAdmin.address)
		})

		it('The setProxyAdmin function can only be executed once', async () => {
			const sbt = await init()
			const signers = await getSigners()
			await sbt.setProxyAdmin(signers.proxyAdmin.address)
			await expect(
				sbt.setProxyAdmin(signers.proxyAdmin.address)
			).to.be.revertedWith('Already set')
		})
	})

	describe('addMinter', () => {
		it('The addMinter function can be executed by minterUpdater', async () => {
			const sbt = await init()
			const signers = await getSigners()
			await expect(
				sbt.connect(signers.minterUpdater).addMinter(signers.minterC.address)
			)
				.to.emit(sbt, 'MinterAdded')
				.withArgs(signers.minterC.address)
		})

		it('The addMinter function can only be executed by minterUpdater', async () => {
			const sbt = await init()
			const signers = await getSigners()
			await expect(sbt.addMinter(signers.minterC.address)).to.revertedWith(
				'Not minter updater'
			)

			await expect(
				sbt.connect(signers.proxyAdmin).addMinter(signers.minterC.address)
			).to.revertedWith('Not minter updater')
		})
	})

	describe('removeMinter', () => {
		it('The removeMinter function can be executed by minterUpdater', async () => {
			const sbt = await init()
			const signers = await getSigners()
			await expect(
				sbt.connect(signers.minterUpdater).removeMinter(signers.minterA.address)
			)
				.to.emit(sbt, 'MinterRemoved')
				.withArgs(signers.minterA.address)
		})

		it('The removeMinter function can only be executed by minterUpdater', async () => {
			const sbt = await init()
			const signers = await getSigners()
			await expect(sbt.removeMinter(signers.minterA.address)).to.revertedWith(
				'Not minter updater'
			)

			await expect(
				sbt.connect(signers.proxyAdmin).removeMinter(signers.minterA.address)
			).to.revertedWith('Not minter updater')
		})
	})

	describe('mint', () => {
		it('The mint function should function correctly', async () => {
			const sbt = await init()
			const signers = await getSigners()

			const metadata = sbt.encodeMetadata(
				"Proof of service",
				"This is a proof of service NFT",
				[{"trait_type": "A", value: "A"}],
				[{"trait_type": "1", display_type: "number", value: "1"}],
				"XYZURL"
			)
			await expect(
				sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
			)
				.to.emit(sbt, 'Minted')
				.withArgs(0, signers.userA.address)
		})

		it('The mint function can be executed by minter', async () => {
			const sbt = await init()
			const signers = await getSigners()

			const metadata = sbt.encodeMetadata(
				"Proof of service",
				"This is a proof of service NFT",
				[{"trait_type": "A", value: "A"}],
				[{"trait_type": "1", display_type: "number", value: "1"}],
				"XYZURL"
			)
			await expect(
				sbt.connect(signers.userA).mint(signers.userA.address, metadata)
			)
				.to.be.revertedWith('Illegal access')

			await expect(
				sbt.connect(signers.deployer).mint(signers.userA.address, metadata)
			)
				.to.be.revertedWith('Illegal access')

			await expect(
				sbt.connect(signers.proxyAdmin).mint(signers.userA.address, metadata)
			)
				.to.be.revertedWith('Illegal access')

			await expect(
				sbt.connect(signers.minterUpdater).mint(signers.userA.address, metadata)
			)
				.to.be.revertedWith('Illegal access')
		})
	})
})
