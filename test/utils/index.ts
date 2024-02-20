/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { ethers } from 'hardhat'
import type { Contract } from 'ethers'
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

export const deploy = async (name: string): Promise<Contract> => {
	const factoryStrage = await ethers.getContractFactory(name)
	const contract = await factoryStrage.deploy()
	await contract.deployed()
	return contract
}

export const deployWithArg = async (
	name: string,
	arg: number | string
): Promise<Contract> => {
	const factory = await ethers.getContractFactory(name)
	const contract = await factory.deploy(arg)
	await contract.deployed()
	return contract
}

export const deployWith2Arg = async (
	name: string,
	arg1: number | string,
	arg2: number | string | Uint8Array
): Promise<Contract> => {
	const factory = await ethers.getContractFactory(name)
	const contract = await factory.deploy(arg1, arg2)
	await contract.deployed()
	return contract
}

export const deployWith3Arg = async (
	name: string,
	arg1: number | string,
	arg2: number | string,
	arg3: number | string | Uint8Array
): Promise<Contract> => {
	const factory = await ethers.getContractFactory(name)
	const contract = await factory.deploy(arg1, arg2, arg3)
	await contract.deployed()
	return contract
}

type Signers = {
	deployer: SignerWithAddress
	proxyAdmin: SignerWithAddress
	userA: SignerWithAddress
	userB: SignerWithAddress
	minterUpdater: SignerWithAddress
	minterA: SignerWithAddress
	minterB: SignerWithAddress
}

export const getSigners = async (): Promise<Signers> => {
	const [deployer, proxyAdmin, userA, userB, minterUpdater, minterA, minterB] =
		await ethers.getSigners()
	return { deployer, proxyAdmin, userA, userB, minterUpdater, minterA, minterB }
}
