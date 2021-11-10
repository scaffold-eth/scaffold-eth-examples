import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/">
      <PageHeader
        title="👨‍🎤 mrdee.eth "
        subTitle="⏳ ETH Stream"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
