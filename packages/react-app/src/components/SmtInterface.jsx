import React, { useState, useEffect } from "react";
import { Card, Collapse, InputNumber, Button, Tabs, Divider, Result, Typography, message, Row, Col } from "antd";
import ReactJson from 'react-json-view';
import { useSMT } from "../hooks";

export default function SmtInterface() {

  const [treeLeaves, setTreeLeaves] = useState({});

  const tree = useSMT(treeLeaves);

  const [insertKey, setinsertkey] = useState();
  const [insertValue, setInsertValue] = useState();

  // const proof = tree.createProof(BigInt(0));
  // console.log("smt proof: ", proof);


  async function insertToTree() {
    const res = await tree.insert(insertKey, insertValue);
    console.log(res);

    const treeLeafKeys = Object.keys(treeLeaves);
    let newTreeLeaves= {}
    for (let i = 0; i < treeLeafKeys.length; i++) {
      newTreeLeaves[treeLeafKeys[i]] = treeLeaves[treeLeafKeys[i]];
    }
    newTreeLeaves[insertKey] = insertValue;
    setTreeLeaves(newTreeLeaves);
  }

  return (
    <div>
      <p>{tree.root ? tree.root.toString() : "undefined"}</p>
      {/*<p>{tree.oldRoot ? tree.oldRoot.toString() : "undefined"}</p>*/}
      <span>
        <InputNumber
          onChange={(n) => setinsertkey(n)}
        />
      </span>
      <span>
        <InputNumber
          onChange={(n) => setInsertValue(n)}
        />
      </span>
      <Button
        onClick={insertToTree}
        type="primary"
      >
        Insert
      </Button>
    </div>
  );
}
