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

export default {
  getAccountBalance,
  getMultipleAccountsBalance,
  getTxList,
  getTxListInternal,
  getTxReceiptStatus,
  getTransactionStatus,
};
