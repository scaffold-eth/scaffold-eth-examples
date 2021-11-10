import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a
      href="https://thegraph.academy/delegators/releasing-from-vesting-contract/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <PageHeader title="🦺 GRT Vesting Contract" subTitle="release your vested GRT" style={{ cursor: "pointer" }} />
    </a>
  );
}
