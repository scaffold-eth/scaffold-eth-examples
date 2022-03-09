import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://twitter.com/blind_nabler" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Harberger Tax NFT"
        subTitle="by @blind_nabler"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
