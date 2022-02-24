import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useBlockNumber } from "eth-hooks";

const isValidParams = (address, providerSigner, abi) => {
  return ethers.utils.isAddress(address) && providerSigner && abi.length > 0;
};

const useRetFundERC721 = (provider, signer, address, abi) => {
  const [info, setInfo] = useState({});

  const blockNumber = useBlockNumber(provider);

  const read = useMemo(() => {
    return isValidParams(address, provider, abi) ? new ethers.Contract(address, abi, provider) : null;
  }, [provider, address, abi]);

  const write = useMemo(() => {
    return isValidParams(address, signer, abi) ? new ethers.Contract(address, abi, signer) : null;
  }, [signer, address, abi]);

  const refresh = () => {
    handleTokenInfo();
  };

  const handleTokenInfo = async (r, p) => {
    try {
      // load token information here
      const name = await r.name?.();
      const symbol = await r.symbol?.();
      const totalSupply = await r.totalSupply?.();

      // load values specific to retfund ERC-721
      const floor = await r.floor?.();
      const limit = await r.limit?.();
      const price = await r.price?.();

      setInfo({ name, symbol, totalSupply, floor, limit, price });
    } catch (error) {
      console.log(`Unable to load token information`);
    }
  };

  useEffect(() => {
    console.log({ blockNumber });
    if (address && read?.address === address) {
      handleTokenInfo(read);
    }
  }, [read, blockNumber]);

  return [info, read, write, refresh];
};

export default useRetFundERC721;
