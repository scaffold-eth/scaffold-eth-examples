import React, { useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { Input, Button, Typography, Spin, Slider, Statistic, Row, Col } from "antd";
import ReactJson from "react-json-view";

import { randE, to256Bytes } from '../vdf/rsa';
import { evaluate } from "../vdf/vdf.js";

import worker from 'workerize-loader!../vdf/vdf.worker';

let instance = worker()  // `new` is optional

const { Text } = Typography;

export default function VdfInterface() {

  const [input, setInput] = useState(randE());

  const [userT, setUserT] = useState(8);

  const [vdfProof, setVdfProof] = useState(1);

  function vdf() {
    setVdfProof(undefined);
    instance.vdf(input, userT).then( proof => {
      console.log(proof);
      setVdfProof(proof);
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
      </div>
    </div>
  );

}
