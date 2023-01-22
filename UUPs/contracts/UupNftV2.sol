//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./UupNft.sol";

contract UupNftV2 is UupNft {
    function test() public pure returns (string memory) {
        return "upgraded";
    }
}
