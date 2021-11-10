import { formatEther } from "@ethersproject/units";
import React, { useState } from "react";
import { useBalance } from "../hooks";

export default function GtcBalance(props) {
    const [dollarMode, setDollarMode] = useState(true);
  
    // const [listening, setListening] = useState(false);
  
  
    let floatBalance = parseFloat("0.00");
  
    let usingBalance = 0;
  
    if (typeof props.balance !== "undefined") {
      usingBalance = props.balance;
    }
    if (typeof props.value !== "undefined") {
      usingBalance = props.value;
    }
  
    console.log('PROPS VALUE', props.value)
    console.log('PROPS PRICE', props.price)
  
    if (usingBalance) {
      const etherBalance = formatEther(usingBalance);
      parseFloat(etherBalance).toFixed(2);
      floatBalance = parseFloat(etherBalance);
    }
  
    let displayBalance = floatBalance.toFixed(4);
  
    const price = props.price || props.dollarMultiplier;
  
    if (price && dollarMode) {
      displayBalance = "$" + (floatBalance * price).toFixed(2);
    }
  
    return (
      <span
        style={{
          verticalAlign: "middle",
          fontSize: props.size ? props.size : 24,
          padding: 8,
          cursor: "pointer",
        }}
        onClick={() => {
          setDollarMode(!dollarMode);
        }}
      >
        {displayBalance}
      </span>
    );
  }
  