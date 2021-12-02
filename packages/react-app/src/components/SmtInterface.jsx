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

  const [selectedKey, setSelectedKey] = useState();
  const [selectedInclProof, setSelectedInclProof] = useState();

  // const proof = tree.createProof(BigInt(0));
  // console.log("smt proof: ", proof);


  async function insertToTree() {
    const res = await tree.insert(insertKey, insertValue);

    const resKeys = Object.keys(res);
    let newRes= {}
    for (let i = 0; i < resKeys.length; i++) {
      if (!Array.isArray(res[resKeys[i]])) {
        newRes[resKeys[i]] = res[resKeys[i]].toString();
      } else {
        let tempArr = [];
        for (let j = 0; j < res[resKeys[i]].length; j++) {
          tempArr.push(res[resKeys[i]][j].toString());
        }
        newRes[resKeys[i]] = tempArr;
      }
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

  async function generateInclProof() {
    const res = await tree.find(selectedKey);

    const resKeys = Object.keys(res);
    let newRes= {}
    for (let i = 0; i < resKeys.length; i++) {
      if (!Array.isArray(res[resKeys[i]])) {
        newRes[resKeys[i]] = res[resKeys[i]].toString();
      } else {
        let tempArr = [];
        for (let j = 0; j < res[resKeys[i]].length; j++) {
          tempArr.push(res[resKeys[i]][j].toString());
        }
        newRes[resKeys[i]] = tempArr;
      }
    }
    setSelectedInclProof(newRes);

    console.log(res);
  }

  return (
    <div style={{margin: "auto", width: "60vw"}}>
      <p>{tree.root ? tree.root.toString() : "undefined"}</p>
      {/*<p>{tree.oldRoot ? tree.oldRoot.toString() : "undefined"}</p>*/}
      <div style={{paddingRight: "8vw", textAlign: "right"}}>
        <span>
          <InputNumber
            onChange={(n) => setinsertkey(n)}
          />
        </span>
        <span>
          <InputNumber
            onChange={(n) => setInsertValue(n)}
            stringMode
          />
        </span>
        <span>
          <Button
            onClick={insertToTree}
            type="primary"
          >
            Insert Data
          </Button>
        </span>
      </div>
      <div style={{padding: "3%", textAlign: "left"}}>
        <Collapse>
          <Panel header="Last Insert Data">
              <ReactJson
                src={lastInsert}
                style={{fontSize: "0.7em"}}
                displayArrayKey={false}
                displayDataTypes={false}
              />
          </Panel>
        </Collapse>
      </div>
      <div style={{paddingRight: "8vw", textAlign: "right"}}>
        <InputNumber
          onChange={(n) => setSelectedKey(n)}
        />
        <Button
          onClick={generateInclProof}
          type="primary"
        >
          Generate Proof
        </Button>
      </div>
      <div style={{padding: "3%", textAlign: "left"}}>
        <Collapse>
          <Panel header="SMT Proof">
              <ReactJson
                src={selectedInclProof}
                style={{fontSize: "0.7em"}}
                displayArrayKey={false}
                displayDataTypes={false}
              />
          </Panel>
        </Collapse>
      </div>
    </div>
  );
}
