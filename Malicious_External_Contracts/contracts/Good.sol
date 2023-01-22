//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./Helper.sol";

contract Good {
    // Attack.sol will have same abi as Helper.sol
    // therefore Attack can be typecasted into Helper
    // users think they are interacting with Helper.sol

    Helper helper;

    constructor(address _helper) payable {
        helper = Helper(_helper);
    }

    // RECOMMENDED WAY => Create a new contract, instead of typecasting an address into a contract inside the constructor.
    // contract Good {
    // Helper public helper;
    // constructor() {
    //     helper = new Helper();
    // }

    function isUserEligible() public view returns (bool) {
        return helper.isUserEligible(msg.sender);
    }

    function addUserToList() public {
        helper.setUserEligible(msg.sender);
    }

    fallback() external {}
}
