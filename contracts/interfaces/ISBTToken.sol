// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.9;

interface ISBTToken {
	/// @dev Data strucutre to represent all String attributes of the SBT.
	struct StringAttribute {
		string trait_type;
		string value;
	}

	/// @dev Data strucutre to represent all Numeric attributes of the SBT.
	struct NumberAttribute {
		string trait_type;
		string display_type;
		uint256 value;
	}

	/*
	 * @dev The event fired when a token is minted.
	 * @param tokenId The ID of the created SBT.
	 * @param owner The address of the owner of the SBT.
	 */
	event Minted(uint256 tokenId, address owner);

	/*
	 * @dev The event fired when proxy admin is set.
	 * @param _proxyAdmin The address who is set a proxy admin.
	 */
	event SetProxyAdmin(address _proxyAdmin);

	/*
	 * @dev The event fired when SBTTokenURI is updated.
	 * @param tokenId The SBT id.
	 * @param data Bytes representation of the token uri data.
	 */
	event SetSBTTokenURI(uint256 tokenId, bytes data);

	/*
	 * @dev Creates the new staking position for the caller.
	 * Mint must be called by the minter address.
	 * @param _owner The address of the owner of the new SBT.
	 * @param metadata The encoded metadata of the SBT.
	 */
	function mint(
		address _owner,
		bytes memory metadata
	) external returns (uint256);

	/*
	 * @dev Sets the token URI image for a token.
	 * @notice must be called by the minter address.
	 * @param _tokenId The token for which we are setting the image uri.
	 * @param bytes The encoded metadata of the NFT.
	 */
	function setTokenURI(uint256 _tokenId, bytes memory metadata) external;

	/*
	 * @dev Get the NFT metadata in encoded format.
	 * @param name The name of the NFT.
	 * @param description The description of the NFT.
	 * @param stringAttributes The array of all the string attributes.
	 * @param numberAttributes The array of all the number attributes.
	 * param tokenUriImage The token image data or url.
	 * @return bytes The encoded metadata bytes.
	 */
	function encodeMetadata(
		string memory name,
		string memory description,
		StringAttribute[] memory stringAttributes,
		NumberAttribute[] memory numberAttributes,
		string memory tokenUriImage
	) external pure returns (bytes memory);

	/*
	 * @dev get token ids by owner
	 * @param _owner owner address
	 * @return uint256[] token id list
	 */
	function tokensOfOwner(
		address _owner
	) external view returns (uint256[] memory);

	/*
	 * @dev get current token id
	 * @return uint256 current token id
	 */
	function currentIndex() external view returns (uint256);
}
