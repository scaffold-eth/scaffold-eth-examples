import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="💭 BuildGuidl Roundtable"
        subTitle="forkable community idea board"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
