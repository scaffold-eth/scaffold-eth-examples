import React, { useState, useEffect } from "react";
import { Card, Collapse, InputNumber, Button, Tabs, Divider, Result, Typography, message, Row, Col } from "antd";
import ReactJson from 'react-json-view';
import { useSMT } from "../hooks";

const { Panel } = Collapse;

export default function SmtInterface() {

  const [treeLeaves, setTreeLeaves] = useState({});

  const tree = useSMT(treeLeaves);

  const [insertKey, setinsertkey] = useState();
  const [insertValue, setInsertValue] = useState();

  const [lastInsert, setLastInsert] = useState();

  // const proof = tree.createProof(BigInt(0));
  // console.log("smt proof: ", proof);


  async function insertToTree() {
    const res = await tree.insert(insertKey, insertValue);

    const resKeys = Object.keys(res);
    let newRes= {}
    for (let i = 0; i < resKeys.length; i++) {
      newRes[resKeys[i]] = res[resKeys[i]].toString();
    }
    setLastInsert(newRes);

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
    <div style={{margin: "auto", width: "52vw"}}>
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
      <span>
        <Button
          onClick={insertToTree}
          type="primary"
        >
          Insert
        </Button>
      </span>
      <div style={{padding: "3%"}}>
        <Collapse>
          <Panel header="Last Insert Data">
            <div style={{textAlign: "left"}}>
              <ReactJson
                src={lastInsert}
                style={{fontSize: "0.7em"}}
                displayArrayKey={false}
                displayDataTypes={false}
              />
            </div>
          </Panel>
        </Collapse>
      </div>
    </div>
  );
}
