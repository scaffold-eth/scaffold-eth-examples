import React, { useState, useEffect } from "react";
import { Card, Collapse, InputNumber, Button, Tabs, Divider, Result, Typography, message, Row, Col } from "antd";
import ReactJson from 'react-json-view';
import { useSMT } from "../hooks";

export default function SmtInterface() {
  const tree = useSMT([1, 1]);

  // const proof = tree.createProof(BigInt(0));
  // console.log("smt proof: ", proof);

  if (tree.db) console.log(tree.db.nodes);

  return (
    <div>
      <p>{tree.root ? tree.root.toString() : "undefined"}</p>
      {/*<p>{tree.oldRoot ? tree.oldRoot.toString() : "undefined"}</p>*/}
    </div>
  );
}
