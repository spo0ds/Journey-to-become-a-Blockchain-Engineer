// SPDX-License-Identifier: MIT

pragma solidity 0.8.8;

contract Encoding {
    function concatenateStrings() public pure returns (string memory) {
        return string(abi.encodePacked("Hello! ", "How's it going?"));
    }

    function encodeNumber() public pure returns (bytes memory) {
        bytes memory number = abi.encode(1);
        return number;
    }

    function encodeString() public pure returns (bytes memory) {
        bytes memory x = abi.encode("Hi");
        return x;
    }

    function encodeStringPacked() public pure returns (bytes memory) {
        bytes memory x = abi.encodePacked("Hi");
        return x;
    }

    function encodeStringBytes() public pure returns (bytes memory) {
        bytes memory x = bytes("Hi");
        return x;
    }

    function decodeString() public pure returns (string memory) {
        string memory x = abi.decode(encodeString(), (string));
        return x;
    }

    function multiEncode() public pure returns (bytes memory) {
        bytes memory x = abi.encode("Hi", "there");
        return x;
    }

    function multiDecode() public pure returns (string memory, string memory) {
        (string memory x, string memory y) = abi.decode(multiEncode(), (string, string));
        return (x, y);
    }

    function multiEncodePacked() public pure returns (bytes memory) {
        bytes memory x = abi.encodePacked("Hi", "there");
        return x;
    }

    // this doesn't work
    function multiDecodePacked() public pure returns (string memory, string memory) {
        (string memory x, string memory y) = abi.decode(multiEncodePacked(), (string, string));
        return (x, y);
    }

    function multiStringCastPacked() public pure returns (string memory) {
        string memory x = string(multiEncodePacked());
        return x;
    }
}
