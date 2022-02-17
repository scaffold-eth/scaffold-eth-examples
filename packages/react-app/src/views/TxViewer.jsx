import React, {useEffect} from "react";
import { Button } from "antd";
import { AddressInput } from "../components";
import { EtherscanAPI } from "../hooks";
import Spreadsheet from "react-spreadsheet";
import {useThemeSwitcher} from "react-css-theme-switcher";
import { CSVLink, CSVDownload } from "react-csv";


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
  const [isDarkMode, setIsDarkMode] = React.useState(window.localStorage.getItem("theme") || false)
  const { currentTheme } = useThemeSwitcher();

  useEffect(() => {
    setIsDarkMode(currentTheme === "dark")
  }, [currentTheme]);

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
        const _txs = res.result.map(tx => {
          const hours = ("0" + new Date(Number(tx.timeStamp)).getHours()).slice(-2);

          // minutes as 2 digits (mm)
          const minutes = ("0" + new Date(Number(tx.timeStamp)).getMinutes()).slice(-2);

          // seconds as 2 digits (ss)
          const seconds = ("0" + new Date(Number(tx.timeStamp)).getSeconds()).slice(-2);

          return [
            { value: tx.blockNumber },
            { value: `${hours}:${minutes}:${seconds}` },
            { value: tx.from },
            { value: tx.to },
            { value: tx.hash },
            { value: tx.value },
            { value: tx.gas },
            { value: tx.gasPrice },
            { value: tx.gasUsed },
            { value: tx.nonce },
            { value: tx.blockHash },
            { value: tx.transactionIndex },
            { value: tx.status },
            { value: tx.contractAddress },
            { value: tx.cumulativeGasUsed },
            { value: tx.gasLimit },
            { value: tx.confirmations },
            { value: tx.error },
            { value: tx.input },
          ];
        });

        setTxs([
          [
            { value: "Block Number" },
            { value: `TimeStamp` },
            { value: "From" },
            { value: "To" },
            { value: "Hash" },
            { value: "Value" },
            { value: "Gas" },
            { value: "Gas Price" },
            { value: "Gas Used" },
            { value: "Nonce" },
            { value: "Block Hash" },
            { value: "Transaction Index" },
            { value: "Status" },
            { value: "Contract Address" },
            { value: "Cumulative Gas Used" },
            { value: "Gas Limit" },
            { value: "Confirmations" },
            { value: "Error" },
            { value: "Input" }
          ],
          ..._txs,
        ]);
      }
    });
  };

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 700, margin: "auto", marginTop: 64 }}>
        <h1>Transaction Viewer</h1>
        <AddressInput ensProvider={mainnetProvider} onChange={checkValidAddress} />
        <Button style={{ marginTop: "20px" }} disabled={!isValid} onClick={search}>
          Look up TXs!
        </Button>
      </div>
      <div style={{marginTop: 20}} >
        {txs.length > 0 && (<CSVLink data={txs.map(el => el.map(tx => tx['value']))}>Download as CSV</CSVLink>)}
      </div>
      <div style={{ margin: "auto", marginTop: 20, maxWidth: "95%", overflowX: "scroll"}}>
          {txs.length > 0 && (<Spreadsheet data={txs} onChange={setTxs} darkMode={isDarkMode} />)}
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
