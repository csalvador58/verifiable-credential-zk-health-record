// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/Counters.sol";

contract SoulboundMedicalRecord is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    event NewRecord(address indexed owner, uint256 indexed tokenId);
    event RecordDeleted(address indexed owner, uint256 indexed tokenId);

    constructor() ERC721("SoulboundMedicalRecord", "HMS") {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(
        address from,
        address to
        // uint256 tokenId
    ) internal virtual {
        require(from == address(0) || to == address(0), "SoulboundMedicalRecord: token is non-transferrable");
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        if(from == address(0)) {
            emit NewRecord(to, tokenId);
        } else if(to == address(0)) {
            emit RecordDeleted(from, tokenId);
        }
    } 

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "SoulboundMedicalRecord: caller is not owner of token");
        _burn(tokenId);
    }

    function revoke(uint256 tokenId) onlyOwner external {
        _burn(tokenId);
    }

     

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}