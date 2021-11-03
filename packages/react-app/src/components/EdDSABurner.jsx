import React, { useState, useEffect } from "react";
import { Card, Collapse, Input, Button, Tabs, Divider, Result, Typography, message, Row, Col } from "antd";
import ReactJson from 'react-json-view';
import { useBurnerEdDSA, useLocalStorage } from "../hooks";
const circomlibjs = require("circomlibjs");
const crypto = require("crypto");
const bip39 = require("bip39");

const { Panel } = Collapse;


export default function EdDSABurner({
  address,
}) {
  const [burnerEdDSA, resetBurnerEdDSA] = useBurnerEdDSA();
  if (!burnerEdDSA) resetBurnerEdDSA();

  const [message, setMessage] = useState();
  const [signedMessage, setSignedMessage] = useState();
  const [messageSig, setMessageSig] = useState();
  // const burnerEdDSA = useBurnerEdDSA();
  // console.log("private key: ", burnerEdDSA.data);
  // console.log("public key: ", circomlibjs.eddsa.prv2pub(Buffer.from(burnerEdDSA)));
  // const msg = crypto.randomBytes(32);
  // const msg = "this is a message";

  // let sig1 = circomlibjs.eddsa.sign(Buffer.from(burnerEdDSA), Buffer.from(msg));
  // console.log("signed message: ", sig1);

  function signMessage(msg) {
    const msgSig = circomlibjs.eddsa.sign(Buffer.from(burnerEdDSA), Buffer.from(msg));
    setMessageSig(msgSig);
  }

  // let ver1 = circomlibjs.eddsa.verify(Buffer.from(msg), (sig1), circomlibjs.eddsa.prv2pub(Buffer.from(burnerEdDSA)));
  // console.log("verification: ", ver1);

  function verifySig(msg, sig) {
    return circomlibjs.eddsa.verify(Buffer.from(msg), (sig), circomlibjs.eddsa.prv2pub(Buffer.from(burnerEdDSA)));
  }

  return (
    <div style={{margin: "auto", width: "46vw", paddingTop: "4%"}}>
      <div style={{textAlign: "left"}}>
        <Collapse>
          <Panel>
            <ReactJson
              src={{
                entropy: bip39.entropyToMnemonic(burnerEdDSA)
              }}
              style={{fontSize: "0.7em"}}
              displayArrayKey={false}
              displayDataTypes={false}
              collapseStringsAfterLength={60}
            />
          </Panel>
        </Collapse>
      </div>
      <div style={{paddingTop: "3%"}}>
        <Button
          onClick={resetBurnerEdDSA}
        >
          Reset Burner EdDSA
        </Button>
      </div>
      <div style={{paddingTop: "3%"}}>
        <Input
          onChange={(e) => {
            setMessage(e.target.value);
            setSignedMessage(undefined);
            setMessageSig(undefined);
          }}
        />
      </div>
      <div style={{paddingTop: "3%"}}>
        <Button
          type="primary"
          onClick={() => {
            signMessage(message);
            setSignedMessage(message);
          }}
        >
          sign message
        </Button>
        <div style={{paddingTop: "3%"}}>
          <p>signed message: {signedMessage}</p>
        </div>
        <div style={{paddingTop: "3%"}}>
          <p>signature valid: {signedMessage && messageSig ? verifySig(signedMessage, messageSig) ? "true" : "false" : "message unsigned"}</p>
        </div>
      </div>
    </div>
  );
}
