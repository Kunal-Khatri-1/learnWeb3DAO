// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract UpdatedRandomToken is ERC20 {
    constructor() ERC20("Random Toknen", "RT") {}

    function freeMint(uint amount) public {
        _mint(msg.sender, amount);
    }
}

contract UpdatedTokenSender {
    using ECDSA for bytes32;

    // NEW mapping
    // earlier (MetaTokenSender.sol) relayer could keep sending the signature to the contract over and over, transferring tokens from sender to recipient
    // A general-purpose solution for this is to create a mapping of hash of parameters to boolean value
    // true => meta txn exectued and false => txn has not executed
    // nonce as extra parameter has to be introduced so that same transaction can happen again
    // otherwise once the txn is done hash is mapped to false => same txn will not be allowed
    mapping(bytes32 => bool) executed;

    function transfer(
        address sender,
        uint256 amount,
        address recipient,
        address tokenContract,
        uint256 nonce,
        bytes memory signature
    ) public {
        bytes32 messageHash = getHash(sender, amount, recipient, tokenContract, nonce);
        bytes32 signedMessageHash = messageHash.toEthSignedMessageHash();

        // checking if signature has not already been used
        require(!executed[signedMessageHash], "Already executed");

        address signer = signedMessageHash.recover(signature);

        require(signer == sender, "Signature does not come from sender");

        // Marking that signature is now been executed
        executed[signedMessageHash] = true;
        bool sent = ERC20(tokenContract).transferFrom(sender, recipient, amount);
        require(sent, "Transfer Failed");
    }

    function getHash(
        address sender,
        uint256 amount,
        address recipient,
        address tokenContract,
        uint256 nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(sender, amount, recipient, tokenContract, nonce));
    }
}
