import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/">
      <PageHeader
        title="👣 Planck.Nifty.ink"
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
