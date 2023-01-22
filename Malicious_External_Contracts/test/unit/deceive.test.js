const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Attack", function () {
  it("Should change the owner of the Good contract", async function () {
    // Deploy the Attack contract
    const attackContractFactory = await ethers.getContractFactory("Attack");
    const attackContract = await attackContractFactory.deploy();
    await attackContract.deployed();
    console.log("Attack Contract's Address", attackContract.address);

    // Deploy the good contract
    // Deceiving users => users think that they are interacting with Helper.sol
    const goodContractFactory = await ethers.getContractFactory("Good");
    const goodContract = await goodContractFactory.deploy(
      attackContract.address,
      {
        value: ethers.utils.parseEther("3"),
      }
    );
    await goodContract.deployed();
    console.log("Good Contract's Address:", goodContract.address);

    const [_, addr1] = await ethers.getSigners();
    // Now lets add an address to the eligibility list
    let tx = await goodContract.connect(addr1).addUserToList();
    await tx.wait();

    // check if the user is eligible
    const eligible = await goodContract.connect(addr1).isUserEligible();
    expect(eligible).to.equal(false);
  });
});
