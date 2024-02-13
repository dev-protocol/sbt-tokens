// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.9;

interface ISBTToken {
	/*
	 * @dev The event fired when a token is minted.
	 * @param tokenId The ID of the created new staking position
	 * @param owner The address of the owner of the new staking position
	 */
	event Minted(uint256 tokenId, address owner);

	/*
	 * @dev Creates the new staking position for the caller.
	 * Mint must be called by the minter address.
	 * @param _owner The address of the owner of the new staking position
	 */
	function mint(address _owner) external returns (uint256);

	/*
	 * @dev Sets the token URI image for a token.
	 * @notice must be called by the minter address.
	 * @param _tokenId The token for which we are setting the image uri.
	 * @param _data The data that is used as uri.
	 */
	function setTokenURIImage(uint256 _tokenId, string memory _data) external;

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
