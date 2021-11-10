import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/" >
      <PageHeader
        title="🚛 ether.delivery"
        subTitle="Sign a message with your wallet and get your first ether."
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
