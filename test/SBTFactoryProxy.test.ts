import { ethers } from 'hardhat'
import { expect, use } from 'chai'
import { type Contract } from 'ethers'
import { solidity } from 'ethereum-waffle'

import { deploy, getSigners, deployWithArgs, ZERO_ADDRESS } from './utils'

use(solidity)

describe('SBTFactoryProxy', () => {
	const init = async (
		shouldAlsoInitializeProxy = true
	): Promise<{
		sbtFactoryImplementation: Contract
		sbtFactoryImplementationB: Contract
		sbtFactory: Contract
		sbtFactoryProxy: Contract
	}> => {
		const signers = await getSigners()
		const sbtFactoryImplementation = await deploy('SBTFactory')
		const sbtFactoryImplementationB = await deploy('SBTFactory')
		const sbtFactoryProxy = await deployWithArgs('SBTFactoryProxy', [
			sbtFactoryImplementation.address,
			signers.proxyAdmin.address,
			ethers.utils.arrayify('0x'),
		])
		const sbtFactory = sbtFactoryImplementation.attach(sbtFactoryProxy.address)
		if (shouldAlsoInitializeProxy) {
			await sbtFactory.initialize()
		}

		return {
			sbtFactoryImplementation,
			sbtFactoryImplementationB,
			sbtFactoryProxy,
			sbtFactory,
		}
	}

	describe('----SBT proxy tests------------', () => {
		describe('admin', () => {
			it('Should return admin correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbtFactory, sbtFactoryProxy } = await init()
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				expect(
					await sbtFactoryProxy.connect(signers.proxyAdmin).callStatic.admin()
				).to.eq(signers.proxyAdmin.address)
			})

			it('Should not return admin correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbtFactory, sbtFactoryProxy } = await init()
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				await expect(sbtFactoryProxy.connect(signers.userA).callStatic.admin())
					.to.reverted
				await expect(sbtFactoryProxy.connect(signers.userB).callStatic.admin())
					.to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.minterA).callStatic.admin()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.minterB).callStatic.admin()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.minterC).callStatic.admin()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.minterUpdater).callStatic.admin()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.deployer).callStatic.admin()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.proxyAdminB).callStatic.admin()
				).to.reverted
			})
		})

		describe('implementation', () => {
			it('Should return admin correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbtFactory, sbtFactoryProxy, sbtFactoryImplementation } =
					await init()
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementation.address)
			})

			it('Should not return implementation correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbtFactory, sbtFactoryProxy } = await init()
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				await expect(
					sbtFactoryProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtFactoryProxy
						.connect(signers.minterUpdater)
						.callStatic.implementation()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtFactoryProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted
				await expect(
					sbtFactoryProxy
						.connect(signers.proxyAdminB)
						.callStatic.implementation()
				).to.reverted
			})
		})

		describe('changeAdmin', () => {
			it('Should changeAdmin correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbtFactory, sbtFactoryProxy } = await init()
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				expect(
					await sbtFactoryProxy.connect(signers.proxyAdmin).callStatic.admin()
				).to.eq(signers.proxyAdmin.address)

				await expect(
					sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.changeAdmin(signers.proxyAdminB.address)
				)
					.to.emit(sbtFactoryProxy, 'AdminChanged')
					.withArgs(signers.proxyAdmin.address, signers.proxyAdminB.address)

				expect(
					await sbtFactoryProxy.connect(signers.proxyAdminB).callStatic.admin()
				).to.eq(signers.proxyAdminB.address)
			})

			it('Should not changeAdmin correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbtFactory, sbtFactoryProxy } = await init()
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				expect(
					await sbtFactoryProxy.connect(signers.proxyAdmin).callStatic.admin()
				).to.eq(signers.proxyAdmin.address)

				await expect(
					sbtFactoryProxy
						.connect(signers.proxyAdminB)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.deployer)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.userA)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.userB)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterUpdater)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterA)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterB)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterC)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)

				expect(
					await sbtFactoryProxy.connect(signers.proxyAdmin).callStatic.admin()
				).to.eq(signers.proxyAdmin.address)
			})
		})

		describe('upgradeTo', () => {
			it('Should upgradeTo correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const {
					sbtFactory,
					sbtFactoryProxy,
					sbtFactoryImplementation,
					sbtFactoryImplementationB,
				} = await init()
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementation.address)

				await expect(
					sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.upgradeTo(sbtFactoryImplementationB.address)
				)
					.to.emit(sbtFactoryProxy, 'Upgraded')
					.withArgs(sbtFactoryImplementationB.address)

				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementationB.address)
			})

			it('Should not upgradeTo correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const {
					sbtFactory,
					sbtFactoryProxy,
					sbtFactoryImplementation,
					sbtFactoryImplementationB,
				} = await init()
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementation.address)

				await expect(
					sbtFactoryProxy
						.connect(signers.proxyAdminB)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.deployer)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.userA)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.userB)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterUpdater)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterA)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterB)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterC)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)

				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementation.address)
			})
		})

		describe('upgradeToAndCall', () => {
			it('Should upgradeToAndCall (upgrade and initialize smart-contract) correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const {
					sbtFactory,
					sbtFactoryProxy,
					sbtFactoryImplementation,
					sbtFactoryImplementationB,
				} = await init(false)

				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementation.address)

				const encodedData = sbtFactoryImplementationB
					.connect(signers.minterUpdater)
					.interface.encodeFunctionData('initialize', [])
				await expect(
					sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.upgradeToAndCall(sbtFactoryImplementationB.address, encodedData)
				)
					.to.emit(sbtFactoryProxy, 'Upgraded')
					.withArgs(sbtFactoryImplementationB.address)

				await expect(
					sbtFactory.connect(signers.userA).initialize()
				).to.revertedWith('Initializable: contract is already initialized')

				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementationB.address)
			})

			it('Should not upgradeToAndCall (upgrade and initialize smart-contract) correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const {
					sbtFactory,
					sbtFactoryProxy,
					sbtFactoryImplementation,
					sbtFactoryImplementationB,
				} = await init(false)
				expect(sbtFactory.address).to.eq(sbtFactoryProxy.address)
				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementation.address)

				const encodedData = sbtFactoryImplementationB
					.connect(signers.minterUpdater)
					.interface.encodeFunctionData('initialize', [])
				await expect(
					sbtFactoryProxy
						.connect(signers.proxyAdminB)
						.upgradeToAndCall(sbtFactoryImplementationB.address, encodedData)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(sbtFactory.connect(signers.userA).initialize()).to.not
					.reverted
				await expect(
					sbtFactory.connect(signers.userA).initialize()
				).to.revertedWith('Initializable: contract is already initialized')

				await expect(
					sbtFactoryProxy
						.connect(signers.deployer)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.userA)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.userB)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterUpdater)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterA)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterB)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtFactoryProxy
						.connect(signers.minterC)
						.upgradeTo(sbtFactoryImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)

				expect(
					await sbtFactoryProxy
						.connect(signers.proxyAdmin)
						.callStatic.implementation()
				).to.eq(sbtFactoryImplementation.address)
			})
		})
	})

	describe('----SBTFactory logic tests------------', () => {
		describe('initialize', () => {
			it('The initialize function should execute correctly', async () => {
				const signers = await getSigners()
				const { sbtFactory } = await init(false)
				expect(await sbtFactory.owner()).to.eq(ZERO_ADDRESS)
				await expect(sbtFactory.connect(signers.userA).initialize()).to.not
					.reverted
				expect(await sbtFactory.owner()).to.eq(signers.userA.address)
			})

			it('The initialize function can only be executed once', async () => {
				const signers = await getSigners()
				const { sbtFactory } = await init()
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
				const { sbtFactory } = await init()

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
				const { sbtFactory } = await init()

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
				const { sbtFactory } = await init()

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
				const { sbtFactory } = await init()
				expect(await sbtFactory.owner()).to.eq(signers.deployer.address)

				await expect(sbtFactory.renounceOwnership())
					.to.emit(sbtFactory, 'OwnershipTransferred')
					.withArgs(signers.deployer.address, ZERO_ADDRESS)

				expect(await sbtFactory.owner()).to.eq(ZERO_ADDRESS)
			})

			it('The renounceOwnership function should not execute correctly if not owner', async () => {
				const signers = await getSigners()
				const { sbtFactory } = await init()
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
				const { sbtFactory } = await init()
				expect(await sbtFactory.owner()).to.eq(signers.deployer.address)

				await expect(sbtFactory.transferOwnership(signers.userA.address))
					.to.emit(sbtFactory, 'OwnershipTransferred')
					.withArgs(signers.deployer.address, signers.userA.address)

				expect(await sbtFactory.owner()).to.eq(signers.userA.address)
			})

			it('The renounceOwnership function should not execute correctly if not owner', async () => {
				const signers = await getSigners()
				const { sbtFactory } = await init()
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
})
