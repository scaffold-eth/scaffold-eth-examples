import React from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Button } from "antd";
import { AddressInput } from "../components";
import { EtherscanAPI } from "../hooks";
/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function TxViewer({ yourLocalBalance, readContracts, mainnetProvider }) {
  // you can also use hooks locally in your component of choice
  const [isValid, isAddressValid] = React.useState(false);
  const [address, setAddress] = React.useState("");
  const [txs, setTxs] = React.useState([]);
  const checkValidAddress = address => {
    setAddress(address);
    console.log(address);
    if (address.length === 42 && address.startsWith("0x")) {
      return isAddressValid(true);
    }
    return isAddressValid(false);
  };

  const search = async () => {
    EtherscanAPI.getTxList(address, 1000).then(res => {
      if (res.status === "1" && res.result) {
        console.log(res);
        setTxs(res.result);
      }
    });
  };

  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, width: 700, margin: "auto", marginTop: 64 }}>
      <h1>Transaction Viewer</h1>
      <AddressInput ensProvider={mainnetProvider} onChange={checkValidAddress} />
      <Button style={{ marginTop: "20px" }} disabled={!isValid} onClick={search}>
        Look up TXs!
      </Button>
      <div>
        {txs.map(tx => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                border: "solid #000 2px",
                borderRadius: "6px",
                padding: "20px",
                margin: "20px",
              }}
            >
              <span>
                <b>TimeStamp:</b> {new Date(Number(tx.timeStamp)).toUTCString()}
              </span>
              <span>
                <b>From:</b> {tx.from}
              </span>
              <span>
                <b>To:</b> {tx.to}
              </span>
              <span>
                <b>Tx Hash:</b> {tx.hash}
              </span>
              <span>
                <b>Value:</b> {tx.value}
              </span>
              <span>
                <b>Gas:</b> {tx.gas}
              </span>
              <span>
                <b>Gas Price:</b> {tx.gasPrice}
              </span>
              <span>
                <b>Gas Used:</b> {tx.gasUsed}
              </span>
              <span>
                <b>Nonce:</b> {tx.nonce}
              </span>
              <span>
                <b>Block Number:</b> {tx.blockNumber}
              </span>
              <span>
                <b>Block Hash:</b> {tx.blockHash}
              </span>
              <span>
                <b>Transaction Index:</b> {tx.transactionIndex}
              </span>
              <span>
                <b>Status:</b> {tx.status}
              </span>
              <span style={{ overflow: "hidden", width: "100%", textAlign: "left", textOverflow: "ellipsis" }}>
                <b>Input:</b> {tx.input}
              </span>
              <span>
                <b>Contract Address:</b> {tx.contractAddress}
              </span>
              <span>
                <b>Cumulative Gas Used:</b> {tx.cumulativeGasUsed}
              </span>
              <span>
                <b>Gas Limit:</b> {tx.gasLimit}
              </span>
              <span>
                <b>Confirmations:</b> {tx.confirmations}
              </span>
              <span>
                <b>Error:</b> {tx.error}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TxViewer;

// object returned from etherscan api
// {
//   "blockNumber": "13321005",
//   "timeStamp": "1632923244",
//   "hash": "0x8d9abd6e7fe57b9d47fdf7aa547546afcb9fda5e83e0ae5d53d8dd911c3d4e5c",
//   "nonce": "0",
//   "blockHash": "0x407e6491e419eb114157650e5a0d2c848b5a4f7b29ce2d0458c156f64d39056e",
//   "transactionIndex": "109",
//   "from": "0x1c80d2a677c4a7756cf7d00fbb1c1766321333c3",
//   "to": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//   "value": "0",
//   "gas": "60760",
//   "gasPrice": "79398696269",
//   "isError": "0",
//   "txreceipt_status": "1",
//   "input": "0x095ea7b3000000000000000000000000cee284f754e854890e311e3280b767f80797180dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
//   "contractAddress": "",
//   "cumulativeGasUsed": "4894599",
//   "gasUsed": "60311",
//   "confirmations": "800360"
// }
