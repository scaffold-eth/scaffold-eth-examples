import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth/tree/meta-multi-sig" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="👛 Nifty.ink Bank"
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
