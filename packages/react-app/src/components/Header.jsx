import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth/tree/bytes-land" target="_blank" rel="noopener noreferrer">
      <PageHeader
        style={{color:"#eeeeee"}}
        title="💎 Bytes.Land"
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
