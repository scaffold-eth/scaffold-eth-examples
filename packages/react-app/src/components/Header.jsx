import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth/tree/uniswapper" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 scaffold-eth"
        subTitle="forkable Defi interface"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
