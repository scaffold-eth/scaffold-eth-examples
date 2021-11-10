/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, Balance, EtherInput, AddressInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { Alert } from "antd";

export default function ExampleUI({
  setPurposeEvents,
  address,
  mainnetProvider,
  userProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
}) {
  const [amount, setAmount] = useState();
  const [facetAddress, setFacetAddress] = useState();
  const [action, setAction] = useState();

  const signer = userProvider.getSigner();

  const data = writeContracts.DeFiFacet.interface.encodeFunctionData("zappify", [parseEther("1000")]);

  function handleActionChange(evt) {
    const action = evt.target.value.toLowerCase();
    console.log(action);
    let actionVal;
    if (action === "add") {
      actionVal = 0;
    } else if (action === 'replace') {
      actionVal = 1;
    } else if (action === "remove") {
      actionVal = 2;
    }
    setAction(actionVal);
  }

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
              <Alert
          message={"⚠️ Facet Deployment"}
          description={(
            <div>
              Deploy the facet you want to upgrade through scaffold
            </div>
          )}
          type="error"
          closable={false}
        />
      <a href = 'https://faucet.metamask.io/'><b>Get Ropsten ETH here</b></a>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Zap with DeFi Facet</h2>
        {/* <h4>purpose: {purpose}</h4> */}
        <Divider />
        <div style={{ margin: 8 }}>
          <EtherInput
            price={price}
            value={amount}
            onChange={value => {
              setAmount(value);
            }}
          />
          <br />
          <br />
          <Button
            onClick={() => {
              /* look how you call setPurpose on your contract: */
              tx(
                signer.sendTransaction({
                  to: writeContracts.Diamond.address,
                  data: data,
                  value: parseEther(amount),
                }),
              );
            }}
          >
            Zap with Aave Uniswap Market
          </Button>
        </div>
        <Divider />
        <h2>Upgrade Diamond Facet</h2>
        {/* upgrades the defi facet only currently for demo purposes */}
        <Divider />
        <div style={{ margin: 8 }}>
        
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="New Facet Address"
            value={facetAddress}
            onChange={setFacetAddress}
          />
          <br />
          <h5>Select Upgrade Action</h5>
          <br />

          <select onChange={handleActionChange}>
            <option>Select Action</option>
            <option>Add</option>
            <option>Replace</option>
            <option>Remove</option>
          </select>
          <br />
          <br />

          {facetAddress && (
            <Button
              onClick={() => {
                const signatures = [];
                Object.keys(writeContracts.DeFiFacet.interface.functions).map(key => {
                  signatures.push(writeContracts.DeFiFacet.interface.getSighash(key));
                });

                const diamondCutParams = [[facetAddress, 0, signatures]];

                /* look how you call setPurpose on your contract: */
                tx(
                  writeContracts.DiamondCutFacet.diamondCut(
                    diamondCutParams,
                    "0x0000000000000000000000000000000000000000",
                    "0x",
                  ),
                );
              }}
            >
              Upgrade
            </Button>
          )}
        </div>
        <Divider />
        Your Address:
        <Address value={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        ENS Address Example:
        <Address
          value={"0x34aA3F359A9D614239015126635CE7732c18fDF3"} /* this will show as austingriffith.eth */
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />
        {/* use formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? formatEther(yourLocalBalance) : "..."}</h2>
        OR
        <Balance address={address} provider={localProvider} dollarMultiplier={price} />
        <Divider />
        {/* use formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? formatEther(yourLocalBalance) : "..."}</h2>
        <Divider />
        {/* Your Contract Address:
        <Address
            value={readContracts?readContracts.YourContract.address:readContracts}
            ensProvider={mainnetProvider}
            fontSize={16}
        /> */}
        <Divider />
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      {/* <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={setPurposeEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + item.sender + "_" + item.purpose}>
                <Address value={item[0]} ensProvider={mainnetProvider} fontSize={16} /> =>
                {item[1]}
              </List.Item>
            );
          }}
        />
      </div> */}

      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 256 }}>
        <Card>
          Check out all the{" "}
          <a
            href="https://github.com/austintgriffith/scaffold-eth/tree/master/packages/react-app/src/components"
            target="_blank"
            rel="noopener noreferrer"
          >
            📦 components
          </a>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <div>
            There are tons of generic components included from{" "}
            <a href="https://ant.design/components/overview/" target="_blank" rel="noopener noreferrer">
              🐜 ant.design
            </a>{" "}
            too!
          </div>

          <div style={{ marginTop: 8 }}>
            <Button type="primary">Buttons</Button>
          </div>

          <div style={{ marginTop: 8 }}>
            <SyncOutlined spin /> Icons
          </div>

          <div style={{ marginTop: 8 }}>
            Date Pickers?
            <div style={{ marginTop: 2 }}>
              <DatePicker onChange={() => {}} />
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Slider range defaultValue={[20, 50]} onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Switch defaultChecked onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Progress percent={50} status="active" />
          </div>

          <div style={{ marginTop: 32 }}>
            <Spin />
          </div>
        </Card>
      </div>
    </div>
  );
}
