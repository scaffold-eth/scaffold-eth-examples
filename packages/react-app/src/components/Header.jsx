import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/" >
      <PageHeader
        title="👮 Token Gated Content"
        subTitle="If you have ETH you can watch a video of @austingriffith chugging a beer!"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
