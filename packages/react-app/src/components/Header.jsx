import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" rel="noopener noreferrer">
      <PageHeader
        title="💧 Multidrop"
        subTitle="forkable Native & ERC-20 token drop platform"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
