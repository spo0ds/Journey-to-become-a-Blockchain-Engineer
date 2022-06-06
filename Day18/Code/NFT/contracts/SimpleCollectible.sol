// SPDX-License-Identifier: MIT

pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SimpleCollectible is ERC721 {
    uint256 public tokenCounter;

    constructor() public ERC721("Chase", "CHA") {}

    function createCollectible(string memory tokenURI)
        public
        returns (uint256)
    {
        uint256 newTokenID = tokenCounter;
        _safeMint(msg.sender, newTokenID);
        _setTokenURI(newTokenID, tokenURI);
        tokenCounter += 1;
        return newTokenID;
    }
}
