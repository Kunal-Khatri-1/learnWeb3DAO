const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("Updated MetaTokenTransfer", () => {
    it("transfer tokens through relayer with different nonces", async () => {
        // Deploying UpdatedMetaTokenSender.sol
        const RandomTokenFactory = await ethers.getContractFactory("UpdatedRandomToken")
        const randomTokenContract = await RandomTokenFactory.deploy()
        await randomTokenContract.deployed()

        // Deploying UpdatedTokenSender.sol
        const MetaTokenSenderFactory = await ethers.getContractFactory("UpdatedTokenSender")
        const tokenSenderContract = await MetaTokenSenderFactory.deploy()
        await tokenSenderContract.deployed()

        // Getting addresses
        const [_, userAddress, relayerAddress, recipientAddress] = await ethers.getSigners()

        // Minting 10000 tokens to userAddress
        const tenThousandTokens = ethers.utils.parseEther("10000")
        const userTokenContract = randomTokenContract.connect(userAddress)
        const mintTx = await userTokenContract.freeMint(tenThousandTokens)
        await mintTx.wait(1)

        // giving approval to tokenSenderContract for infitie (MAX) tokens
        const approveTx = await userTokenContract.approve(
            tokenSenderContract.address,
            ethers.BigNumber.from(
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
            )
        )

        await approveTx.wait(1)

        // user sign message to transfer 10 tokens to recipient
        let nonce = 1

        const trasnferAmountTokens = ethers.utils.parseEther("10")
        const messageHash = await tokenSenderContract.getHash(
            userAddress.address,
            trasnferAmountTokens,
            recipientAddress.address,
            randomTokenContract.address,
            nonce
        )
        // arrayify => hexstring to uint8 array
        const signature = await userAddress.signMessage(ethers.utils.arrayify(messageHash))

        // Relayer execute the transaction on behalf of the user
        const relayerSenderContract = tokenSenderContract.connect(relayerAddress)
        const metaTx = await relayerSenderContract.transfer(
            userAddress.address,
            trasnferAmountTokens,
            recipientAddress.address,
            randomTokenContract.address,
            nonce,
            signature
        )
        await metaTx.wait(1)

        // checking balances
        let userBalance = await randomTokenContract.balanceOf(userAddress.address)
        let recipientBalance = await randomTokenContract.balanceOf(recipientAddress.address)

        expect(userBalance.eq(ethers.utils.parseEther("9990"))).to.be.true
        expect(recipientBalance.eq(ethers.utils.parseEther("10"))).to.be.true

        // Increasing the nonce
        nonce++

        const messageHash2 = await tokenSenderContract.getHash(
            userAddress.address,
            trasnferAmountTokens,
            recipientAddress.address,
            randomTokenContract.address,
            nonce
        )
        // userAddress signing message with different nonce
        const signature2 = await userAddress.signMessage(ethers.utils.arrayify(messageHash2))
        // Relayer executing the second trasaction
        const metaTx2 = await relayerSenderContract.transfer(
            userAddress.address,
            trasnferAmountTokens,
            recipientAddress.address,
            randomTokenContract.address,
            nonce,
            signature2
        )
        await metaTx2.wait(1)

        // checking balances
        userBalance = await randomTokenContract.balanceOf(userAddress.address)
        recipientBalance = await randomTokenContract.balanceOf(recipientAddress.address)

        expect(userBalance.eq(ethers.utils.parseEther("9980"))).to.be.true
        expect(recipientBalance.eq(ethers.utils.parseEther("20"))).to.be.true
    })

    it("should not let signature replay attack", async () => {
        // Deploying UpdatedMetaTokenSender.sol
        const RandomTokenFactory = await ethers.getContractFactory("UpdatedRandomToken")
        const randomTokenContract = await RandomTokenFactory.deploy()
        await randomTokenContract.deployed()

        // Deploying UpdatedTokenSender.sol
        const MetaTokenSenderFactory = await ethers.getContractFactory("UpdatedTokenSender")
        const tokenSenderContract = await MetaTokenSenderFactory.deploy()
        await tokenSenderContract.deployed()

        // Getting addresses
        const [_, userAddress, relayerAddress, recipientAddress] = await ethers.getSigners()

        // Minting 10000 tokens to userAddress
        const tenThousandTokens = ethers.utils.parseEther("10000")
        const userTokenContract = randomTokenContract.connect(userAddress)
        const mintTx = await userTokenContract.freeMint(tenThousandTokens)
        await mintTx.wait(1)

        // giving approval to tokenSenderContract for infitie (MAX) tokens
        const approveTx = await userTokenContract.approve(
            tokenSenderContract.address,
            ethers.BigNumber.from(
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
            )
        )

        await approveTx.wait(1)

        // user sign message to transfer 10 tokens to recipient
        let nonce = 1

        const trasnferAmountTokens = ethers.utils.parseEther("10")
        const messageHash = await tokenSenderContract.getHash(
            userAddress.address,
            trasnferAmountTokens,
            recipientAddress.address,
            randomTokenContract.address,
            nonce
        )
        // arrayify => hexstring to uint8 array
        const signature = await userAddress.signMessage(ethers.utils.arrayify(messageHash))

        // Relayer execute the transaction on behalf of the user
        const relayerSenderContract = tokenSenderContract.connect(relayerAddress)
        const metaTx = await relayerSenderContract.transfer(
            userAddress.address,
            trasnferAmountTokens,
            recipientAddress.address,
            randomTokenContract.address,
            nonce,
            signature
        )
        await metaTx.wait(1)
        // expecting transaction to be reverted if relayer use the same signature / nonce again
        expect(
            relayerSenderContract.transfer(
                userAddress.address,
                trasnferAmountTokens,
                recipientAddress.address,
                randomTokenContract.address,
                nonce,
                signature
            )
        ).to.be.revertedWith("Already executed!")
    })
})
