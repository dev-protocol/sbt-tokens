import { ethers } from 'hardhat'
import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { type Contract, constants } from 'ethers'

import { deploy, getDummyEncodedMetadata, getSigners } from './utils'

use(solidity)

describe('SBT', () => {
	const init = async (): Promise<Contract> => {
		const signers = await getSigners()
		const sbt = await deploy('SBT')
		await sbt.initialize('Test SBT', 'TESTSBT', signers.minterUpdater.address, [
			signers.minterA.address,
			signers.minterB.address,
		])
		return sbt
	}

	describe('initialize', () => {
		it('The initialize function can only be executed once', async () => {
			const sbt = await init()
			await expect(
				sbt.initialize('Test SBT', 'TESTSBT', constants.AddressZero, [
					constants.AddressZero,
					constants.AddressZero,
				])
			).to.be.revertedWith('Initializable: contract is already initialized')
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
				sbt.connect(signers.deployer).addMinter(signers.minterC.address)
			).to.revertedWith('Not minter updater')

			await expect(
				sbt.connect(signers.userA).addMinter(signers.minterC.address)
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
				sbt.connect(signers.deployer).removeMinter(signers.minterA.address)
			).to.revertedWith('Not minter updater')

			await expect(
				sbt.connect(signers.userA).removeMinter(signers.minterA.address)
			).to.revertedWith('Not minter updater')
		})
	})

	describe('mint', () => {
		it('The mint function should function correctly', async () => {
			const sbt = await init()
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
			const sbt = await init()
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
				sbt.connect(signers.minterUpdater).mint(signers.userA.address, metadata)
			).to.be.revertedWith('Illegal access')

			const tokensOfUserA = await sbt.tokensOfOwner(signers.userA.address)
			expect(tokensOfUserA.length).to.eq(0)
			expect(await sbt.totalSupply()).to.eq(0)
			expect(await sbt.currentIndex()).to.eq(0)
			expect(await sbt.balanceOf(signers.userA.address)).to.eq(0)
		})

		it('The mint function can be executed by all minters and new minters', async () => {
			const sbt = await init()
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
			const sbt = await init()
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
			const sbt = await init()
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
		it('The transfer function should not work if owner', async () => {
			const sbt = await init()
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
			const sbt = await init()
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
			const sbt = await init()
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
		it('The transfer to address(0) should not work if owner', async () => {
			const sbt = await init()
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
			const sbt = await init()
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
			const sbt = await init()
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
		it('The safeTransfer function should not work if owner', async () => {
			const sbtContractFactory = await ethers.getContractFactory('SBT')
			const sbt = sbtContractFactory.attach((await init()).address)
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
			const sbt = await init()
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
			const sbt = await init()
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
		it('The setTokenURI function can be executed by minter', async () => {
			const sbt = await init()
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
			const sbt = await init()
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
			const sbt = await init()
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
			const sbt = await init()
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
			const sbt = await init()
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
