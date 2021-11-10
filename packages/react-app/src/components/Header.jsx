import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="/" >
      <PageHeader
        title="💰 Build Guild Support"
        subTitle={(
          <div>
            round 0 - <a target="_blank" href="https://etherscan.io/address/0xad6Eae5D5C3efe8C643572705adC6aD2e95404CE#code">mainnet contract</a>
          </div>
        )}
      />
    </a>
  );
}
