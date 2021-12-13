import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Your Page Title Here"
        subTitle={
          <a target="_blank" href="https://github.com/scaffold-eth/scaffold-eth-examples/tree/Giga-NFT-project">view source</a>
        }
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
