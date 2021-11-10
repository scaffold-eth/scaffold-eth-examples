import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 scaffold-eth"
        subTitle="forkable Ethereum dev stack: TheGraph demo"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
