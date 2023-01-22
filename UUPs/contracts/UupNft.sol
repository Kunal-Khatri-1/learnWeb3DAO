//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// watchout for the order of inheritance
contract UupNft is Initializable, ERC721Upgradeable, UUPSUpgradeable, OwnableUpgradeable {
    // initializer modifier which ensure that the
    // initialize function is only called once
    function initialize() public initializer {
        __ERC721_init("UupNft", "UN");
        __Ownable_init();
        _mint(msg.sender, 1);
    }

    // _authorizeUpgrade is not present in normal ERC-721 contract
    // gives ability to add authorization on who can actually upgrade the given contract
    // can be changed according to requirements
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
