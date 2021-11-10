const { l2ethers } = require("hardhat");
require("@nomiclabs/hardhat-waffle");
const { use, expect } = require("chai");

describe("My Optimistic Dapp", function () {
  let myContract;

  describe("YourContract", function () {
    it("Should deploy YourContract", async function () {
      const YourContract = await l2ethers.getContractFactory("YourContract");

      myContract = await YourContract.deploy();
    });

    describe("setPurpose()", function () {
      it("Should be able to set a new purpose", async function () {
        const newPurpose = "Test Purpose";

        await myContract.setPurpose(newPurpose);
        let retrievedPurpose = await myContract.purpose()
        expect(await myContract.purpose()).to.equal(newPurpose);
      });
    });
  });
});
