import React from "react";
import Blockies from "react-blockies";

import { CopyOutlined } from "@ant-design/icons";

import { Tooltip, Typography, Skeleton, message } from "antd";
import { useLookupAddress } from "../hooks";

// changed value={address} to address={address}

/*
  ~ What it does? ~

  Displays an address with a blockie image and option to copy address

  ~ How can I use? ~

  <Address
    address={address}
    ensProvider={mainnetProvider}
    blockExplorer={blockExplorer}
    fontSize={fontSize}
  />

  ~ Features ~

  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
  - Provide fontSize={fontSize} to change the size of address text
*/

const { Text } = Typography;

const blockExplorerLink = (address, blockExplorer) => `${blockExplorer || "https://etherscan.io/"}${"address/"}${address}`;

export default function Address(props) {

  const address = props.value || props.address;

  const ens = false//useLookupAddress(props.ensProvider, address);

  if (!address) {
    return (
      <span>
        <Skeleton avatar paragraph={{ rows: 1 }} />
      </span>
    );
  }

  let displayAddress = address.substr(0, 6);

  if (ens && ens.indexOf("0x")<0) {
    displayAddress = ens;
  } else if (props.size === "short") {
    displayAddress += "..." + address.substr(-4);
  } else if (props.size === "long") {
    displayAddress = address;
  }

  const etherscanLink = blockExplorerLink(address, props.blockExplorer);
  if (props.minimized) {
    return (
      <span style={{ verticalAlign: "middle" }}>
        <a /*style={{ color: "#222222" }}*/ target={"_blank"} href={etherscanLink} rel="noopener noreferrer">
          <Blockies seed={address.toLowerCase()} size={8} scale={2} />
        </a>
      </span>
    );
  }
  let extraStyle = {}
  if(props.invert){
    extraStyle.color = "#FFFFFF"
  }
  let text;
  if (props.onChange) {
    text = (
      <Text editable={{ onChange: props.onChange }}   >
        <span style={extraStyle}>
          {displayAddress}
        </span>
      </Text>
    );
  } else {
    text = (
      <Text onClick={()=>{
        const el = document.createElement('textarea');
        el.value = address;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        const iconHardcodedSizeForNow = 380
        const iconPunkSize = 40
        message.success(
          <span style={{position:"relative"}}>
           Copied Address
          </span>
        );
      }}>
        <span style={extraStyle}>
          {displayAddress} <CopyOutlined style={{color:"#FFFFFF"}}/>
        </span>
      </Text>
    );
  }


  return (
    <Tooltip title="Public Address">
      <span style={{ verticalAlign: "middle" }}>
        <Blockies seed={address.toLowerCase()} size={8} scale={3} />
      </span>
      <span style={{ verticalAlign: "middle", paddingLeft: 8, fontSize: props.fontSize?props.fontSize:28 }}>{text}</span>

    </Tooltip>
  );
}
