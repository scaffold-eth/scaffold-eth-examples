import axios from "axios";
import { ETHERSCAN_KEY } from "../constants";

//Accounts
const getAccountBalance = async (address, tag = "latest") => {
  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=${tag}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

const getMultipleAccountsBalance = async (addresses, tag = "latest") => {
  const url = `https://api.etherscan.io/api?module=account&action=balancemulti&address=${addresses.join(",")}&tag=${tag}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

const getTxList = async (address, limit, startblock = 0, endblock = 99999999) => {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startblock}&endblock=${endblock}&page=1&offset=${limit}&sort=desc&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

const getTxListInternal = async (address, limit, startblock = 0, endblock = 99999999) => {
  const url = `https://api.etherscan.io/api?module=account&action=txlistinternal&address=${address}&startblock=${startblock}&endblock=${endblock}&page=1&offset=${limit}&sort=asc&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

//Contracts
const getContractABI = async (address) => {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

const getContractSourceCode = async (address) => {
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};


//Transactions
const getTxReceiptStatus = async txHash => {
  const url = `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

const getTransactionStatus = async txHash => {
  const url = `https://api.etherscan.io/api?module=transaction&action=getstatus&txhash=${txHash}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

//Blocks
const getBlockReward = async blockNo => {
  const url = `https://api.etherscan.io/api?module=block&action=getBlockReward&blockNo=${blockNo}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

const getBlockCountdown = async blockNo => {
  const url = `https://api.etherscan.io/api?module=block&action=getblockcountdown&blockNo=${blockNo}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

const getBlockNoByTimeStamp = async (timeStamp, closest = 'before') => {
  const url = `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timeStamp}&closest=${closest}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

// Tokens

const getTokenSupply = async contractAddress => {
  const url = `https://api.etherscan.io/api?module=stats&action=tokensupply&contractAddress=${contractAddress}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

const getTokenBalance = async (contractAddress, address) => {
  const url = `https://api.etherscan.io/api?module=stats&action=tokensupply&contractAddress=${contractAddress}&address=${address}&tag=latest&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

// Gas Tracker

const getGasEstimate = async gasPrice => {
  const url = `https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice=${gasPrice}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

const getGasOracle = async () => {
  const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

// Stats

const getEthSupply = async () => {
  const url = `https://api.etherscan.io/api?module=stats&action=ethsupply2&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

const getEthLastPrice = async () => {
  const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

const getEthNodeSize = async (startDate, endDate, clientType = 'geth', syncMode = 'default', sort = 'asc') => {
  const url = `https://api.etherscan.io/api?module=stats&action=chainsize&startdate=${startDate}&endDate=${endDate}&clienttype=${clientType}&syncmode=${syncMode}&sort=${sort}&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

const getNodeCount = async () => {
  const url = `https://api.etherscan.io/api?module=stats&action=nodecount&apikey=${ETHERSCAN_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

export default {
  getAccountBalance,
  getMultipleAccountsBalance,
  getContractABI,
  getContractSourceCode,
  getTxList,
  getTxListInternal,
  getTxReceiptStatus,
  getTransactionStatus,
  getBlockReward,
  getBlockCountdown,
  getBlockNoByTimeStamp,
  getTokenSupply,
  getTokenBalance,
  getGasEstimate,
  getGasOracle,
  getEthSupply,
  getEthLastPrice,
  getEthNodeSize,
  getNodeCount
};
