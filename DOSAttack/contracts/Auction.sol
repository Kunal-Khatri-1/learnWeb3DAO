//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Auction {
    address public currentWinner;
    uint public currentAuctionPrice;

    constructor() {
        currentWinner = msg.sender;
    }

    function setCurrentAuctionPrice() public payable {
        require(msg.value > currentAuctionPrice, "Need to pay more than the currentAuctionPrice");
        // attack contract does not have fallback or receive to get the ETH
        // this implies that if a contract "Attack" is the winner and some person "addr2" bid more than "Attack" did
        // this contract "Auction.sol" will not be able to send the ETH to "Attack" => sent will always == false => winner will always == "Attack"
        (bool sent, ) = currentWinner.call{value: currentAuctionPrice}("");
        if (sent) {
            currentAuctionPrice = msg.value;
            currentWinner = msg.sender;
        }
    }
}
