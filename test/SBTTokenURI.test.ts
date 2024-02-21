/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import { expect, use } from 'chai'
import { type Contract } from 'ethers'
import { solidity } from 'ethereum-waffle'

import { deploy, getEncodedMetadata, getSigners } from './utils'

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

	describe('setTokenURI', () => {
		it('The setTokenURI function should function correctly for no attributes', async () => {
			const sbt = await init()
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
				.withArgs(0, signers.userA.address)

			const uri = await sbt.tokenURI(0)
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
			const sbt = await init()
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
				.withArgs(0, signers.userA.address)

			const uri = await sbt.tokenURI(0)
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
			const sbt = await init()
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
				.withArgs(0, signers.userA.address)

			const uri = await sbt.tokenURI(0)
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
			const sbt = await init()
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
				.withArgs(0, signers.userA.address)

			const uri = await sbt.tokenURI(0)
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
			const sbt = await init()
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
					{ trait_type: 'Gas fee used', value: 12342, display_type: 'number' },
				],
			}
			const encodedMetadata = await getEncodedMetadata(sbt, metadata)
			await expect(
				sbt
					.connect(signers.minterA)
					.mint(signers.userA.address, encodedMetadata)
			)
				.to.emit(sbt, 'Minted')
				.withArgs(0, signers.userA.address)

			const uri = await sbt.tokenURI(0)
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
				{ trait_type: 'Gas fee used', value: '12342', display_type: 'number' },
			])
		})

		it('The setTokenURI function should function correctly for only 1 string attribute and 1 number attribute', async () => {
			const sbt = await init()
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
				.withArgs(0, signers.userA.address)

			const uri = await sbt.tokenURI(0)
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
			const sbt = await init()
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
					{ trait_type: 'Gas fee used', value: 12342, display_type: 'number' },
				],
			}
			const encodedMetadata = await getEncodedMetadata(sbt, metadata)
			await expect(
				sbt
					.connect(signers.minterA)
					.mint(signers.userA.address, encodedMetadata)
			)
				.to.emit(sbt, 'Minted')
				.withArgs(0, signers.userA.address)

			const uri = await sbt.tokenURI(0)
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
				{ trait_type: 'Gas fee used', value: '12342', display_type: 'number' },
			])
		})
	})
})
