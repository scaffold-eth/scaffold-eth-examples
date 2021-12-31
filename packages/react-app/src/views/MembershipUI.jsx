import React, { useState, useEffect } from "react";
import {
  Card,
  Collapse,
  Input,
  InputNumber,
  Button,
  Tabs,
  Divider,
  Result,
  Typography,
  message, Row,
  Statistic,
  Col,
  List,
} from "antd";
import {
  useContractReader,
} from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import ReactJson from 'react-json-view';
import { poseidon } from "circomlibjs";
import { useSMT } from "../hooks";

const snarkjs = require("snarkjs");
const crypto = require("crypto");

const { Panel } = Collapse;
const { Text } = Typography;

export default function MembershipUI({
  addWasm,
  addZkey,
  proveWasm,
  proveZkey,
  nLevels,
  address,
  localProvider,
  readContracts,
  writeContracts,
  tx,
}) {

  const root = useContractReader(readContracts, "YourContract", "root");
  const memberCount = useContractReader(readContracts, "YourContract", "nextKey");

  const addLeafEvents = useEventListener(readContracts, "YourContract", "AddLeaf", localProvider, 0);

  const voteEvents = useEventListener(readContracts, "YourContract", "CreateVote", localProvider, 0);

  const [leaves, setLeaves] = useState({});
  useEffect(() => {
      let lfv = {};
      for (let i = addLeafEvents.length-1; i >= 0; i--) {
        lfv[addLeafEvents[i].args.key] = addLeafEvents[i].args.value.toString();
        // lfv.push(addLeafEvents[i].args.value);
      }
      setLeaves(lfv);
  }, [addLeafEvents]);

  const calcedSMT = useSMT(leaves);

  const [secrets, setSecrets] = useState([0, 0]);
  const [poseidonHash, setPoseidonHash] = useState()

  const [addLeafCalldata, setAddLeafCalldata] = useState();
  const [proveMemCalldata, setProveMemCalldata] = useState();

  const [memberKey, setMemberKey] = useState();
  const [memberSecret, setMemberSecret] = useState(0);
  const [memberNullifier, setMemberNullifier] = useState(0);

  const [voteState, setVoteState] = useState(false);

  const [activeVoteId, setActiveVoteId] = useState(0);

  const voteCount = useContractReader(readContracts, "YourContract", "voteResult", [activeVoteId]);

  function parseSolidityCalldata(prf, sgn) {

    let calldata = [
      [prf.pi_a[0], prf.pi_a[1]],
      [
        [prf.pi_b[0][1], prf.pi_b[0][0]],
        [prf.pi_b[1][1], prf.pi_b[1][0]]
      ],
      [prf.pi_c[0], prf.pi_c[1]],
      [...sgn]
    ];

    return calldata;
  }

  function generateSecrets() {
    const randArr = [BigInt("0x"+crypto.randomBytes(32).toString('hex')), BigInt("0x"+crypto.randomBytes(32).toString('hex'))];
    setAddLeafCalldata(0);
    setSecrets(randArr);
    setPoseidonHash(poseidon(randArr));
  }

  async function genAddLeafTx() {
    let addLeafInputs = {
      oldRoot: BigInt(root.toString()),
      newKey: BigInt(memberCount.toString()),
      newValue: poseidonHash,
      oldKey: "0",
      oldValue: "0",
      siblings: new Array(nLevels).fill("0")
    };

    const res = await calcedSMT.insert(BigInt(memberCount.toString()), poseidonHash);

    addLeafInputs.oldKey = res.oldKey;
    addLeafInputs.oldValue = res.oldValue;

    for (let i = 0; i < addLeafInputs.siblings.length; i++) {
      if (res.siblings[i]) {
        addLeafInputs.siblings[i] = res.siblings[i];
      }
    }

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(addLeafInputs, addWasm, addZkey);
    const calldata = parseSolidityCalldata(proof, publicSignals);
    setAddLeafCalldata(calldata);
  }

  async function genProveMemberTx() {
    let proveMemberInputs = {
      root: BigInt(root.toString()),
      voteId: activeVoteId,
      key: memberKey,
      secret: memberSecret,
      nullifier: memberNullifier,
      siblings: new Array(nLevels + 1).fill(BigInt(0))
    };

    const res = await calcedSMT.find(memberKey);

    for (let i = 0; i < proveMemberInputs.siblings.length; i++) {
      if (res.siblings[i]) {
        proveMemberInputs.siblings[i] = res.siblings[i];
      }
    }

    console.log("inputs:", proveMemberInputs);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(proveMemberInputs, proveWasm, proveZkey);
    const calldata = parseSolidityCalldata(proof, publicSignals);

    const vkey = await snarkjs.zKey.exportVerificationKey(proveZkey);
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    console.log(verified);
    console.log("calldata", calldata);
    console.log("result", res);
    setProveMemCalldata(calldata);
  }

  return (
    <div style={{padding: "3%"}}>
      <div style={{padding: "3%"}}>
        <Statistic
          value={root}
          title="Current Root"
          groupSeparator=""
          valueStyle={{ fontSize: "0.8em" }}
        />
        <Statistic
          value={calcedSMT.root}
          title="Calculated Root"
          groupSeparator=""
          valueStyle={{ fontSize: "0.8em" }}
        />
        <Statistic
          value={memberCount}
          title="Member Count"
        />
      </div>

      <div style={{margin: "auto", width: "72vw"}}>
        <div style={{paddingBottom: "3%"}}>
          <Button
            onClick={() => generateSecrets()}
          >
            Generate Secrets
          </Button>
        </div>
        <Collapse>
          <Panel>
            <Text code copyable type="danger">{secrets[0].toString()}</Text>
            <Text code copyable type="danger">{secrets[1].toString()}</Text>
            <Text code copyable type="warning">{poseidonHash ? poseidonHash.toString() : 0}</Text>
          </Panel>
        </Collapse>
        <div style={{padding: "3%"}}>
          <Button
            onClick={() => genAddLeafTx()}
          >
            Generate Join calldata
          </Button>
          <Button
            danger
            onClick={() => tx( writeContracts.YourContract.addLeaf(...addLeafCalldata) )}
          >
            Join
          </Button>
        </div>
      </div>

      <div style={{ width: "60vw", margin: "auto" }}>
        <div style={{ width: "20vw", margin: "auto", textAlign: "left" }}>
          <List
            dataSource={voteEvents}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={`Vote ID: ${item.args.voteId.toString()}`}
                />
                <Button
                  type={activeVoteId == item.args.voteId ? "text" : "default"}
                  onClick={() => setActiveVoteId(item.args.voteId)}
                >
                  Select
                </Button>
              </List.Item>
            )}
          />
        </div>

        <div style={{ padding: "3%" }}>
          <Button
            onClick={() => tx( writeContracts.YourContract.createVote(Math.floor(Date.now() / 1000) + 1020) )}
          >
            Create a New Vote
          </Button>
        </div>
        <div>
          <Statistic
          title="Selected Vote ID"
            value={activeVoteId}
          />
        </div>
        <div>
          <Statistic
            title="Vote Count"
            value={voteCount}
          />
        </div>
        <div style={{ padding: "1%" }}>
          <div style={{ float: "left" }}>
            <h4>Key:</h4>
          </div>
          <Input
            style={{width: "60vw"}}
            onChange={(n) => setMemberKey(n.target.value)}
          />
        </div>
        <div style={{ padding: "1%" }}>
          <div style={{ float: "left" }}>
            <h4>Secret:</h4>
          </div>
          <Input
            style={{width: "60vw"}}
            onChange={(n) => setMemberSecret(n.target.value)}
          />
        </div>
        <div style={{ padding: "1%" }}>
          <div style={{ float: "left" }}>
            <h4>Nullifier:</h4>
          </div>
          <Input
            style={{width: "60vw"}}
            onChange={(n) => setMemberNullifier(n.target.value)}
          />
        </div>
        <div style={{ padding: "3%" }}>
          <Button
            type={voteState ? "primary" : undefined}
            // disabled={voteState}
            onClick={() => setVoteState(true)}
          >
            Vote Yay
          </Button>
          <Button
            type={!voteState ? "primary" : undefined}
            // disabled={!voteState}
            onClick={() => setVoteState(false)}
          >
            Vote Nay
          </Button>
        </div>
        <div style={{ padding: "3%" }}>
          <Button
            type="primary"
            onClick={() => {
              genProveMemberTx()
            }}
          >
            Confirm
          </Button>
          <Button
            // type="primary"
            danger
            onClick={() => {
              tx( writeContracts.YourContract.proveMembership(...proveMemCalldata, voteState) )
            }}
          >
            Prove
          </Button>
        </div>
      </div>
    </div>
  );

}
