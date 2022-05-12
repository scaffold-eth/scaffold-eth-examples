const { ethers } = require("ethers");

exports.validateTokenOwner = (address, tokenId, ownerAddress) => {
  const provider = new ethers.providers.StaticJsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  const ABI = [
    "function ownerOf(uint256 tokenId) external view returns (address)",
  ];

  const tokenContract = new ethers.Contract(address, ABI, provider);
  return tokenContract
    .ownerOf(tokenId)
    .then(
      (owner) =>
        ethers.utils.getAddress(owner) === ethers.utils.getAddress(ownerAddress)
    );
};

exports.handleRecovery = (types, value, signature) => {
  return ethers.utils.verifyTypedData(
    {
      name: "Some Event Ticket",
      version: "0.0.1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    types,
    value,
    signature
  );
};
