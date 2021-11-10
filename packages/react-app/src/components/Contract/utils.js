import React from "react";
import { Address } from "..";
const { utils } = require("ethers");

const tryToDisplay = (thing, react) => {
  if (thing && thing.toNumber) {
    try {
      return thing.toNumber();
    } catch (e) {
      return "Ξ" + utils.formatUnits(thing, "ether");
    }
  }
  if (thing && thing.indexOf && thing.indexOf("0x") === 0 && thing.length === 42) {
    if(react){
      return <Address address={thing} fontSize={22} />;
    }else{
      return thing;
    }

  }
  return JSON.stringify(thing);
};

export default tryToDisplay;
