/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import { ethers } from 'hardhat'
import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { type Contract, constants } from 'ethers'

import {
	deploy,
	getDummyEncodedMetadata,
	getSigners,
	deployWithArgs,
	getEncodedMetadata,
} from './utils'

use(solidity)

describe('SBTProxy', () => {
	const init = async (shouldAlsoInitializeProxy = true): Promise<{
		sbt: Contract
		sbtImplementation: Contract
		sbtProxy: Contract
		sbtImplementationB: Contract
	}> => {
		const signers = await getSigners()
		const sbtImplementation = await deploy('SBT')
		const sbtImplementationB = await deploy('SBT')
		const sbtProxy = await deployWithArgs('SBTProxy', [
			sbtImplementation.address,
			signers.proxyAdmin.address,
			ethers.utils.arrayify('0x'),
		])
		const sbt = sbtImplementation.attach(sbtProxy.address)
		if (shouldAlsoInitializeProxy) {
			await sbt.initialize(signers.minterUpdater.address, [
				signers.minterA.address,
				signers.minterB.address,
			])
		}

		return { sbt, sbtImplementation, sbtProxy, sbtImplementationB }
	}

	describe('----SBT proxy tests------------', () => {
		describe('admin', () => {
			it('Should return admin correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy } = await init()
				expect(sbt.address).to.eq(sbtProxy.address)
				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.admin()
				).to.eq(signers.proxyAdmin.address)
			})

			it('Should not return admin correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy } = await init()
				expect(sbt.address).to.eq(sbtProxy.address)
				await expect(sbtProxy.connect(signers.userA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.userB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterC).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterUpdater).callStatic.admin())
					.to.reverted
				await expect(sbtProxy.connect(signers.deployer).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.proxyAdminB).callStatic.admin())
					.to.reverted
			})
		})

		describe('implementation', () => {
			it('Should return admin correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy, sbtImplementation } = await init()
				expect(sbt.address).to.eq(sbtProxy.address)
				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementation.address)
			})

			it('Should not return implementation correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy } = await init()
				expect(sbt.address).to.eq(sbtProxy.address)
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
			})
		})

		describe('changeAdmin', () => {
			it('Should changeAdmin correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy } = await init()
				expect(sbt.address).to.eq(sbtProxy.address)
				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.admin()
				).to.eq(signers.proxyAdmin.address)
				await expect(sbtProxy.connect(signers.proxyAdminB).callStatic.admin())
					.to.reverted
				await expect(sbtProxy.connect(signers.userA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.userB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterUpdater).callStatic.admin())
					.to.reverted
				await expect(sbtProxy.connect(signers.minterA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterC).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.deployer).callStatic.admin()).to
					.reverted

				await expect(
					sbtProxy
						.connect(signers.proxyAdmin)
						.changeAdmin(signers.proxyAdminB.address)
				)
					.to.emit(sbtProxy, 'AdminChanged')
					.withArgs(signers.proxyAdmin.address, signers.proxyAdminB.address)

				expect(
					await sbtProxy.connect(signers.proxyAdminB).callStatic.admin()
				).to.eq(signers.proxyAdminB.address)
				await expect(sbtProxy.connect(signers.proxyAdmin).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.userA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.userB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterUpdater).callStatic.admin())
					.to.reverted
				await expect(sbtProxy.connect(signers.minterA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterC).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.deployer).callStatic.admin()).to
					.reverted
			})

			it('Should not changeAdmin correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy } = await init()
				expect(sbt.address).to.eq(sbtProxy.address)
				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.admin()
				).to.eq(signers.proxyAdmin.address)
				await expect(sbtProxy.connect(signers.proxyAdminB).callStatic.admin())
					.to.reverted
				await expect(sbtProxy.connect(signers.userA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.userB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterUpdater).callStatic.admin())
					.to.reverted
				await expect(sbtProxy.connect(signers.minterA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterC).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.deployer).callStatic.admin()).to
					.reverted

				await expect(
					sbtProxy
						.connect(signers.proxyAdminB)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.deployer)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.userA)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.userB)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterUpdater)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterA)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterB)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterC)
						.changeAdmin(signers.proxyAdminB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)

				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.admin()
				).to.eq(signers.proxyAdmin.address)
				await expect(sbtProxy.connect(signers.proxyAdminB).callStatic.admin())
					.to.reverted
				await expect(sbtProxy.connect(signers.userA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.userB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterUpdater).callStatic.admin())
					.to.reverted
				await expect(sbtProxy.connect(signers.minterA).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterB).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.minterC).callStatic.admin()).to
					.reverted
				await expect(sbtProxy.connect(signers.deployer).callStatic.admin()).to
					.reverted
			})
		})

		describe('upgradeTo', () => {
			it('Should upgradeTo correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy, sbtImplementation, sbtImplementationB } =
					await init()
				expect(sbt.address).to.eq(sbtProxy.address)
				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementation.address)
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted

				await expect(
					sbtProxy
						.connect(signers.proxyAdmin)
						.upgradeTo(sbtImplementationB.address)
				)
					.to.emit(sbtProxy, 'Upgraded')
					.withArgs(sbtImplementationB.address)

				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementationB.address)
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted
			})

			it('Should not upgradeTo correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy, sbtImplementation, sbtImplementationB } =
					await init()
				expect(sbt.address).to.eq(sbtProxy.address)
				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementation.address)
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted

				await expect(
					sbtProxy
						.connect(signers.proxyAdminB)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.deployer)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy.connect(signers.userA).upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy.connect(signers.userB).upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterUpdater)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterA)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterB)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterC)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)

				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementation.address)
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted
			})
		})

		describe('upgradeToAndCall', () => {
			it('Should upgradeToAndCall (upgrade and initialize smart-contract) correctly if signer is proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy, sbtImplementation, sbtImplementationB } =
					await init(false)
				expect(sbt.address).to.eq(sbtProxy.address)
				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementation.address)
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted

				const encodedData = sbtImplementationB
					.connect(signers.minterUpdater)
					.interface.encodeFunctionData('initialize', [
						signers.minterUpdater.address,
						[
							signers.minterA.address,
							signers.minterB.address,
						]
					])
				await expect(
					sbtProxy
						.connect(signers.proxyAdmin)
						.upgradeToAndCall(sbtImplementationB.address, encodedData)
				)
					.to.emit(sbtProxy, 'Upgraded')
					.withArgs(sbtImplementationB.address)

				await expect(sbt.connect(signers.userA).initialize(signers.minterUpdater.address, [
					signers.minterA.address,
					signers.minterB.address,
				])).to.revertedWith('Initializable: contract is already initialized')

				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementationB.address)
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted
			})

			it('Should not upgradeToAndCall (upgrade and initialize smart-contract) correctly if signer is not proxyAdmin', async () => {
				const signers = await getSigners()
				const { sbt, sbtProxy, sbtImplementation, sbtImplementationB } =
					await init(false)
				expect(sbt.address).to.eq(sbtProxy.address)
				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementation.address)
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted

				const encodedData = sbtImplementationB
				.connect(signers.minterUpdater)
				.interface.encodeFunctionData('initialize', [
					signers.minterUpdater.address,
					[
						signers.minterA.address,
						signers.minterB.address,
					]
				])
				await expect(
					sbtProxy
						.connect(signers.proxyAdminB)
						.upgradeToAndCall(sbtImplementationB.address, encodedData)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(sbt.connect(signers.userA).initialize(signers.minterUpdater.address, [
					signers.minterA.address,
					signers.minterB.address,
				])).to.not.reverted
				await expect(sbt.connect(signers.userA).initialize(signers.minterUpdater.address, [
					signers.minterA.address,
					signers.minterB.address,
				])).to.revertedWith('Initializable: contract is already initialized')

				await expect(
					sbtProxy
						.connect(signers.deployer)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy.connect(signers.userA).upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy.connect(signers.userB).upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterUpdater)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterA)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterB)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)
				await expect(
					sbtProxy
						.connect(signers.minterC)
						.upgradeTo(sbtImplementationB.address)
				).to.revertedWith(
					`function selector was not recognized and there's no fallback function`
				)

				expect(
					await sbtProxy.connect(signers.proxyAdmin).callStatic.implementation()
				).to.eq(sbtImplementation.address)
				await expect(
					sbtProxy.connect(signers.proxyAdminB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.userB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterUpdater).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterA).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterB).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.minterC).callStatic.implementation()
				).to.reverted
				await expect(
					sbtProxy.connect(signers.deployer).callStatic.implementation()
				).to.reverted
			})
		})
	})

	describe('----SBT logic tests------------', () => {
		describe('initialize', () => {
			it('Proxy admin should not be able to call implementation functions', async () => {
				const { sbt } = await init()
				const { proxyAdmin } = await getSigners()

				await expect(
					sbt
						.connect(proxyAdmin)
						.initialize(constants.AddressZero, [
							constants.AddressZero,
							constants.AddressZero,
						])
				).to.be.revertedWith(
					'TransparentUpgradeableProxy: admin cannot fallback to proxy target'
				)
			})

			it('The initialize function can only be executed once', async () => {
				const { sbt } = await init()
				await expect(
					sbt.initialize(constants.AddressZero, [
						constants.AddressZero,
						constants.AddressZero,
					])
				).to.be.revertedWith('Initializable: contract is already initialized')
			})
		})

		describe('addMinter', () => {
			it('Proxy admin should not be able to call implementation functions', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				await expect(
					sbt.connect(signers.proxyAdmin).addMinter(signers.minterC.address)
				).to.be.revertedWith(
					'TransparentUpgradeableProxy: admin cannot fallback to proxy target'
				)
			})

			it('The addMinter function can be executed by minterUpdater', async () => {
				const { sbt } = await init()
				const signers = await getSigners()
				await expect(
					sbt.connect(signers.minterUpdater).addMinter(signers.minterC.address)
				)
					.to.emit(sbt, 'MinterAdded')
					.withArgs(signers.minterC.address)
			})

			it('The addMinter function can only be executed by minterUpdater', async () => {
				const { sbt } = await init()
				const signers = await getSigners()
				await expect(sbt.addMinter(signers.minterC.address)).to.revertedWith(
					'Not minter updater'
				)

				await expect(
					sbt.connect(signers.deployer).addMinter(signers.minterC.address)
				).to.revertedWith('Not minter updater')

				await expect(
					sbt.connect(signers.userA).addMinter(signers.minterC.address)
				).to.revertedWith('Not minter updater')
			})
		})

		describe('removeMinter', () => {
			it('Proxy admin should not be able to call implementation functions', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				await expect(
					sbt.connect(signers.proxyAdmin).removeMinter(signers.minterA.address)
				).to.be.revertedWith(
					'TransparentUpgradeableProxy: admin cannot fallback to proxy target'
				)
			})

			it('The removeMinter function can be executed by minterUpdater', async () => {
				const { sbt } = await init()
				const signers = await getSigners()
				await expect(
					sbt
						.connect(signers.minterUpdater)
						.removeMinter(signers.minterA.address)
				)
					.to.emit(sbt, 'MinterRemoved')
					.withArgs(signers.minterA.address)
			})

			it('The removeMinter function can only be executed by minterUpdater', async () => {
				const { sbt } = await init()
				const signers = await getSigners()
				await expect(sbt.removeMinter(signers.minterA.address)).to.revertedWith(
					'Not minter updater'
				)

				await expect(
					sbt.connect(signers.deployer).removeMinter(signers.minterA.address)
				).to.revertedWith('Not minter updater')

				await expect(
					sbt.connect(signers.userA).removeMinter(signers.minterA.address)
				).to.revertedWith('Not minter updater')
			})
		})

		describe('mint', () => {
			it('Proxy admin should not be able to call implementation functions', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.proxyAdmin).mint(signers.userA.address, metadata)
				).to.be.revertedWith(
					'TransparentUpgradeableProxy: admin cannot fallback to proxy target'
				)
			})

			it('The mint function should function correctly', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const tokensOfUserA = await sbt.tokensOfOwner(signers.userA.address)
				expect(tokensOfUserA.length).to.eq(1)
				expect(tokensOfUserA[0]).to.eq(1)
				expect(await sbt.totalSupply()).to.eq(1)
				expect(await sbt.currentIndex()).to.eq(1)
				expect(await sbt.ownerOf(1)).to.eq(signers.userA.address)
				expect(await sbt.balanceOf(signers.userA.address)).to.eq(1)
				expect(await sbt.tokenOfOwnerByIndex(signers.userA.address, 0)).to.eq(1)
				expect(await sbt.tokenByIndex(0)).to.eq(1)
			})

			it('The mint function can be executed by minter', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.userA).mint(signers.userA.address, metadata)
				).to.be.revertedWith('Illegal access')

				await expect(
					sbt.connect(signers.deployer).mint(signers.userA.address, metadata)
				).to.be.revertedWith('Illegal access')

				await expect(
					sbt.connect(signers.userB).mint(signers.userA.address, metadata)
				).to.be.revertedWith('Illegal access')

				await expect(
					sbt
						.connect(signers.minterUpdater)
						.mint(signers.userA.address, metadata)
				).to.be.revertedWith('Illegal access')

				const tokensOfUserA = await sbt.tokensOfOwner(signers.userA.address)
				expect(tokensOfUserA.length).to.eq(0)
				expect(await sbt.totalSupply()).to.eq(0)
				expect(await sbt.currentIndex()).to.eq(0)
				expect(await sbt.balanceOf(signers.userA.address)).to.eq(0)
			})

			it('The mint function can be executed by all minters and new minters', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				// Execute by Minter A.
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)
				// Execute by Minter B.
				await expect(
					sbt.connect(signers.minterB).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(2, signers.userA.address)

				const tokensOfUserA = await sbt.tokensOfOwner(signers.userA.address)
				expect(tokensOfUserA.length).to.eq(2)
				expect(tokensOfUserA[0]).to.eq(1)
				expect(tokensOfUserA[1]).to.eq(2)
				expect(await sbt.totalSupply()).to.eq(2)
				expect(await sbt.currentIndex()).to.eq(2)
				expect(await sbt.ownerOf(1)).to.eq(signers.userA.address)
				expect(await sbt.ownerOf(2)).to.eq(signers.userA.address)
				expect(await sbt.balanceOf(signers.userA.address)).to.eq(2)
				expect(await sbt.tokenOfOwnerByIndex(signers.userA.address, 0)).to.eq(1)
				expect(await sbt.tokenOfOwnerByIndex(signers.userA.address, 1)).to.eq(2)
				expect(await sbt.tokenByIndex(0)).to.eq(1)
				expect(await sbt.tokenByIndex(1)).to.eq(2)
			})

			it('The mint function can be executed by all minters', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				await sbt
					.connect(signers.minterUpdater)
					.addMinter(signers.minterC.address)
				const metadata = await getDummyEncodedMetadata(sbt)
				// Execute by Minter A.
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)
				// Execute by Minter B.
				await expect(
					sbt.connect(signers.minterB).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(2, signers.userA.address)
				// Execute by Minter C.
				await expect(
					sbt.connect(signers.minterC).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(3, signers.userA.address)

				const tokensOfUserA = await sbt.tokensOfOwner(signers.userA.address)
				expect(tokensOfUserA.length).to.eq(3)
				expect(tokensOfUserA[0]).to.eq(1)
				expect(tokensOfUserA[1]).to.eq(2)
				expect(tokensOfUserA[2]).to.eq(3)
				expect(await sbt.totalSupply()).to.eq(3)
				expect(await sbt.currentIndex()).to.eq(3)
				expect(await sbt.ownerOf(1)).to.eq(signers.userA.address)
				expect(await sbt.ownerOf(2)).to.eq(signers.userA.address)
				expect(await sbt.ownerOf(3)).to.eq(signers.userA.address)
				expect(await sbt.balanceOf(signers.userA.address)).to.eq(3)
				expect(await sbt.tokenOfOwnerByIndex(signers.userA.address, 0)).to.eq(1)
				expect(await sbt.tokenOfOwnerByIndex(signers.userA.address, 1)).to.eq(2)
				expect(await sbt.tokenOfOwnerByIndex(signers.userA.address, 2)).to.eq(3)
				expect(await sbt.tokenByIndex(0)).to.eq(1)
				expect(await sbt.tokenByIndex(1)).to.eq(2)
				expect(await sbt.tokenByIndex(2)).to.eq(3)
			})

			it('The mint function should function correctly for multiple users', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				let tokensOfUserA = await sbt.tokensOfOwner(signers.userA.address)
				expect(tokensOfUserA.length).to.eq(1)
				expect(tokensOfUserA[0]).to.eq(1)
				expect(await sbt.totalSupply()).to.eq(1)
				expect(await sbt.currentIndex()).to.eq(1)
				expect(await sbt.ownerOf(1)).to.eq(signers.userA.address)
				expect(await sbt.balanceOf(signers.userA.address)).to.eq(1)
				expect(await sbt.tokenOfOwnerByIndex(signers.userA.address, 0)).to.eq(1)
				expect(await sbt.tokenByIndex(0)).to.eq(1)

				await expect(
					sbt.connect(signers.minterA).mint(signers.userB.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(2, signers.userB.address)

				// System checks
				expect(await sbt.totalSupply()).to.eq(2)
				expect(await sbt.currentIndex()).to.eq(2)
				// UserA checks
				tokensOfUserA = await sbt.tokensOfOwner(signers.userA.address)
				expect(tokensOfUserA.length).to.eq(1)
				expect(tokensOfUserA[0]).to.eq(1)
				expect(await sbt.ownerOf(1)).to.eq(signers.userA.address)
				expect(await sbt.balanceOf(signers.userA.address)).to.eq(1)
				expect(await sbt.tokenOfOwnerByIndex(signers.userA.address, 0)).to.eq(1)
				expect(await sbt.tokenByIndex(0)).to.eq(1)
				// UserB checks
				const tokensOfUserB = await sbt.tokensOfOwner(signers.userB.address)
				expect(tokensOfUserB.length).to.eq(1)
				expect(tokensOfUserB[0]).to.eq(2)
				expect(await sbt.ownerOf(2)).to.eq(signers.userB.address)
				expect(await sbt.balanceOf(signers.userB.address)).to.eq(1)
				expect(await sbt.tokenOfOwnerByIndex(signers.userB.address, 0)).to.eq(2)
				expect(await sbt.tokenByIndex(1)).to.eq(2)
			})
		})

		describe('transfer', () => {
			it('Proxy admin should not be able to call implementation functions', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await expect(
					sbt
						.connect(signers.proxyAdmin)
						.transferFrom(signers.userA.address, signers.userB.address, 1)
				).to.be.revertedWith(
					'TransparentUpgradeableProxy: admin cannot fallback to proxy target'
				)
			})

			it('The transfer function should not work if owner', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await expect(
					sbt
						.connect(signers.userA)
						.transferFrom(signers.userA.address, signers.userB.address, 1)
				).to.revertedWith('SBT can not transfer')
			})

			it('The transfer function should not work if approved user', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await sbt.connect(signers.userA).approve(signers.userB.address, 1)
				await expect(
					sbt
						.connect(signers.userB)
						.transferFrom(signers.userA.address, signers.minterA.address, 1)
				).to.revertedWith('SBT can not transfer')
			})

			it('The transfer function should not work if approved operator', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await sbt
					.connect(signers.userA)
					.setApprovalForAll(signers.userB.address, true)
				await expect(
					sbt
						.connect(signers.userB)
						.transferFrom(signers.userA.address, signers.minterA.address, 1)
				).to.revertedWith('SBT can not transfer')
			})
		})

		describe('burn', () => {
			it('Proxy admin should not be able to call implementation functions', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await expect(
					sbt
						.connect(signers.proxyAdmin)
						.transferFrom(signers.userA.address, constants.AddressZero, 1)
				).to.be.revertedWith(
					'TransparentUpgradeableProxy: admin cannot fallback to proxy target'
				)
			})

			it('The transfer to address(0) should not work if owner', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await expect(
					sbt
						.connect(signers.userA)
						.transferFrom(signers.userA.address, constants.AddressZero, 1)
				).to.revertedWith('ERC721: transfer to the zero address')
			})

			it('The transfer to address(0) should not work if approved user', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await sbt.connect(signers.userA).approve(signers.userB.address, 1)
				await expect(
					sbt
						.connect(signers.userB)
						.transferFrom(signers.userA.address, constants.AddressZero, 1)
				).to.revertedWith('ERC721: transfer to the zero address')
			})

			it('The transfer to address(0) should not work if approved operator', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await sbt
					.connect(signers.userA)
					.setApprovalForAll(signers.userB.address, true)
				await expect(
					sbt
						.connect(signers.userB)
						.transferFrom(signers.userA.address, constants.AddressZero, 1)
				).to.revertedWith('ERC721: transfer to the zero address')
			})
		})

		describe('safeTransfer', () => {
			it('Proxy admin should not be able to call implementation functions', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await expect(
					sbt
						.connect(signers.proxyAdmin)
						['safeTransferFrom(address,address,uint256)'](
							signers.userA.address,
							signers.userB.address,
							1
						)
				).to.be.revertedWith(
					'TransparentUpgradeableProxy: admin cannot fallback to proxy target'
				)
			})

			it('The safeTransfer function should not work if owner', async () => {
				const sbtContractFactory = await ethers.getContractFactory('SBT')
				const sbt = sbtContractFactory.attach((await init()).sbt.address)
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await expect(
					sbt
						.connect(signers.userA)
						['safeTransferFrom(address,address,uint256)'](
							signers.userA.address,
							signers.userB.address,
							1
						)
				).to.revertedWith('SBT can not transfer')
			})

			it('The safeTransfer function should not work if approved user', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await sbt.connect(signers.userA).approve(signers.userB.address, 1)
				await expect(
					sbt
						.connect(signers.userB)
						['safeTransferFrom(address,address,uint256)'](
							signers.userA.address,
							signers.minterA.address,
							1
						)
				).to.revertedWith('SBT can not transfer')
			})

			it('The safeTransfer function should not work if approved operator', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await sbt
					.connect(signers.userA)
					.setApprovalForAll(signers.userB.address, true)
				await expect(
					sbt
						.connect(signers.userB)
						['safeTransferFrom(address,address,uint256)'](
							signers.userA.address,
							signers.minterA.address,
							1
						)
				).to.revertedWith('SBT can not transfer')
			})
		})

		describe('setTokenURI', () => {
			it('Proxy admin should not be able to call implementation functions', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [],
					numberAttributes: [],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await expect(
					sbt.connect(signers.proxyAdmin).tokenURI(1)
				).to.be.revertedWith(
					'TransparentUpgradeableProxy: admin cannot fallback to proxy target'
				)

				const uri = await sbt.tokenURI(1)
				const uriInfo: string[] = uri.split(',')
				expect(uriInfo[0]).to.equal('data:application/json;base64')
				const decodedData = JSON.parse(
					Buffer.from(uriInfo[1], 'base64').toString()
				) as {
					name: string
					description: string
					image: string
					attributes: any[]
				}
				expect(decodedData.name).to.eq(metadata.name)
				expect(decodedData.description).to.eq(metadata.description)
				expect(decodedData.image).to.eq(metadata.tokenURIImage)
				expect(decodedData.attributes.length).to.eq(0)
			})

			it('The setTokenURI function should function correctly for no attributes', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [],
					numberAttributes: [],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const uri = await sbt.tokenURI(1)
				const uriInfo: string[] = uri.split(',')
				expect(uriInfo[0]).to.equal('data:application/json;base64')
				const decodedData = JSON.parse(
					Buffer.from(uriInfo[1], 'base64').toString()
				) as {
					name: string
					description: string
					image: string
					attributes: any[]
				}
				expect(decodedData.name).to.eq(metadata.name)
				expect(decodedData.description).to.eq(metadata.description)
				expect(decodedData.image).to.eq(metadata.tokenURIImage)
				expect(decodedData.attributes.length).to.eq(0)
			})

			it('The setTokenURI function should function correctly for only 1 string attribute and 0 number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [{ trait_type: 'Category', value: 'Category A' }],
					numberAttributes: [],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const uri = await sbt.tokenURI(1)
				const uriInfo: string[] = uri.split(',')
				expect(uriInfo[0]).to.equal('data:application/json;base64')
				const decodedData = JSON.parse(
					Buffer.from(uriInfo[1], 'base64').toString()
				) as {
					name: string
					description: string
					image: string
					attributes: any[]
				}
				expect(decodedData.name).to.eq(metadata.name)
				expect(decodedData.description).to.eq(metadata.description)
				expect(decodedData.image).to.eq(metadata.tokenURIImage)
				expect(decodedData.attributes.length).to.eq(1)
				expect(decodedData.attributes[0]).to.deep.equal({
					trait_type: 'Category',
					value: 'Category A',
				})
				expect(decodedData.attributes).to.deep.equal([
					{ trait_type: 'Category', value: 'Category A' },
				])
			})

			it('The setTokenURI function should function correctly for only 1+ string attribute and 0 number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [
						{ trait_type: 'Category', value: 'Category A' },
						{ trait_type: 'Location', value: 'Shibuya' },
						{ trait_type: 'Entity', value: 'Corporation' },
					],
					numberAttributes: [],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const uri = await sbt.tokenURI(1)
				const uriInfo: string[] = uri.split(',')
				expect(uriInfo[0]).to.equal('data:application/json;base64')
				const decodedData = JSON.parse(
					Buffer.from(uriInfo[1], 'base64').toString()
				) as {
					name: string
					description: string
					image: string
					attributes: any[]
				}
				expect(decodedData.name).to.eq(metadata.name)
				expect(decodedData.description).to.eq(metadata.description)
				expect(decodedData.image).to.eq(metadata.tokenURIImage)
				expect(decodedData.attributes.length).to.eq(3)
				expect(decodedData.attributes[0]).to.deep.equal({
					trait_type: 'Category',
					value: 'Category A',
				})
				expect(decodedData.attributes[1]).to.deep.equal({
					trait_type: 'Location',
					value: 'Shibuya',
				})
				expect(decodedData.attributes[2]).to.deep.equal({
					trait_type: 'Entity',
					value: 'Corporation',
				})
				expect(decodedData.attributes).to.deep.equal([
					{ trait_type: 'Category', value: 'Category A' },
					{ trait_type: 'Location', value: 'Shibuya' },
					{ trait_type: 'Entity', value: 'Corporation' },
				])
			})

			it('The setTokenURI function should function correctly for only 0 string attribute and 1 number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [],
					numberAttributes: [
						{
							trait_type: 'No. of contributions',
							value: 1,
							display_type: 'number',
						},
					],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const uri = await sbt.tokenURI(1)
				const uriInfo: string[] = uri.split(',')
				expect(uriInfo[0]).to.equal('data:application/json;base64')
				const decodedData = JSON.parse(
					Buffer.from(uriInfo[1], 'base64').toString()
				) as {
					name: string
					description: string
					image: string
					attributes: any[]
				}
				expect(decodedData.name).to.eq(metadata.name)
				expect(decodedData.description).to.eq(metadata.description)
				expect(decodedData.image).to.eq(metadata.tokenURIImage)
				expect(decodedData.attributes.length).to.eq(1)
				expect(decodedData.attributes[0]).to.deep.equal({
					trait_type: 'No. of contributions',
					value: '1',
					display_type: 'number',
				})
				expect(decodedData.attributes).to.deep.equal([
					{
						trait_type: 'No. of contributions',
						value: '1',
						display_type: 'number',
					},
				])
			})

			it('The setTokenURI function should function correctly for only 0 string attribute and 1+ number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [],
					numberAttributes: [
						{
							trait_type: 'No. of contributions',
							value: 1,
							display_type: 'number',
						},
						{
							trait_type: 'No. of locations',
							value: 1000,
							display_type: 'number',
						},
						{
							trait_type: 'Gas fee used',
							value: 12342,
							display_type: 'number',
						},
					],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const uri = await sbt.tokenURI(1)
				const uriInfo: string[] = uri.split(',')
				expect(uriInfo[0]).to.equal('data:application/json;base64')
				const decodedData = JSON.parse(
					Buffer.from(uriInfo[1], 'base64').toString()
				) as {
					name: string
					description: string
					image: string
					attributes: any[]
				}
				expect(decodedData.name).to.eq(metadata.name)
				expect(decodedData.description).to.eq(metadata.description)
				expect(decodedData.image).to.eq(metadata.tokenURIImage)
				expect(decodedData.attributes.length).to.eq(3)
				expect(decodedData.attributes[0]).to.deep.equal({
					trait_type: 'No. of contributions',
					value: '1',
					display_type: 'number',
				})
				expect(decodedData.attributes[1]).to.deep.equal({
					trait_type: 'No. of locations',
					value: '1000',
					display_type: 'number',
				})
				expect(decodedData.attributes[2]).to.deep.equal({
					trait_type: 'Gas fee used',
					value: '12342',
					display_type: 'number',
				})
				expect(decodedData.attributes).to.deep.equal([
					{
						trait_type: 'No. of contributions',
						value: '1',
						display_type: 'number',
					},
					{
						trait_type: 'No. of locations',
						value: '1000',
						display_type: 'number',
					},
					{
						trait_type: 'Gas fee used',
						value: '12342',
						display_type: 'number',
					},
				])
			})

			it('The setTokenURI function should function correctly for only 1 string attribute and 1 number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [{ trait_type: 'Category', value: 'Category A' }],
					numberAttributes: [
						{
							trait_type: 'No. of contributions',
							value: 1,
							display_type: 'number',
						},
					],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const uri = await sbt.tokenURI(1)
				const uriInfo: string[] = uri.split(',')
				expect(uriInfo[0]).to.equal('data:application/json;base64')
				const decodedData = JSON.parse(
					Buffer.from(uriInfo[1], 'base64').toString()
				) as {
					name: string
					description: string
					image: string
					attributes: any[]
				}
				expect(decodedData.name).to.eq(metadata.name)
				expect(decodedData.description).to.eq(metadata.description)
				expect(decodedData.image).to.eq(metadata.tokenURIImage)
				expect(decodedData.attributes.length).to.eq(2)
				expect(decodedData.attributes[0]).to.deep.equal({
					trait_type: 'Category',
					value: 'Category A',
				})
				expect(decodedData.attributes[1]).to.deep.equal({
					trait_type: 'No. of contributions',
					value: '1',
					display_type: 'number',
				})
				expect(decodedData.attributes).to.deep.equal([
					{ trait_type: 'Category', value: 'Category A' },
					{
						trait_type: 'No. of contributions',
						value: '1',
						display_type: 'number',
					},
				])
			})

			it('The setTokenURI function should function correctly for only 1+ string attribute and 1+ number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [
						{ trait_type: 'Category', value: 'Category A' },
						{ trait_type: 'Location', value: 'Shibuya' },
						{ trait_type: 'Entity', value: 'Corporation' },
					],
					numberAttributes: [
						{
							trait_type: 'No. of contributions',
							value: 1,
							display_type: 'number',
						},
						{
							trait_type: 'No. of locations',
							value: 1000,
							display_type: 'number',
						},
						{
							trait_type: 'Gas fee used',
							value: 12342,
							display_type: 'number',
						},
					],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const uri = await sbt.tokenURI(1)
				const uriInfo: string[] = uri.split(',')
				expect(uriInfo[0]).to.equal('data:application/json;base64')
				const decodedData = JSON.parse(
					Buffer.from(uriInfo[1], 'base64').toString()
				) as {
					name: string
					description: string
					image: string
					attributes: any[]
				}
				expect(decodedData.name).to.eq(metadata.name)
				expect(decodedData.description).to.eq(metadata.description)
				expect(decodedData.image).to.eq(metadata.tokenURIImage)
				expect(decodedData.attributes.length).to.eq(6)
				expect(decodedData.attributes[0]).to.deep.equal({
					trait_type: 'Category',
					value: 'Category A',
				})
				expect(decodedData.attributes[1]).to.deep.equal({
					trait_type: 'Location',
					value: 'Shibuya',
				})
				expect(decodedData.attributes[2]).to.deep.equal({
					trait_type: 'Entity',
					value: 'Corporation',
				})
				expect(decodedData.attributes[3]).to.deep.equal({
					trait_type: 'No. of contributions',
					value: '1',
					display_type: 'number',
				})
				expect(decodedData.attributes[4]).to.deep.equal({
					trait_type: 'No. of locations',
					value: '1000',
					display_type: 'number',
				})
				expect(decodedData.attributes[5]).to.deep.equal({
					trait_type: 'Gas fee used',
					value: '12342',
					display_type: 'number',
				})
				expect(decodedData.attributes).to.deep.equal([
					{ trait_type: 'Category', value: 'Category A' },
					{ trait_type: 'Location', value: 'Shibuya' },
					{ trait_type: 'Entity', value: 'Corporation' },
					{
						trait_type: 'No. of contributions',
						value: '1',
						display_type: 'number',
					},
					{
						trait_type: 'No. of locations',
						value: '1000',
						display_type: 'number',
					},
					{
						trait_type: 'Gas fee used',
						value: '12342',
						display_type: 'number',
					},
				])
			})

			it('The setTokenURI function should match offchain and onchain encodedFormat for no attributes', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [],
					numberAttributes: [],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const offChainEncodedParams = Buffer.from(
					JSON.stringify({
						name: metadata.name,
						description: metadata.description,
						image: metadata.tokenURIImage,
						attributes: [],
					})
				).toString('base64')
				const offChainEncodedMetadata = 'data:application/json;base64,'.concat(
					offChainEncodedParams
				)
				const uri = await sbt.tokenURI(1)
				expect(uri).to.deep.eq(offChainEncodedMetadata)
			})

			it('The setTokenURI function should match offchain and onchain encodedFormat for 1 string attribute and 0 number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [{ trait_type: 'Category', value: 'Category A' }],
					numberAttributes: [],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const offChainEncodedParams = Buffer.from(
					JSON.stringify({
						name: metadata.name,
						description: metadata.description,
						image: metadata.tokenURIImage,
						attributes: [{ trait_type: 'Category', value: 'Category A' }],
					})
				).toString('base64')
				const offChainEncodedMetadata = 'data:application/json;base64,'.concat(
					offChainEncodedParams
				)
				const uri = await sbt.tokenURI(1)
				expect(uri).to.deep.eq(offChainEncodedMetadata)
			})

			it('The setTokenURI function should match offchain and onchain encodedFormat for 1+ string attribute and 0 number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [
						{ trait_type: 'Category', value: 'Category A' },
						{ trait_type: 'Location', value: 'Shibuya' },
						{ trait_type: 'Entity', value: 'Corporation' },
					],
					numberAttributes: [],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const offChainEncodedParams = Buffer.from(
					JSON.stringify({
						name: metadata.name,
						description: metadata.description,
						image: metadata.tokenURIImage,
						attributes: [
							{ trait_type: 'Category', value: 'Category A' },
							{ trait_type: 'Location', value: 'Shibuya' },
							{ trait_type: 'Entity', value: 'Corporation' },
						],
					})
				).toString('base64')
				const offChainEncodedMetadata = 'data:application/json;base64,'.concat(
					offChainEncodedParams
				)
				const uri = await sbt.tokenURI(1)
				expect(uri).to.deep.eq(offChainEncodedMetadata)
			})

			it('The setTokenURI function should match offchain and onchain encodedFormat for 0 string attribute and 1 number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [],
					numberAttributes: [
						{
							trait_type: 'No. of contributions',
							value: 1,
							display_type: 'number',
						},
					],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const offChainEncodedParams = Buffer.from(
					JSON.stringify({
						name: metadata.name,
						description: metadata.description,
						image: metadata.tokenURIImage,
						attributes: [
							{
								trait_type: 'No. of contributions',
								display_type: 'number',
								value: '1',
							},
						],
					})
				).toString('base64')
				const offChainEncodedMetadata = 'data:application/json;base64,'.concat(
					offChainEncodedParams
				)
				const uri = await sbt.tokenURI(1)
				expect(uri).to.deep.eq(offChainEncodedMetadata)
			})

			it('The setTokenURI function should match offchain and onchain encodedFormat for 0 string attribute and 1+ number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [],
					numberAttributes: [
						{
							trait_type: 'No. of contributions',
							value: 1,
							display_type: 'number',
						},
						{
							trait_type: 'No. of locations',
							value: 1000,
							display_type: 'number',
						},
						{
							trait_type: 'Gas fee used',
							value: 12342,
							display_type: 'number',
						},
					],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const offChainEncodedParams = Buffer.from(
					JSON.stringify({
						name: metadata.name,
						description: metadata.description,
						image: metadata.tokenURIImage,
						attributes: [
							{
								trait_type: 'No. of contributions',
								display_type: 'number',
								value: '1',
							},
							{
								trait_type: 'No. of locations',
								display_type: 'number',
								value: '1000',
							},
							{
								trait_type: 'Gas fee used',
								display_type: 'number',
								value: '12342',
							},
						],
					})
				).toString('base64')
				const offChainEncodedMetadata = 'data:application/json;base64,'.concat(
					offChainEncodedParams
				)
				const uri = await sbt.tokenURI(1)
				expect(uri).to.deep.eq(offChainEncodedMetadata)
			})

			it('The setTokenURI function should match offchain and onchain encodedFormat for 1 string attribute and 1 number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [{ trait_type: 'Category', value: 'Category A' }],
					numberAttributes: [
						{
							trait_type: 'No. of contributions',
							value: 1,
							display_type: 'number',
						},
					],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const offChainEncodedParams = Buffer.from(
					JSON.stringify({
						name: metadata.name,
						description: metadata.description,
						image: metadata.tokenURIImage,
						attributes: [
							{ trait_type: 'Category', value: 'Category A' },
							{
								trait_type: 'No. of contributions',
								display_type: 'number',
								value: '1',
							},
						],
					})
				).toString('base64')
				const offChainEncodedMetadata = 'data:application/json;base64,'.concat(
					offChainEncodedParams
				)
				const uri = await sbt.tokenURI(1)
				expect(uri).to.deep.eq(offChainEncodedMetadata)
			})

			it('The setTokenURI function should match offchain and onchain encodedFormat for 1+ string attribute and 1+ number attribute', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = {
					name: 'Proof of service NFT',
					description:
						'This is a proof of service NFT, which indicates your contribution to the project',
					tokenURIImage:
						'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31',
					stringAttributes: [
						{ trait_type: 'Category', value: 'Category A' },
						{ trait_type: 'Location', value: 'Shibuya' },
						{ trait_type: 'Entity', value: 'Corporation' },
					],
					numberAttributes: [
						{
							trait_type: 'No. of contributions',
							value: 1,
							display_type: 'number',
						},
						{
							trait_type: 'No. of locations',
							value: 1000,
							display_type: 'number',
						},
						{
							trait_type: 'Gas fee used',
							value: 12342,
							display_type: 'number',
						},
					],
				}
				const encodedMetadata = await getEncodedMetadata(sbt, metadata)
				await expect(
					sbt
						.connect(signers.minterA)
						.mint(signers.userA.address, encodedMetadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				const offChainEncodedParams = Buffer.from(
					JSON.stringify({
						name: metadata.name,
						description: metadata.description,
						image: metadata.tokenURIImage,
						attributes: [
							{ trait_type: 'Category', value: 'Category A' },
							{ trait_type: 'Location', value: 'Shibuya' },
							{ trait_type: 'Entity', value: 'Corporation' },
							{
								trait_type: 'No. of contributions',
								display_type: 'number',
								value: '1',
							},
							{
								trait_type: 'No. of locations',
								display_type: 'number',
								value: '1000',
							},
							{
								trait_type: 'Gas fee used',
								display_type: 'number',
								value: '12342',
							},
						],
					})
				).toString('base64')
				const offChainEncodedMetadata = 'data:application/json;base64,'.concat(
					offChainEncodedParams
				)
				const uri = await sbt.tokenURI(1)
				expect(uri).to.deep.eq(offChainEncodedMetadata)
			})

			it('The setTokenURI function can be executed by minter', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				let metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				metadata = await getDummyEncodedMetadata(sbt, 'USERA')
				await expect(
					sbt.connect(signers.userA).setTokenURI(1, metadata)
				).to.be.revertedWith('Illegal access')

				metadata = await getDummyEncodedMetadata(sbt, 'USERB')
				await expect(
					sbt.connect(signers.deployer).setTokenURI(1, metadata)
				).to.be.revertedWith('Illegal access')

				metadata = await getDummyEncodedMetadata(sbt, 'USERC')
				await expect(
					sbt.connect(signers.userB).setTokenURI(1, metadata)
				).to.be.revertedWith('Illegal access')

				metadata = await getDummyEncodedMetadata(sbt, 'USERD')
				await expect(
					sbt.connect(signers.minterUpdater).setTokenURI(1, metadata)
				).to.be.revertedWith('Illegal access')
			})

			it('The setTokenURI function should function correctly', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)
				const modifiedMetadata = await getDummyEncodedMetadata(sbt, 'ABCURL')
				await expect(
					sbt.connect(signers.minterA).setTokenURI(1, modifiedMetadata)
				)
					.to.be.emit(sbt, 'SetSBTTokenURI')
					.withArgs(1, modifiedMetadata)
			})

			it('The setTokenURI function should function correctly for all minters', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)
				let modifiedMetadata = await getDummyEncodedMetadata(sbt, 'ABCURL')
				await expect(
					sbt.connect(signers.minterA).setTokenURI(1, modifiedMetadata)
				)
					.to.be.emit(sbt, 'SetSBTTokenURI')
					.withArgs(1, modifiedMetadata)

				modifiedMetadata = await getDummyEncodedMetadata(sbt, 'DEFURL')
				await expect(
					sbt.connect(signers.minterB).setTokenURI(1, modifiedMetadata)
				)
					.to.be.emit(sbt, 'SetSBTTokenURI')
					.withArgs(1, modifiedMetadata)
			})

			it('The setTokenURI function should function correctly for all minters and new minter', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				await sbt
					.connect(signers.minterUpdater)
					.addMinter(signers.minterC.address)

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)
				let modifiedMetadata = await getDummyEncodedMetadata(sbt, 'ABCURL')
				await expect(
					sbt.connect(signers.minterA).setTokenURI(1, modifiedMetadata)
				)
					.to.be.emit(sbt, 'SetSBTTokenURI')
					.withArgs(1, modifiedMetadata)

				modifiedMetadata = await getDummyEncodedMetadata(sbt, 'DEFURL')
				await expect(
					sbt.connect(signers.minterB).setTokenURI(1, modifiedMetadata)
				)
					.to.be.emit(sbt, 'SetSBTTokenURI')
					.withArgs(1, modifiedMetadata)

				modifiedMetadata = await getDummyEncodedMetadata(sbt, 'SDFSFURL')
				await expect(
					sbt.connect(signers.minterC).setTokenURI(1, modifiedMetadata)
				)
					.to.be.emit(sbt, 'SetSBTTokenURI')
					.withArgs(1, modifiedMetadata)
			})

			it('The setTokenURI function should function correctly for multiple users', async () => {
				const { sbt } = await init()
				const signers = await getSigners()

				const metadata = await getDummyEncodedMetadata(sbt)
				await expect(
					sbt.connect(signers.minterA).mint(signers.userA.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(1, signers.userA.address)

				await expect(
					sbt.connect(signers.minterA).mint(signers.userB.address, metadata)
				)
					.to.emit(sbt, 'Minted')
					.withArgs(2, signers.userB.address)

				let modifiedMetadata = await getDummyEncodedMetadata(sbt, 'UserAURL')
				await expect(
					sbt.connect(signers.minterA).setTokenURI(1, modifiedMetadata)
				)
					.to.be.emit(sbt, 'SetSBTTokenURI')
					.withArgs(1, modifiedMetadata)

				modifiedMetadata = await getDummyEncodedMetadata(sbt, 'UserBURL')
				await expect(
					sbt.connect(signers.minterB).setTokenURI(2, modifiedMetadata)
				)
					.to.be.emit(sbt, 'SetSBTTokenURI')
					.withArgs(2, modifiedMetadata)
			})
		})
	})
})
