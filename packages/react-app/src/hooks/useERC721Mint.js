import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

const zero = ethers.BigNumber.from("0");

export default function useERC721Mint(readContracts, contractName) {
  const [mints, setMints] = useState([]);

  const totalSupply = (useContractReader(readContracts, contractName, "totalSupply", []) || zero).toNumber();

  const loadingMints = async () => {
    const mintFilter = readContracts[contractName].filters.Transfer("0x0000000000000000000000000000000000000000");

    const mintQuery = await readContracts[contractName].queryFilter(mintFilter);

    setMints(mintQuery);
  };

  useEffect(() => {
    if (totalSupply && readContracts[contractName]) {
      loadingMints();
    }
  }, [totalSupply]);

  return mints;
}
