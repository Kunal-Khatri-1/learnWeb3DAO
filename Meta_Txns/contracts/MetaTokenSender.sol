// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RandomToken is ERC20 {
    constructor() ERC20("Random Token", "RT") {}

    function freeMint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}

contract TokenSender {
    using ECDSA for bytes32;

    function transfer(
        address sender,
        uint256 amount,
        address recipient,
        address tokenContract,
        bytes memory signature
    ) public {
        bytes32 messageHash = getHash(sender, amount, recipient, tokenContract);
        bytes32 signedMessageHash = messageHash.toEthSignedMessageHash();

        address signer = signedMessageHash.recover(signature);

        require(signer == sender, "sender didn't sign the message");

        bool sent = ERC20(tokenContract).transferFrom(sender, recipient, amount);

        require(sent, "Transfer Failed");
    }

    function getHash(
        address sender,
        uint256 amount,
        address recipient,
        address tokenContract
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(sender, amount, recipient, tokenContract));
    }
}
