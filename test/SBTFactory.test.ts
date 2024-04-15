import { ethers } from 'hardhat'
import { expect, use } from 'chai'
import { type Contract } from 'ethers'
import { solidity } from 'ethereum-waffle'

import { deploy, getSigners, ZERO_ADDRESS } from './utils'

use(solidity)

describe('SBTFactory', () => {
	const init = async (shouldInitialize = true): Promise<Contract> => {
		const sbtFactory = await deploy('SBTFactory')
		if (shouldInitialize) {
			await sbtFactory.initialize()
		}

		return sbtFactory
	}

	describe('initialize', () => {
		it('The initialize function should execute correctly', async () => {
			const signers = await getSigners()
			const sbtFactory = await init(false)
			expect(await sbtFactory.owner()).to.eq(ZERO_ADDRESS)
			await expect(sbtFactory.connect(signers.userA).initialize()).to.not
				.reverted
			expect(await sbtFactory.owner()).to.eq(signers.userA.address)
		})

		it('The initialize function can only be executed once', async () => {
			const signers = await getSigners()
			const sbtFactory = await init()
			expect(await sbtFactory.owner()).to.eq(signers.deployer.address)
			await expect(sbtFactory.initialize()).to.be.revertedWith(
				'Initializable: contract is already initialized'
			)
			expect(await sbtFactory.owner()).to.eq(signers.deployer.address)
		})
	})

	describe('makeNewSBT', () => {
		it('The makeNewSBT function should execute correctly', async () => {
			const signers = await getSigners()
			const sbtFactory = await init()

			const identifier = ethers.utils.formatBytes32String('SBT')
			expect(await sbtFactory.sbtProxyMapping(identifier)).to.eq(ZERO_ADDRESS)
			await expect(
				sbtFactory.makeNewSBT(
					'Test SBT',
					'TESTSBT',
					signers.proxyAdmin.address,
					ethers.utils.arrayify('0x'),
					signers.minterUpdater.address,
					[signers.minterA.address, signers.minterB.address],
					identifier
				)
			)
				.to.emit(sbtFactory, 'SBTImplementationCreated')
				.emit(sbtFactory, 'SBTProxyCreated')

			expect(await sbtFactory.sbtProxyMapping(identifier)).to.not.eq(
				ZERO_ADDRESS
			)
		})

		it('The makeNewSBT function should execute correctly if called by owner', async () => {
			const signers = await getSigners()
			const sbtFactory = await init()

			const identifier = ethers.utils.formatBytes32String('SBT')
			expect(await sbtFactory.sbtProxyMapping(identifier)).to.eq(ZERO_ADDRESS)
			await expect(
				sbtFactory
					.connect(signers.deployer)
					.makeNewSBT(
						'Test SBT',
						'TESTSBT',
						signers.proxyAdmin.address,
						ethers.utils.arrayify('0x'),
						signers.minterUpdater.address,
						[signers.minterA.address, signers.minterB.address],
						identifier
					)
			)
				.to.emit(sbtFactory, 'SBTImplementationCreated')
				.emit(sbtFactory, 'SBTProxyCreated')

			expect(await sbtFactory.sbtProxyMapping(identifier)).to.not.eq(
				ZERO_ADDRESS
			)
		})

		it('The makeNewSBT function should execute if called by non-owner', async () => {
			const signers = await getSigners()
			const sbtFactory = await init()

			const identifier = ethers.utils.formatBytes32String('SBT')
			expect(await sbtFactory.sbtProxyMapping(identifier)).to.eq(ZERO_ADDRESS)
			await expect(
				sbtFactory
					.connect(signers.minterA)
					.makeNewSBT(
						'Test SBT',
						'TESTSBT',
						signers.proxyAdmin.address,
						ethers.utils.arrayify('0x'),
						signers.minterUpdater.address,
						[signers.minterA.address, signers.minterB.address],
						identifier
					)
			)
				.to.emit(sbtFactory, 'SBTImplementationCreated')
				.emit(sbtFactory, 'SBTProxyCreated')

			expect(await sbtFactory.sbtProxyMapping(identifier)).to.not.eq(
				ZERO_ADDRESS
			)
		})
	})

	describe('renounceOwnership', () => {
		it('The renounceOwnership function should execute correctly if owner', async () => {
			const signers = await getSigners()
			const sbtFactory = await init()
			expect(await sbtFactory.owner()).to.eq(signers.deployer.address)

			await expect(sbtFactory.renounceOwnership())
				.to.emit(sbtFactory, 'OwnershipTransferred')
				.withArgs(signers.deployer.address, ZERO_ADDRESS)

			expect(await sbtFactory.owner()).to.eq(ZERO_ADDRESS)
		})

		it('The renounceOwnership function should not execute correctly if not owner', async () => {
			const signers = await getSigners()
			const sbtFactory = await init()
			expect(await sbtFactory.owner()).to.eq(signers.deployer.address)

			await expect(
				sbtFactory.connect(signers.userA).renounceOwnership()
			).to.revertedWith('Ownable: caller is not the owner')

			expect(await sbtFactory.owner()).to.eq(signers.deployer.address)
		})
	})

	describe('transferOwnership', () => {
		it('The transferOwnership function should execute correctly if owner', async () => {
			const signers = await getSigners()
			const sbtFactory = await init()
			expect(await sbtFactory.owner()).to.eq(signers.deployer.address)

			await expect(sbtFactory.transferOwnership(signers.userA.address))
				.to.emit(sbtFactory, 'OwnershipTransferred')
				.withArgs(signers.deployer.address, signers.userA.address)

			expect(await sbtFactory.owner()).to.eq(signers.userA.address)
		})

		it('The renounceOwnership function should not execute correctly if not owner', async () => {
			const signers = await getSigners()
			const sbtFactory = await init()
			expect(await sbtFactory.owner()).to.eq(signers.deployer.address)

			await expect(
				sbtFactory
					.connect(signers.userA)
					.transferOwnership(signers.userA.address)
			).to.revertedWith('Ownable: caller is not the owner')

			expect(await sbtFactory.owner()).to.eq(signers.deployer.address)
		})
	})
})
