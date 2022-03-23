import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" rel="noopener noreferrer">
      <PageHeader title="💬 Roundtable" subTitle="web3 idea board" className="inline-flex cursor-pointer" />
    </a>
  );
}
