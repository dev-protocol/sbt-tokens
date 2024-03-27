// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {SBT} from "./SBT.sol";
import {SBTProxy} from "./SBTProxy.sol";
import {ISBTFactory} from "./interfaces/ISBTFactory.sol";

contract SBTFactory is ISBTFactory, OwnableUpgradeable {
	mapping(bytes => address) public sbtProxyMapping;

	event SBTProxyCreated(bytes indexed identifier, address sbtProxyAddress);
	event SBTImplementationCreated(
		bytes indexed identifier,
		address sbtProxyAddress
	);

	function initialize() external initializer {
		__Ownable_init();
	}

	function makeNewSBT(
		address proxyAdmin,
		bytes memory proxyCallData,
		address minterUpdater,
		address[] calldata minters,
		bytes calldata identifier
	) external override onlyOwner returns (address) {
		require(
			sbtProxyMapping[identifier] == address(0),
			"Identifier already used"
		);

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
