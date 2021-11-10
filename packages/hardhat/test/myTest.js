const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My Dapp", function () {
  let erc1271Dao;

  describe("YourContract", function () {
    it("Should deploy ERC1271DAO", async function () {
      const ERC1271DAO = await ethers.getContractFactory("ERC1271DAO");

      erc1271Dao = await ERC1271DAO.deploy();
    });

    describe("setFakeProposal()", function () {
      it("Should be able to set a fake proposal", async function () {
        await erc1271Dao.setFakeProposal(1, true);
        expect(await erc1271Dao.fakeProposals(1)).to.equal(true);
        expect(await erc1271Dao.fakeProposals(2)).to.equal(false);
      });
    });
    
    const demoSig = '0x45461654b86e856686e7a2e9a9213b29f8dc32a731046e0c2f1aa01e4eaa991e41ebc67535fac14c333ad5b0d0d821ef518edc9ed08ad7efc0af572620c045ce1c';
    const demoSigHash = '0xed7c9f368199bcdbb737836e9835001b5346f3a8f4d5a88a5dcc91ec280d4eda';
    const demoHash = '0x41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d'
    const magicValue = '0x1626ba7e';

    const demoBadSig = '0x55461654b86e856686e7a2e9a9213b29f8dc32a731046e0c2f1aa01e4eaa991e41ebc67535fac14c333ad5b0d0d821ef518edc9ed08ad7efc0af572620c045ce1c';
    
    describe("hashHelper()", function () {
      it("Should hash something", async function () {
        console.log(await erc1271Dao.hashHelper(demoSig));
        expect(true);
      });
    });
    
    describe("setFakeSignature()", function() {
      it("Should be able to set a fake signature", async function () {
        expect(await erc1271Dao.setFakeSignature(demoHash, demoSigHash, magicValue, 1)).to.not.throw;
      });
    });

    describe("isValidSignature()", function() {
      it("Should return magic value for a valid signature", async function () {
        await erc1271Dao.setFakeSignature(demoHash, demoSigHash, magicValue, 1);
        await erc1271Dao.setFakeProposal(1, true);
        expect (await erc1271Dao.isValidSignature(demoHash, demoSig)).to.equal(magicValue);
      });
      it("Should throw if proposal has not passed", async function () {
        await erc1271Dao.setFakeSignature(demoHash, demoSigHash, magicValue, 1);
        await erc1271Dao.setFakeProposal(1, false);
        expect (erc1271Dao.isValidSignature(demoHash, demoSig)).to.be.revertedWith('Proposal has not passed');
      });
      it("Should throw if invalid signature", async function () {
        await erc1271Dao.setFakeSignature(demoHash, demoSigHash, magicValue, 1);
        await erc1271Dao.setFakeProposal(1, false);
        expect (erc1271Dao.isValidSignature(demoHash, demoBadSig)).to.be.revertedWith('Invalid signature hash');
      });
    });
  });
});
