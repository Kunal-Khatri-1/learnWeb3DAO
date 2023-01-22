const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("MetaTokenTransfer", () => {
    it("let user transfer tokens through a relayer", async () => {
        // Depling RandomToken.sol
        const RandomTokenFactory = await ethers.getContractFactory("RandomToken")
        const randomTokenContract = await RandomTokenFactory.deploy()
        await randomTokenContract.deployed()

        // Deploying TokenSender.sol
        const MetaTokenSenderFactory = await ethers.getContractFactory("TokenSender")
        const tokenSenderContract = await MetaTokenSenderFactory.deploy()
        await tokenSenderContract.deployed()

        // Getting addresses
        const [_, userAddress, relayerAddress, recipientAddress] = await ethers.getSigners()

        // Minting RandomTokens to userAddress
        const tenThousandTokens = ethers.utils.parseEther("10000")
        const userTokenContractInstance = randomTokenContract.connect(userAddress)
        const mintTx = await userTokenContractInstance.freeMint(tenThousandTokens)
        await mintTx.wait(1)

        // Giving Token sender approval for transferring "Random Token"
        const approveTx = await userTokenContractInstance.approve(
            tokenSenderContract.address,
            ethers.BigNumber.from(
                // this is the max value of uint256 (2^256 - 1) in hexadecimal units
                // each digit => 4 bites => 2 digits => 1 byte
                // 64 digits => 32 bytes => 256 bits
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
            )
        )
        await approveTx.wait(1)

        // Have user sign the message to transfer 10 tokens to recipient
        const transferAmountOfTokens = ethers.utils.parseEther("10")
        const messageHash = await tokenSenderContract.getHash(
            userAddress.address,
            transferAmountOfTokens,
            recipientAddress.address,
            randomTokenContract.address
        )
        const signature = await userAddress.signMessage(ethers.utils.arrayify(messageHash))

        // Have relayer execute the transaction
        const relayerSenderContract = tokenSenderContract.connect(relayerAddress)

        const metaTx = await relayerSenderContract.transfer(
            userAddress.address,
            transferAmountOfTokens,
            recipientAddress.address,
            randomTokenContract.address,
            signature
        )
        await metaTx.wait(1)

        // Checking the balances of user and recipient
        const userBalance = await randomTokenContract.balanceOf(userAddress.address)
        const recipientBalance = await randomTokenContract.balanceOf(recipientAddress.address)

        expect(userBalance.lt(tenThousandTokens)).to.be.true
        expect(recipientBalance.gt(ethers.BigNumber.from(0))).to.be.true
    })
})
