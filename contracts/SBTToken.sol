// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@devprotocol/util-contracts/contracts/utils/Base64.sol";
import {ProxyAdmin} from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import {AddressLib} from "@devprotocol/util-contracts/contracts/utils/AddressLib.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

import {ISBTToken} from "./interfaces/ISBTToken.sol";
import {DecimalString} from "./libs/DecimalString.sol";

contract SBTToken is ISBTToken, ERC721EnumerableUpgradeable {
	using Base64 for bytes;
	using Strings for uint256;
	using AddressLib for address;
	using DecimalString for uint256;

	/// @dev EOA with minting rights.
	address private _minter;
	/// @dev Account with proxy adming rights.
	address private _proxyAdmin;

	/// @dev Holds the generic metadata and attribute information of a SBT token.
	mapping(uint256 => SBTData) private _sbtdata;

	modifier onlyMinter() {
		require(_minter == _msgSender(), "Illegal access");
		_;
	}

	function _setTokenURI(
		uint256 tokenId,
		string memory name,
		string memory description,
		StringAttribute[] memory stringAttributes,
		NumberAttribute[] memory numberAttributes,
		string memory tokenUriImage
	) private {
		bytes memory stringAttributesEncoded = abi.encode(stringAttributes);
		bytes memory numberAttributesEncoded = abi.encode(numberAttributes);
		SBTData memory sbtData = SBTData({
			name: name,
			image: tokenUriImage,
			description: description,
			stringAttributesEncoded: stringAttributesEncoded,
			numberAttributesEncoded: numberAttributesEncoded
		});
		_sbtdata[tokenId] = sbtData;
		emit SetSBTTokenURI(tokenId, abi.encode(sbtData, tokenUriImage));
	}

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId,
		uint256 batchSize
	) internal virtual override {
		if (from == address(0)) {
			// allow mint
			super._beforeTokenTransfer(from, to, tokenId, batchSize);
		} else if (to == address(0)) {
			// disallow burn
			revert("SBT can not burn");
		} else if (to != from) {
			// disallow transfer
			revert("SBT can not transfer");
		} else {
			// disallow other
			revert("Illegal operation");
		}
	}

	function initialize(address minter) external initializer {
		__ERC721_init("Dev Protocol SBT V1", "DEV-SBT-V1");
		_minter = minter;
	}

	function setProxyAdmin(address proxyAdmin) external {
		require(_proxyAdmin == address(0), "Already set");
		_proxyAdmin = proxyAdmin;
		emit SetProxyAdmin(proxyAdmin);
	}

	function setTokenURI(
		uint256 tokenId,
		string memory name,
		string memory description,
		StringAttribute[] memory stringAttributes,
		NumberAttribute[] memory numberAttributes,
		string memory tokenUriImage
	) external override onlyMinter {
		require(tokenId < currentIndex(), "Token not found");
		_setTokenURI(
			tokenId,
			name,
			description,
			stringAttributes,
			numberAttributes,
			tokenUriImage
		);
	}

	function mint(
		address to,
		string memory name,
		string memory description,
		StringAttribute[] memory stringAttributes,
		NumberAttribute[] memory numberAttributes,
		string memory tokenUriImage
	) external override onlyMinter returns (uint256 tokenId_) {
		uint256 currentId = currentIndex();
		_mint(to, currentId);
		emit Minted(currentId, to);
		_setTokenURI(
			currentId,
			name,
			description,
			stringAttributes,
			numberAttributes,
			tokenUriImage
		);
		return currentId;
	}

	function _tokenURI(uint256 tokenId) private view returns (string memory) {
		return string(bytes(abi.encode(_sbtdata[tokenId])));
	}

	function tokenURI(
		uint256 tokenId
	) public view override returns (string memory) {
		return _tokenURI(tokenId);
	}

	function currentIndex() public view override returns (uint256) {
		return super.totalSupply();
	}

	function owner() external view returns (address) {
		return ProxyAdmin(_proxyAdmin).owner();
	}

	function tokensOfOwner(
		address tokenOwner
	) external view override returns (uint256[] memory) {
		uint256 length = super.balanceOf(tokenOwner);
		uint256[] memory tokens = new uint256[](length);
		for (uint256 i = 0; i < length; i++) {
			tokens[i] = super.tokenOfOwnerByIndex(tokenOwner, i);
		}
		return tokens;
	}
}
