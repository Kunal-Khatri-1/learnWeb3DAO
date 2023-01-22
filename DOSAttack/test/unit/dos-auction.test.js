const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Attacking Auction.sol", () => {
    it("After being declared the winner, Attack.sol should not allow anyone else to become the winner", async () => {
        // Deploying Auction.sol
        const auctionFactory = await ethers.getContractFactory("Auction")
        const auctionContract = await auctionFactory.deploy()
        await auctionContract.deployed()
        console.log("Auction Contract's Address:", auctionContract.address)

        // Deploying Attack.sol
        const attackFactory = await ethers.getContractFactory("Attack")
        const attackContract = await attackFactory.deploy(auctionContract.address)
        await attackContract.deployed()
        console.log("Attack Contract's Address", attackContract.address)

        // Getting addresses
        const [, addr1, addr2] = await ethers.getSigners()

        // Initially let addr1 become the current winner of the aution
        let tx = await auctionContract.connect(addr1).setCurrentAuctionPrice({
            value: ethers.utils.parseEther("1"),
        })
        await tx.wait(1)

        // Attacking Auction.sol => making Attack.sol as the current winner
        tx = await attackContract.attack({
            value: ethers.utils.parseEther("3.1415"),
        })
        await tx.wait(1)

        // Try to make addr2 the current winner
        tx = await auctionContract.connect(addr2).setCurrentAuctionPrice({
            value: ethers.utils.parseEther("4"),
        })

        // Is Attack.sol still the current winner?
        expect(await auctionContract.currentWinner()).to.be.equal(attackContract.address)
    })
})
