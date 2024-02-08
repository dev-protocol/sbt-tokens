// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import {IERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {IERC165Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ProxyAdmin} from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import {ISBTToken} from "./interfaces/ISBTToken.sol";

contract SBTToken is
	ISBTToken,
	IERC721EnumerableUpgradeable,
	ERC721Upgradeable
{
	Counters.Counter private tokenIdCounter;

	mapping(address => EnumerableSet.UintSet) private tokenIdsMapOfOwner;
	mapping(uint256 => string) private tokenUriImage;
	address private proxyAdmin;
	/// @dev EOA with minting rights.
	address private minter;

	using Counters for Counters.Counter;
	using EnumerableSet for EnumerableSet.UintSet;

	modifier onlyMinter() {
		require(minter == _msgSender(), "illegal access");
		_;
	}

	function initialize(address _minter) external initializer {
		__ERC721_init("Dev Protocol SBT V1", "DEV-SBT-V1");
		minter = _minter;
	}

	/**
	 * @dev See {IERC165-supportsInterface}.
	 */
	function supportsInterface(
		bytes4 interfaceId
	)
		public
		view
		virtual
		override(IERC165Upgradeable, ERC721Upgradeable)
		returns (bool)
	{
		return
			interfaceId == type(IERC721EnumerableUpgradeable).interfaceId ||
			super.supportsInterface(interfaceId);
	}

	/**
	 * @dev See {IERC721Enumerable-totalSupply}.
	 */
	function totalSupply()
		public
		view
		virtual
		override(ISBTToken, IERC721EnumerableUpgradeable)
		returns (uint256)
	{
		return tokenIdCounter.current();
	}

	/**
	 * @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
	 */
	function tokenOfOwnerByIndex(
		address _owner,
		uint256 index
	)
		public
		view
		virtual
		override(ISBTToken, IERC721EnumerableUpgradeable)
		returns (uint256)
	{
		// solhint-disable-next-line reason-string
		require(
			index < tokenIdsMapOfOwner[_owner].length(),
			"ERC721Enumerable: owner index out of bounds"
		);
		return tokenIdsMapOfOwner[_owner].at(index);
	}

	/**
	 * @dev See {IERC721Enumerable-tokenByIndex}.
	 */
	function tokenByIndex(
		uint256 index
	)
		public
		view
		virtual
		override(ISBTToken, IERC721EnumerableUpgradeable)
		returns (uint256)
	{
		// solhint-disable-next-line reason-string
		require(
			index < tokenIdCounter.current(),
			"ERC721Enumerable: global index out of bounds"
		);
		return index + 1;
	}

	function owner() external view returns (address) {
		return ProxyAdmin(proxyAdmin).owner();
	}

	function setProxyAdmin(address _proxyAdmin) external {
		require(proxyAdmin == address(0), "already set");
		proxyAdmin = _proxyAdmin;
	}

	function tokenURI(
		uint256 _tokenId
	) public view override returns (string memory) {
		uint256 curretnTokenId = tokenIdCounter.current();
		require(_tokenId <= curretnTokenId, "not found");
		return _tokenURI(_tokenId);
	}

	function currentIndex() external view override returns (uint256) {
		return tokenIdCounter.current();
	}

	function mint(
		address _owner
	) external override onlyMinter returns (uint256 tokenId_) {
		tokenIdCounter.increment();
		uint256 currentId = tokenIdCounter.current();
		_mint(_owner, currentId);
		emit Minted(currentId, _owner);
		return currentId;
	}

	function setTokenURIImage(
		uint256 _tokenId,
		string memory _data
	) external override onlyMinter {
		tokenUriImage[_tokenId] = _data;
	}

	function tokensOfOwner(
		address _owner
	) external view override returns (uint256[] memory) {
		return tokenIdsMapOfOwner[_owner].values();
	}

	function _tokenURI(uint256 _tokenId) private view returns (string memory) {
		return tokenUriImage[_tokenId];
	}

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId,
		uint256 batchSize
	) internal virtual override {
		super._beforeTokenTransfer(from, to, tokenId, batchSize);

		if (from == address(0)) {
			// mint
			tokenIdsMapOfOwner[to].add(tokenId);
		} else if (to == address(0)) {
			// burn
			revert("SBT is not burned");
		} else if (to != from) {
			revert("SBT is non transferrable");
		} else {
			revert("Illegal operation");
		}
	}
}
