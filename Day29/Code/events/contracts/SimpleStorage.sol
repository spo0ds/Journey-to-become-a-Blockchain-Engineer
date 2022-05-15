pragma solidity ^0.6.0;

contract SimpleStorage {
    uint256 age;

    struct Humans {
        uint256 age;
        string name;
    }

    Humans[] public boys;
    mapping(string => uint256) public nameToAge;

    event storedAge(
        uint256 indexed oldAge,
        uint256 indexed newAge,
        uint256 totalAge,
        address sender
    );

    function store(uint256 x) public {
        emit storedAge(age, x, age + x, msg.sender);

        age = x;
    }

    function retrieve() public view returns (uint256) {
        return age;
    }

    function addBoy(string memory x, uint256 y) public {
        boys.push(Humans(y, x));
        nameToAge[x] = y;
    }
}
