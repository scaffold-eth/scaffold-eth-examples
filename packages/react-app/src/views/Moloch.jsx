/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { ethers, utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Tooltip } from "antd";
import React, { useState } from "react";
import { Address, Balance } from "../components";

const { TextArea } = Input;

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

export default function Moloch({ mainnetProvider, tx, readContracts, writeContracts, setMolochProposalEvents, setMolochAddress, molochAddress }) {
  // const [molochAddress, setMolochAddress] = useState("loading...");
  const [memberAddress, setMemberAddress] = useState();
  const [applicant, setApplicant] = useState();
  const [sharesRequested, setSharesRequested] = useState(0);
  const [lootRequested, setLootRequested] = useState(0);
  const [tributeOffered, setTributeOffered] = useState(0);
  const [tributeToken, setTributeToken] = useState();
  const [paymentRequested, setPaymentRequested] = useState(0);
  const [paymentToken, setPaymentToken] = useState();
  const [proposalDetails, setProposalDetails] = useState();


  const [molochContract, setMolochContract] = useState();
  const [focusedProposal, setFocusedProposal] = useState();
  const buttons = (getter, setter) => (
    <Tooltip placement="right" title="* 10 ** 18">
      <div
        type="dashed"
        style={{ cursor: "pointer" }}
        onClick={async () => {
          try {
            console.log({ getter });
            console.log(utils.parseEther(getter));
            setter(utils.parseEther(getter));
          } catch {
            console.log("enter a value");
          }
        }}
      >
        ✴️
      </div>
    </Tooltip>
  );

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <div style={{ margin: 8 }}>
          <h2>Moloch Address</h2>
          <p>Enter the address of a Moloch you previously summoned.</p>
          <Input
            onChange={e => {
              setMolochAddress(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              setMolochContract(readContracts && readContracts.Moloch && readContracts.Moloch.attach(molochAddress));
              console.log(molochContract && molochContract.address);
            }}
          >
            Connect to Moloch
          </Button>
        </div>
      </div>

      {molochContract && (
        <div>
          <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
            <h2>Moloch</h2>
            <Address
              address={molochContract ? molochContract.address : null}
              ensProvider={mainnetProvider}
              fontSize={16}
            />
            <Divider />
            <h2>Members</h2>
            <Input
              onChange={e => {
                setMemberAddress(e.target.value);
              }}
            />
            <Button
              style={{ marginTop: 8 }}
              onClick={async () => {
                const memberInfo = molochContract && await molochContract.members(memberAddress)
                console.log({ memberInfo })
              }}
            >
              Get Member Info
            </Button>
            <Divider />
            <h2>Proposal</h2>
            <Divider />
            <h3>Applicant</h3>
            <p>
              What is the address of the applicant (beneficiary of funds, loot, shares)
            </p>
            <Input
              onChange={e => {
                setApplicant(e.target.value);
              }}
            />

            <h3>Request</h3>
            <p>
              Payment Token
            </p>
            Your Token:
            <Address
              address={readContracts && readContracts.AnyERC20 ? readContracts.AnyERC20.address : null}
              ensProvider={mainnetProvider}
              fontSize={16}
            />
            <Input
              onChange={e => {
                setPaymentToken(e.target.value);
              }}
            />
            <p>
              Payment Requested
            </p>
            <Input
              defaultValue={paymentRequested}
              suffix={buttons(paymentRequested, setPaymentRequested)}
              onChange={e => {
                setPaymentRequested(e.target.value);
              }}
            />
            <p>
              Loot requested
            </p>
            <Input
              defaultValue={lootRequested}
              onChange={e => {
                setLootRequested(e.target.value);
              }}
            />
            <p>
              Shares requested
            </p>
            <Input
              defaultValue={sharesRequested}
              onChange={e => {
                setSharesRequested(e.target.value);
              }}
            />

            <h3>Tribute</h3>
            <p>What is the sender offering</p>
            <p>
              Tribute Token
            </p>
            Your Token:
            <Address
              address={readContracts && readContracts.AnyERC20 ? readContracts.AnyERC20.address : null}
              ensProvider={mainnetProvider}
              fontSize={16}
            />
            <Input
              onChange={e => {
                setTributeToken(e.target.value);
              }}
            />
            <p>
              Tribute Offered
            </p>
            <Input
              defaultValue={tributeOffered}
              suffix={buttons(tributeOffered, setTributeOffered)}
              onChange={e => {
                setTributeOffered(e.target.value);
              }}
            />
            <h3>Details</h3>
            <p>
              enter a description for the proposal
            </p>
            <TextArea
              rows={4}
              placeholder="..."
              onChange={e => {
                setProposalDetails(e.target.value);
              }}
            />
            <Button
              style={{ marginTop: 8 }}
              onClick={async () => {
                const writeMoloch = writeContracts && writeContracts.Moloch && writeContracts.Moloch.attach(molochAddress);

                const result = tx(
                  writeMoloch.submitProposal(
                    applicant,
                    sharesRequested,
                    lootRequested,
                    tributeOffered,
                    tributeToken,
                    paymentRequested,
                    paymentToken,
                    proposalDetails,
                  ),
                  update => {
                    console.log("📡 Transaction Update:", update);
                    if (update && (update.status === "confirmed" || update.status === 1)) {
                      console.log(" 🍾 Transaction " + update.hash + " finished!");
                      console.log(
                        " ⛽️ " +
                        update.gasUsed +
                        "/" +
                        (update.gasLimit || update.gas) +
                        " @ " +
                        parseFloat(update.gasPrice) / 1000000000 +
                        " gwei",
                      );
                    }
                  },
                );
                console.log("awaiting metamask/web3 confirm result...", result);
                console.log(await result);
              }}
            >
              Submit Proposal
            </Button>
            <Divider />
          </div>
      {focusedProposal && (
          <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
            <h2>Proposal</h2>
          </div>
      )}

          <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
            <h2>Events:</h2>
            <List
              bordered
              dataSource={setMolochProposalEvents}
              renderItem={item => {
                console.log({ item })
                return (
                  <List.Item key={item.blockNumber + "_" + item.applicant}>
                    Proposed by:
                    <Address address={item.applicant} ensProvider={mainnetProvider} fontSize={16} />
                    <Button onClick={() => setFocusedProposal('a')}>Select Proposal</Button>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
