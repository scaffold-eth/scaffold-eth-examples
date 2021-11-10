/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { BigNumber, utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Tooltip } from "antd";
import React, { useState } from "react";
import { Address, Balance } from "../components";

const { TextArea } = Input;

const molochDefaults = {
  periodLength: 60,
  votingPeriods: 10,
  gracePeriods: 3,
  dilutionBound: 3,
  proposalDeposit: utils.parseEther('1'),
  processingReward: utils.parseEther('0.5')
};


const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

export default function MolochSummoner({
  setMolochSummonerEvents,
  mainnetProvider,
  tx,
  readContracts,
  writeContracts,
}) {
  const [summoner, setSummoner] = useState("loading...");
  const [periodLength, setPeriodLength] = useState(molochDefaults.periodLength);
  const [votingPeriods, setVotingPeriods] = useState(molochDefaults.votingPeriods);
  const [gracePeriods, setGracePeriods] = useState(molochDefaults.gracePeriods);
  const [dilutionBound, setDilutionBound] = useState(molochDefaults.dilutionBound);
  const [proposalDeposit, setProposalDeposit] = useState(molochDefaults.proposalDeposit);
  const [processingReward, setProcessingReward] = useState(molochDefaults.processingReward);
  const [tokens, setTokens] = useState("loading...");

  const buttons = (getter, setter) => (
    <Tooltip placement="right" title="* 10 ** 18">
      <div
        type="dashed"
        style={{ cursor: "pointer" }}
        onClick={async () => {
          try {
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
        <h2>Moloch Summoner</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <h2>Token(s)</h2>
          <p>
            What is the primary token contract address? Can whitelist more here as well, separated by new lines. The
            first one will be the primary token.
          </p>
          Your Token:
          <Address
            address={readContracts && readContracts.AnyERC20 ? readContracts.AnyERC20.address : null}
            ensProvider={mainnetProvider}
            fontSize={16}
          />
          <TextArea
            placeholder="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
            onChange={e => {
              setTokens(e.target.value);
            }}
          />
          <h2>Periods</h2>
          <p>How many seconds per period?.</p>
          <Input
            defaultValue={periodLength}
            onChange={e => {
              setPeriodLength(e.target.value);
            }}
          />
          <h2>Voting</h2>
          <p>How many periods will the voting period last?</p>
          <Input
            defaultValue={votingPeriods}
            onChange={e => {
              setVotingPeriods(e.target.value);
            }}
          />
          <p>How many periods will the grace period last?</p>
          <Input
            defaultValue={gracePeriods}
            onChange={e => {
              setGracePeriods(e.target.value);
            }}
          />
          <p>What will be the dilution bound?</p>
          <Input
            defaultValue={dilutionBound}
            onChange={e => {
              setDilutionBound(e.target.value);
            }}
          />
          <h2>Deposits</h2>
          <p>How much is the proposal deposit (needs to be in wei - 18 decimals)?</p>
          <Input
            value={proposalDeposit}
            suffix={buttons(proposalDeposit, setProposalDeposit)}
            onChange={e => {
              setProposalDeposit(e.target.value);
            }}
          />
          <p>How much is the processing reward?</p>
          <Input
            value={processingReward}
            suffix={buttons(processingReward, setProcessingReward)}
            onChange={e => {
              setProcessingReward(e.target.value);
            }}
          />
          <h2>Summoners and starting shares</h2>
          <p>
            Enter one address and amount of shares on each line. Separate address and amount with a space. Be sure to
            include yourself as desired.
          </p>
          <TextArea
            rows={4}
            placeholder="0xB77A431e5fF09E7531aF1451f7170Ef134A2Db42 1"
            onChange={e => {
              setSummoner(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const summonerSplit = summoner.split("\n").map(elem => elem.split(" "));
              const [summonerAddresses, summonerShares] = transpose(summonerSplit);
              const tokenAddresses = tokens.split("\n");

              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(
                writeContracts.MolochSummoner.summonMoloch(
                  summonerAddresses,
                  tokenAddresses,
                  periodLength,
                  votingPeriods,
                  gracePeriods,
                  proposalDeposit,
                  dilutionBound,
                  processingReward,
                  summonerShares,
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
            Summon Moloch!
          </Button>
        </div>
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={setMolochSummonerEvents}
          renderItem={item => {
            console.log({item})
            return (
              <List.Item key={item.blockNumber + "_" + item.moloch}>
                Summoned: 
                <Address address={item.moloch} ensProvider={mainnetProvider} fontSize={16} />
              </List.Item>
            );
          }}
        />
      </div>

    </div>
  );
}
