import React, { useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { hexlify, zeroPad } from "@ethersproject/bytes";
import { Input, Button, Typography, Spin, Slider, Statistic, Row, Col, message } from "antd";
import ReactJson from "react-json-view";

import { Transactor as tx } from "../helpers";
import { randE } from '../vdf/rsa';
import { evaluate, verify } from "../vdf/vdf.js";

import worker from 'workerize-loader!../vdf/vdf.worker';

let instance = worker()  // `new` is optional

const { Text } = Typography;

function to256Bytes(i) {
  return hexlify(zeroPad(i, 256));
}

function toSolidityCalldataProof(g, t, proof) {
  let newProof = [
    to256Bytes(BigNumber.from(g).toHexString()),
    to256Bytes(BigNumber.from(proof.pi).toHexString()),
    to256Bytes(BigNumber.from(proof.y).toHexString()),
    to256Bytes(BigNumber.from(proof.q).toHexString()),
    '0x',
    proof.challenge.nonce,
    t
  ];
  return newProof;
}

export default function VdfInterface({ verifyFn }) {

  const [input, setInput] = useState(randE());

  const [userT, setUserT] = useState(8);

  const [vdfProof, setVdfProof] = useState(1);

  const [vdfSolidityProof, setVdfSolidityProof] = useState()

  const [verifyResult, setVerifyResult] = useState(undefined);

  const [verifySolResult, setVerifySolResult] = useState(undefined);

  function vdf() {
    setVerifyResult(undefined);
    setVerifySolResult(undefined);
    setVdfProof(undefined);
    instance.vdf(input, userT).then( proof => {
      console.log(proof);
      setVdfProof(proof);
      proof = toSolidityCalldataProof(input, userT, proof)
      console.log(proof);
      setVdfSolidityProof(proof);
    });
  }

  const vdfProofDisp = (
    <div style={{textAlign: "left", margin: "auto", width: "48vw"}}>
      <ReactJson
        src={vdfProof}
        style={{fontSize: "0.7em"}}
        displayArrayKey={false}
        displayDataTypes={false}
        collapseStringsAfterLength={96}
      />
    </div>
  );

  return (
    <div style={{padding: "3%"}}>
      <div>
        <div>
          <Text style={{maxWidth: "70%"}} code ellipsis>{input.toString()}</Text>
        </div>
        <div style={{padding: "2%"}}>
          <Button
            danger
            onClick={() => {
              setInput(randE());
            }}
          >
            Random!
          </Button>
        </div>
      </div>
      <div>
        <div>
          <Statistic title="T set to:" value={userT} disabled={!vdfProof}/>
        </div>
        <div style={{display: 'inline-block', width: "32vw"}}>
          <Slider
            defaultValue={userT}
            min={1}
            max={16}
            onChange={
              (v) => setUserT(v)
            }
            marks={{
              1: "1",
              4: "4",
              8: {
                style: {
                  color: '#228b22'
                },
                label: <strong>8</strong>,
              },
              12: {
                style: {
                  color: '#f50',
                },
                label: <p>12</p>,
              },
              16: {
                style: {
                  color: '#f50',
                },
                label: <strong>16</strong>,
              },
            }}
          />
        </div>

        <div style={{padding: "2%"}}>
          <Button
            disabled={!vdfProof}
            danger
            onClick={vdf}
          >
            Run VDF Worker
          </Button>
        </div>
      </div>
      <div style={{padding: "2vw"}}>
        <div>
          {vdfProof ? vdfProofDisp : <Spin sixe="large"/>}
        </div>
        <div>
          <Button
            type="primary"
            onClick={
              () => {
                try {
                  let res = verify(
                    input,
                    userT,
                    {
                      challenge: {
                        l: BigNumber.from(vdfProof.challenge.l),
                        nonce: BigNumber.from(vdfProof.challenge.nonce)
                      },
                      y: BigNumber.from(vdfProof.y),
                      pi: BigNumber.from(vdfProof.pi),
                      q: BigNumber.from(vdfProof.q),
                    }
                  );
                  setVerifySolResult(res);
                } catch (err) {
                  console.error(err);
                  message.error("Something has gone wrong");
                }
              }
            }
          >
            Verify Locally
          </Button>
        </div>
        {verifySolResult ? JSON.stringify(verifySolResult) : "undefined"}
        <div style={{paddingTop: "2vw"}}>
          <Button
            type="primary"
            onClick={
              async () => {
                try {
                  let res = await verifyFn(...vdfSolidityProof);
                  setVerifyResult(res);
                } catch (err) {
                  console.error(err);
                  message.error("Something has gone wrong");
                }
              }
            }
          >
            Verify VDF with smart contract
          </Button>
        </div>
        {verifyResult ? JSON.stringify(verifyResult) : "undefined"}
      </div>
    </div>
  );

}
