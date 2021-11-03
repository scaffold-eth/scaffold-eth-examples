import { useState, useEffect } from "react";
import { useLocalStorage } from "./";
import { SMT, hexToDec } from "@cedoor/smt";
import { poseidon, smt } from "circomlibjs";

const hash = (nodes) => poseidon(nodes);
// const initTree = new SMT(hash, true);

const zeroTree = async () => {await smt.newMemEmptyTrie()};
const initTree = zeroTree;

export default function useSMT(leaves) {

  const [tree, setTree] = useState(initTree);

  useEffect(async () => {
    // const newTree = new SMT(hash, true);
    const newTree = await smt.newMemEmptyTrie();
    if (leaves){
      const leafKeys = Object.keys(leaves);
      for (let i = 0; i < leafKeys.length; i++) {
        // newTree.add(BigInt(leafKeys[i]), BigInt(leaves[leafKeys[i]]));
        await newTree.insert(leafKeys[i], leaves[leafKeys[i]]);
      }
    }
    setTree(newTree);
  }, []);

  return tree;
}
