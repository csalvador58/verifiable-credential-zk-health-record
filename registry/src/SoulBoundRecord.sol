// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/access/AccessControl.sol";

contract SoulboundRecord is
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");


    event NewRecord(address indexed owner, uint256 indexed tokenId);
    event RecordDeleted(address indexed owner, uint256 indexed tokenId);

    constructor() ERC721("SoulboundRecord", "HMS") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri
    ) public onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // function to grant minting role to another address
    function grantMinterRole(
        address minter
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }

    // function to revoke minting role from an address
    function revokeMinterRole(
        address minter
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }

    // function to grant admin role to another address
    function grantAdminRole(address admin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // function to revoke admin role from an address
    function revokeAdminRole(
        address admin
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function _beforeTokenTransfer(
        address from,
        address to
    ) internal virtual // uint256 tokenId
    {
        require(
            from == address(0) || to == address(0),
            "SoulboundRecord: token is non-transferrable"
        );
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        if (from == address(0)) {
            emit NewRecord(to, tokenId);
        } else if (to == address(0)) {
            emit RecordDeleted(from, tokenId);
        }
    }

    // burn function only available to owner of token or admin
    function burn(uint256 tokenId) public override {
        require(
            ownerOf(tokenId) == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "SoulboundRecord: caller is not the owner of token or has an admin role"
        );
        _burn(tokenId);
    }

    // deployer can revoke any token
    function revoke(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
