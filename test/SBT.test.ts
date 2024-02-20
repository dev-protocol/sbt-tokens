import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { type Contract, constants } from 'ethers'

import { deploy, getSigners } from './utils'

use(solidity)

describe('SBT', () => {
	const init = async (): Promise<Contract> => {
		const signers = await getSigners()
		const sbt = await deploy('SBT')
		await sbt.initialize(signers.proxyAdmin.address, [
			signers.minterA.address,
			signers.minterB.address,
		])
		return sbt
	}

	describe('initialize', () => {
		it('The initialize function can only be executed once.', async () => {
			const sbt = await init()

			await expect(
				sbt.initialize(constants.AddressZero, [
					constants.AddressZero,
					constants.AddressZero,
				])
			).to.be.revertedWith('Initializable: contract is already initialized')
		})
	})
})
