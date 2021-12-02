import React, { useState, useEffect } from "react";
import { Card, Collapse, InputNumber, Button, Tabs, Divider, Result, Typography, message, Row, Col } from "antd";
import ReactJson from 'react-json-view';
import { poseidon } from "circomlibjs";

export default function PoseidonInterface({inputsArr}) {

  const [inputs, setInputs] = useState([0,0]);

  const [poseidonHash, setPoseidonHash] = useState()


  return (
    <div style={{margin: "auto", width: "60vw"}}>
      <div style={{padding: "2vw"}}>
        <InputNumber
          onChange={(n) => {
            let tmpArr = inputs;
            tmpArr[0] = n;
            setInputs(tmpArr);
            setPoseidonHash(poseidon(tmpArr));
          }}
        />
        <InputNumber
          onChange={(n) => {
            let tmpArr = inputs;
            tmpArr[1] = n;
            setInputs(tmpArr);
            setPoseidonHash(poseidon(tmpArr));
          }}
        />
      </div>
      <div style={{padding: "2vw"}}>
        <p>{poseidonHash ? poseidonHash.toString() : "undefined"}</p>
      </div>
    </div>
  );
}
