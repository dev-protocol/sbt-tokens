// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@devprotocol/util-contracts/contracts/utils/Base64.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

import {ISBT} from "./interfaces/ISBT.sol";

contract SBT is ISBT, ERC721EnumerableUpgradeable {
	using Base64 for bytes;
	using Strings for uint256;

	/// @dev EOA with rights to allow(add)/disallow(remove) minter.
	address private _minterUpdater;

	/// @dev EOA with minting rights.
	mapping(address => bool) private _minters;
	/// @dev Holds the encoded metadata of a SBT token.
	mapping(uint256 => bytes) private _sbtdata;

	modifier onlyMinter() {
		require(_minters[_msgSender()], "Illegal access");
		_;
	}

	modifier onlyMinterUpdater() {
		require(_msgSender() == _minterUpdater, "Not minter updater");
		_;
	}

	function _setTokenURI(uint256 tokenId, bytes memory metadata) private {
		_sbtdata[tokenId] = metadata;
		emit SetSBTTokenURI(tokenId, metadata);
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

	function initialize(
		address minterUpdater,
		address[] memory minters
	) external initializer {
		__ERC721_init("Dev Protocol SBT V1", "DEV-SBT-V1");

		_minterUpdater = minterUpdater;
		for (uint256 i = 0; i < minters.length; i++) {
			_minters[minters[i]] = true;
		}
	}

	function addMinter(address minter) external override onlyMinterUpdater {
		_minters[minter] = true;
		emit MinterAdded(minter);
	}

	function removeMinter(address minter) external override onlyMinterUpdater {
		_minters[minter] = false;
		emit MinterRemoved(minter);
	}

	function setTokenURI(
		uint256 tokenId,
		bytes memory metadata
	) external override onlyMinter {
		require(tokenId < currentIndex(), "Token not found");
		_setTokenURI(tokenId, metadata);
	}

	function mint(
		address to,
		bytes memory metadata
	) external override onlyMinter returns (uint256 tokenId_) {
		uint256 currentId = currentIndex();
		_mint(to, currentId);
		emit Minted(currentId, to);
		_setTokenURI(currentId, metadata);
		return currentId;
	}

	function _tokenURI(uint256 tokenId) private view returns (string memory) {
		require(tokenId < currentIndex(), "Token not found");

		(
			string memory name,
			string memory description,
			string memory tokenUriImage,
			StringAttribute[] memory stringAttributes,
			NumberAttribute[] memory numberAttributes
		) = abi.decode(
				metadataOf(tokenId),
				(string, string, string, StringAttribute[], NumberAttribute[])
			);

		bool isStringDataPresent = false;
		string memory sbtAttributes = "";

		for (uint256 i = 0; i < stringAttributes.length; i++) {
			string memory attributeInString = string(
				abi.encodePacked(
					// solhint-disable-next-line quotes
					'{"trait_type":"',
					stringAttributes[i].trait_type,
					// solhint-disable-next-line quotes
					'",',
					// solhint-disable-next-line quotes
					'"value":"',
					stringAttributes[i].value,
					// solhint-disable-next-line quotes
					'"}'
				)
			);

			if (i == 0) {
				isStringDataPresent = true;
				sbtAttributes = attributeInString;
			} else {
				sbtAttributes = string(
					abi.encodePacked(sbtAttributes, ",", attributeInString)
				);
			}
		}

		for (uint256 i = 0; i < numberAttributes.length; i++) {
			string memory attributeInString = string(
				abi.encodePacked(
					// solhint-disable-next-line quotes
					'{"trait_type":"',
					numberAttributes[i].trait_type,
					// solhint-disable-next-line quotes
					'",',
					// solhint-disable-next-line quotes
					'"display_type":"',
					numberAttributes[i].display_type,
					// solhint-disable-next-line quotes
					'",',
					// solhint-disable-next-line quotes
					'"value":"',
					numberAttributes[i].value.toString(),
					// solhint-disable-next-line quotes
					'"}'
				)
			);

			if (i == 0 && !isStringDataPresent) {
				sbtAttributes = attributeInString;
			} else {
				sbtAttributes = string(
					abi.encodePacked(sbtAttributes, ",", attributeInString)
				);
			}
		}

		sbtAttributes = string(abi.encodePacked("[", sbtAttributes, "]"));

		return
			string(
				abi.encodePacked(
					"data:application/json;base64,",
					abi
						.encodePacked(
							// solhint-disable-next-line quotes
							'{"name":"',
							name,
							// solhint-disable-next-line quotes
							'","description":"',
							description,
							// solhint-disable-next-line quotes
							'","image":"',
							tokenUriImage,
							// solhint-disable-next-line quotes
							'","attributes":',
							sbtAttributes,
							"}"
						)
						.encode()
				)
			);
	}

	function encodeMetadata(
		string memory name,
		string memory description,
		StringAttribute[] memory stringAttributes,
		NumberAttribute[] memory numberAttributes,
		string memory tokenUriImage
	) public pure override returns (bytes memory) {
		return
			abi.encode(
				name,
				description,
				tokenUriImage,
				stringAttributes,
				numberAttributes
			);
	}

	function tokenURI(
		uint256 tokenId
	) public view override returns (string memory) {
		return _tokenURI(tokenId);
	}

	function currentIndex() public view override returns (uint256) {
		return super.totalSupply();
	}

	function metadataOf(
		uint256 tokenId
	) public view override returns (bytes memory) {
		require(tokenId < currentIndex(), "Token not found");
		return _sbtdata[tokenId];
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
