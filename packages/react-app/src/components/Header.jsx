import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://bank.scaffoldeth.io" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="👛 bank.scaffoldeth.io"
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
