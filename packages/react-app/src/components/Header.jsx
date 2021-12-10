import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Your Page Title Here"
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
