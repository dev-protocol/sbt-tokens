// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

interface ISBTFactory {
	/*
	 * @dev makes new SBT contract which is upgradeable.
	 * @param sbtName The name of the SBT token to be created.
	 * @param sbtSymbol The symbol of the SBT token to be created.
	 * @param proxyAdmin owner of the proxy contract which will be deployed.
	 * @param proxyCallData the data which denotes function calls, etc when deploying new proxy contract.
	 * @param  minterUpdater the address which can add/remove minter access eoa.
	 * @param minters the array of minters which have rights to mint new sbts.
	 * @param identifier unique bytes to identify a deployed sbt proxy.
	 * @return uint256[] token id list
	 */
	function makeNewSBT(
		string memory sbtName,
		string memory sbtSymbol,
		address proxyAdmin,
		bytes memory proxyCallData,
		address minterUpdater,
		address[] calldata minters,
		bytes calldata identifier
	) external returns (address);
}
