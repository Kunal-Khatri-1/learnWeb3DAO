const { expect } = require("chai")
const { ethers } = require("hardhat")
const hre = require("hardhat")

describe("ERC721 Uups Upgradable", () => {
    it("deploys and upgrades UupNft contract", async () => {
        const UupNftFactory = await ethers.getContractFactory("UupNft")
        const UupNftV2Factory = await ethers.getContractFactory("UupNftV2")

        let proxyContract = await hre.upgrades.deployProxy(UupNftFactory, {
            kind: "uups",
        })

        const [owner] = await ethers.getSigners()
        const ownerOfToken1 = await proxyContract.ownerOf(1)

        expect(ownerOfToken1).to.be.equal(owner.address)

        proxyContract = await hre.upgrades.upgradeProxy(proxyContract, UupNftV2Factory)
        expect(await proxyContract.test()).to.be.equal("upgraded")
    })
})
