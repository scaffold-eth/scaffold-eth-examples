import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const ERC20ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address",
      },
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
];

const isValidParams = (address, providerSigner, abi) => {
  return ethers.utils.isAddress(address) && providerSigner && abi.length > 0;
};

export default function useERC20(address, provider, signer, params = {}) {
  const [tokenInfo, setTokenInfo] = useState({});
  const abi = useMemo(() => {
    return params.abi ? params.abi : ERC20ABI;
  }, [params.abi]);

  const read = useMemo(() => {
    return isValidParams(address, provider, abi) ? new ethers.Contract(address, abi, provider) : null;
  }, [provider, address, abi, params?.refreshKey]);

  const write = useMemo(() => {
    return isValidParams(address, signer, abi) ? new ethers.Contract(address, abi, signer) : null;
  }, [signer, address, abi, params?.refreshKey]);

  const handleTokenInfo = async (r, p) => {
    try {
      // load token information here
      const name = await r.name?.();
      const symbol = await r.symbol?.();
      const decimals = await r.decimals?.();
      const totalSupply = await r.totalSupply?.();
      let allowance;
      let balanceOfOwner;
      let balanceOfSpender;

      if (p.spender && p.owner) {
        allowance = await r.allowance?.(p.owner, p.spender);
        balanceOfOwner = await r.balanceOf?.(p.owner);
        balanceOfSpender = await r.balanceOf?.(p.spender);
      }

      setTokenInfo({ name, symbol, decimals, totalSupply, allowance, balanceOfOwner, balanceOfSpender });
    } catch (error) {
      console.log(`Unable to load token information`);
    }
  };

  useEffect(() => {
    if (address && read?.address === address) {
      handleTokenInfo(read, params);
    }
  }, [read, params.owner, params.spender, params?.refreshKey]);

  return [tokenInfo, read, write];
}
