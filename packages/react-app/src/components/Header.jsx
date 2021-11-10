import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" >
      <PageHeader
        title="🔥 Torchy.Club"
        subTitle="pass it on!"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
