const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Attack", () => {
    it("Attack.sol will change the owner of Good.sol", async () => {
        const [, addr1] = await ethers.getSigners()

        // Deploying SimpleOwnable.sol
        const SimpleOwnableFactory = await ethers.getContractFactory("SimpleOwnable")
        const SimpleOwnableContract = await SimpleOwnableFactory.connect(addr1).deploy()
        await SimpleOwnableContract.deployed()
        console.log("Simple Ownable Contract's Address:", SimpleOwnableContract.address)

        // Deploy the Attack contract
        const attackFactory = await ethers.getContractFactory("Attack")
        const attackContract = await attackFactory.deploy(SimpleOwnableContract.address)
        await attackContract.deployed()
        console.log("Attack Contract's Address", attackContract.address)

        // Attack =>  attacker will somehow fool the user who has the private key of addr1 to call the attack function with Attack.sol.
        let tx = await attackContract.connect(addr1).attack()
        await tx.wait(1)

        // Checking if owner of SimpleOwnable.sol is Attack.sol
        expect(await SimpleOwnableContract.owner()).to.be.equal(attackContract.address)
    })
})
