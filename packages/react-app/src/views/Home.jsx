import React, { useState } from "react";

import { Button } from "antd";
import { useContractReader } from "eth-hooks";
import { NftCard, Address } from "../components";
import { parseGroth16ToSolidityCalldata } from "../helpers";
import { useSMT } from "../hooks";

import { ethers } from "ethers";
const snarkjs = require("snarkjs");
const crypto = require("crypto");

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function Home({
  address,
  readContracts,
  writeContracts,
  tx,
  wasm,
  zkey
}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract

  const [heldLeafData, setHeldLeafData] = useState({});
  const heldTree = useSMT(heldLeafData);
  const [selectedKey, setSelectedKey] = useState();

  const [commitLeafData, setCommitLeafData] = useState({});
  const commitTree = useSMT(commitLeafData);

  const blankTree = useSMT();

  const bal = useContractReader(readContracts, "Test721", "balanceOf", [address]);
  const test721Addr = readContracts && readContracts.Test721 ? readContracts.Test721.address : null;

  const comRoot = useContractReader(readContracts, "YourContract", "addrToCommitment", [address]);

  function updateLeaf(key, value) {
    setHeldLeafData(
      {
        ...heldLeafData,
        [key]: value
      }
    );
  }

  function commit721(index, commitKey, value) {
    setCommitLeafData(
      {[commitKey]: value}
    );
    setSelectedKey(index);
    console.log(index);
  }

  async function generateCommitCalldata() {
    const commitKey = Object.keys(commitLeafData)[0];
    // console.log(commitKey);
    // console.log(commitLeafData[commitKey]);

    const commitRes = await blankTree.insert(commitKey, commitLeafData[commitKey]);
    // console.log(commitRes.oldKey);

    const commitInputs = {
      heldRoot: BigInt(heldTree.root.toString()),
      indices: [selectedKey],
      ids: [commitLeafData[commitKey]],
      heldSiblings: [new Array(5).fill(BigInt(0))],
      commitNewKeys: [BigInt(commitKey)],
      commitOldKeys: [commitRes.oldKey],
      commitSiblings: [new Array(4).fill(BigInt(0))]
    }

    const heldProof = await heldTree.find(selectedKey);
    // console.log(heldProof.siblings);

    for (let i = 0; i < 5; i++) {
      // console.log(heldProof.siblings[i]);
      if (heldProof.siblings[i]) {
        commitInputs.heldSiblings[i] = heldProof.siblings[i];
      } else {
        commitInputs.heldSiblings[i] = BigInt(0);
      }
    }

    for (let i = 0; i < 4; i++) {
      if (commitRes.siblings[i]) {
        commitInputs.commitSiblings[i] = commitRes.siblings[i];
      }
    }

    blankTree.delete(commitKey);

    // console.log("proof inputs: ",commitInputs);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(commitInputs, wasm, zkey);
    const vkey = await snarkjs.zKey.exportVerificationKey(zkey);
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    console.log("Proof Verification: ", verified);
    // console.log(publicSignals);
    const proofCaldata = parseGroth16ToSolidityCalldata(proof, publicSignals);

    tx( writeContracts.YourContract.commitHiddenTokens(test721Addr, ...proofCaldata) );
  }

  function commitOnChain() {

  }

  const nftDisp = [];
  for (let i=0; i<bal; i++) {
    nftDisp.push(
      <div>
        <NftCard
          address={address}
          tokenAddress={test721Addr}
          readContracts={readContracts}
          index={i}
          key={i}
          updateLeaf={updateLeaf}
          commit721={commit721}
        />
      </div>
    )
  }

  return (
    <div style={{ margin: "auto"}}>
      <div style={{ padding: "2%" }}>
        <h4>Holdings Merkle Root:</h4>
        <h3>{heldTree.root ? heldTree.root.toString() : "undefined"}</h3>
      </div>
      <div style={{ padding: "2%" }}>
        <h4>Commit Merkle Root:</h4>
        <h3>{comRoot ? comRoot.toString() : "undefined"}</h3>
      </div>
      <div style={{ padding: "2%" }}>
        <h4>New Commit Merkle Root:</h4>
        <h3>{commitTree.root ? commitTree.root.toString() : "undefined"}</h3>
        <Button
          danger
          type="primary"
          onClick={() => {
            generateCommitCalldata();
          }}
        >
          Commit On Chain
        </Button>
      </div>
      <h1>Balance: {bal ? bal.toString():null}</h1>
      {nftDisp}
      <div style={{ padding: "2%" }}>
        <Button
          type="primary"
          size="large"
          onClick={() => tx( writeContracts.Test721.mint() )}
        >
          Mint
        </Button>
      </div>
    </div>
  );
}

export default Home;
