import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="/" >
      <PageHeader
        title="💰 Emoji.Support"
        subTitle="mainnet"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
