import { useState } from "react";
import { useLocalStorage } from "./";
const circomlibjs = require("circomlibjs");
const crypto = require("crypto");
const bip39 = require("bip39");

export default function useBurnerEdDSA() {

  function genBurnerEdDSA() {
    const prv = crypto.randomBytes(32);
    // console.log("private key: ", prvKey);

    // const mnem = bip39.entropyToMnemonic(prv);
    // console.log("mnemonic phrase:", mnem);

    // const pub = circomlibjs.eddsa.prv2pub(prv);
    // console.log("public key:", pub);

    return prv;
  }

  const [burnerEdDSA, setBurnerEdDSA] = useLocalStorage(
    "burnerEdDSA",
  );

  function resetBurnerEdDSA() {
    setBurnerEdDSA(genBurnerEdDSA());
  }

  return [burnerEdDSA, resetBurnerEdDSA];
  // return burnerEdDSA;

}
