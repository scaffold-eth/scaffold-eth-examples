import { Input } from "antd";
import React, { useEffect, useState } from "react";

// small change in useEffect, display currentValue if it's provided by user

/*
  ~ What it does? ~

  Displays input field for GTC/USD amount, with an option to convert between GTC and USD

  ~ How can I use? ~

  <GTCerInput
    autofocus
    mode={"USD"}
    price={price}
    value=100
    placeholder="Enter amount"
    onChange={value => {
      setAmount(value);
    }}
  />

  ~ Features ~

  - Provide price={price} of GTCer and easily convert between USD and GTC
  - Provide value={value} to specify initial amount of GTCer
  - Provide placeholder="Enter amount" value for the input
  - Control input change by onChange={value => { setAmount(value);}}
*/

export default function GTCerInput(props) {
  const [mode, setMode] = useState(props.mode || (props.price ? "USD" : "GTC"));
  const [display, setDisplay] = useState();
  const [value, setValue] = useState();

  const currentValue = typeof props.value !== "undefined" ? props.value : value;

  const option = title => {
    if (!props.price) return "";
    return (
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (mode === "USD") {
            setMode("GTC");
            setDisplay(currentValue);
          } else {
            setMode("USD");
            if (currentValue) {
              const usdValue = "" + (parseFloat(currentValue) * props.price).toFixed(2);
              setDisplay(usdValue);
            } else {
              setDisplay(currentValue);
            }
          }
        }}
      >
        {title}
      </div>
    );
  };

  let prefix;
  let addonAfter;
  if (mode === "USD") {
    prefix = "$";
    addonAfter = option("USD 🔀");
  } else {
    prefix = "Ξ";
    addonAfter = option("GTC 🔀");
  }

  useEffect(() => {
    if (!currentValue) {
      setDisplay("");
    }
  }, [currentValue]);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return (
    <Input
      placeholder={props.placeholder ? props.placeholder : "amount in " + mode}
      autoFocus={props.autoFocus}
      prefix={prefix}
      value={display}
      addonAfter={addonAfter}
      onChange={async e => {
        const newValue = e.target.value;
        if (mode === "USD") {
          const possibleNewValue = parseFloat(newValue);
          if (possibleNewValue) {
            const GTCValue = parseFloat(possibleNewValue / props.price).toFixed(15);
            setValue(GTCValue);
            if (typeof props.onChange === "function") {
              props.onChange(GTCValue);
            }
            setDisplay(newValue);
          } else {
            if (typeof props.onChange === "function") {
              props.onChange();
            }
            setDisplay();
          }
        } else {
          setValue(newValue);
          if (typeof props.onChange === "function") {
            props.onChange(newValue);
          }
          setDisplay(newValue);
        }
      }}
    />
  );
}
