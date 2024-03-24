// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {SBT} from "./SBT.sol";
import {SBTProxy} from "./SBTProxy.sol";

contract SBTFactory is Ownable {
	mapping(bytes => address) public sbtProxyMapping;

	event SBTProxyCreated(bytes indexed identifier, address sbtProxyAddress);
	event SBTImplementationCreated(
		bytes indexed identifier,
		address sbtProxyAddress
	);

	constructor() {}

	function makeNewSBT(
		address proxyAdmin,
		bytes memory proxyCallData,
		address minterUpdater,
		address[] calldata minters,
		bytes calldata identifier
	) external onlyOwner returns (address) {
		// Create the implementation.
		address implementation = address(
			new SBT{salt: keccak256(identifier)}()
		);
		emit SBTImplementationCreated(identifier, address(implementation));

		// Create the proxy.
		address proxy = address(
			new SBTProxy{salt: keccak256(identifier)}(
				address(implementation),
				proxyAdmin,
				proxyCallData
			)
		);
		emit SBTProxyCreated(identifier, proxy);

		// Save the proxy created in mapping.
		sbtProxyMapping[identifier] = address(proxy);

		// Initialize the proxy.
		SBT(proxy).initialize(minterUpdater, minters);

		return address(proxy);
	}
}
