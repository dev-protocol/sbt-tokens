// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {ProxyAdmin} from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

import {ISBTToken} from "./interfaces/ISBTToken.sol";

contract SBTToken is ISBTToken, ERC721EnumerableUpgradeable {
	/// @dev EOA with minting rights.
	address private minter;
	/// @dev Account with proxy adming rights.
	address private proxyAdmin;
	/// @dev Holds the URI information of a SBT token.
	mapping(uint256 => string) private tokenUriImage;

	modifier onlyMinter() {
		require(minter == _msgSender(), "Illegal access");
		_;
	}

	event SetProxyAdmin(address _proxyAdmin);

	function initialize(address _minter) external initializer {
		__ERC721_init("Dev Protocol SBT V1", "DEV-SBT-V1");
		minter = _minter;
	}

	function setProxyAdmin(address _proxyAdmin) external {
		require(proxyAdmin == address(0), "Already set");
		proxyAdmin = _proxyAdmin;
		emit SetProxyAdmin(_proxyAdmin);
	}

	function setTokenURIImage(
		uint256 _tokenId,
		string memory _data
	) external override onlyMinter {
		tokenUriImage[_tokenId] = _data;
	}

	function mint(
		address _owner
	) external override onlyMinter returns (uint256 tokenId_) {
		uint256 currentId = this.currentIndex();
		_mint(_owner, currentId);
		emit Minted(currentId, _owner);
		return currentId;
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

	function _tokenURI(uint256 _tokenId) private view returns (string memory) {
		return tokenUriImage[_tokenId];
	}

	function owner() external view returns (address) {
		return ProxyAdmin(proxyAdmin).owner();
	}

	function tokenURI(
		uint256 _tokenId
	) public view override returns (string memory) {
		return _tokenURI(_tokenId);
	}

	function currentIndex() external view override returns (uint256) {
		return super.totalSupply();
	}

	function tokensOfOwner(
		address _owner
	) external view override returns (uint256[] memory) {
		uint256 length = super.balanceOf(_owner);
		uint256[] memory tokens = new uint256[](length);
		for (uint256 i = 0; i < length; i++) {
			tokens[i] = super.tokenOfOwnerByIndex(_owner, i);
		}
		return tokens;
	}
}
