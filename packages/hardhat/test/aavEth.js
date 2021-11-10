const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My Dapp", function () {
  let aavEth;

  describe("AavEth", function () {
    it("Should deploy AavEth", async function () {
      const AavEth = await ethers.getContractFactory("AavEth");

      aavEth = await AavEth.deploy();
    });

    describe("depositEthForAToken()", function () {
      it("Should emit Deposit event", async function () {

        const accounts = await ethers.getSigners();

        let timeLimit = 600
        let address = accounts[0].address
        let deadline = Math.floor(Date.now() / 1000) + timeLimit
        let metadata = {
          value: ethers.utils.parseEther("0.1")
        }

        await expect(aavEth['depositEthForAToken']("1", ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","0x6B175474E89094C44Da98b954EedeAC495271d0F"], address, deadline, metadata)).to.emit(aavEth, 'Deposit');
      });
    });
  });
});
