// SPDX-License-Identifier: MIT

pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract AdvancedCollectible is ERC721, VRFConsumerBase {
    uint256 public tokenCounter;
    bytes32 public keyHash;
    uint256 public fee;
    mapping(uint256 => Breed) public tokenIDToBreed;
    mapping(bytes32 => address) public requestIDToSender;
    event requestedCollectable(bytes32 indexed requestID, address requester);
    event breedAssigned(uint256 indexed tokenID, Breed cat_breed);

    enum Breed {
        Persian,
        Bengal,
        Manx
    }

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    )
        public
        VRFConsumerBase(_vrfCoordinator, _linkToken)
        ERC721("Chase", "CHA")
    {
        tokenCounter = 0;
        keyHash = _keyHash;
        fee = _fee;
    }

    function createCollectible() public returns (bytes32) {
        bytes32 requestID = requestRandomness(keyHash, fee);
        requestIDToSender[requestID] = msg.sender;
        emit requestedCollectable(requestID, msg.sender);
    }

    function fulfillRandomness(bytes32 requestID, uint256 randomNumber)
        internal
        override
    {
        uint256 newTokenID = tokenCounter;
        Breed cat_breed = Breed(randomNumber % 3);
        tokenIDToBreed[newTokenID] = cat_breed;
        emit breedAssigned(newTokenID, cat_breed);
        address owner = requestIDToSender[requestID];
        _safeMint(owner, newTokenID);
        tokenCounter += 1;
    }

    function setTokenURI(uint256 tokenID, string memory _tokenURI) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenID),
            "ERC721: caller is not owner or not approved"
        );
        _setTokenURI(tokenID, _tokenURI);
    }
}
