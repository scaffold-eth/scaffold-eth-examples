import React from "react";
import { PageHeader } from "antd";
import { NETWORKS } from '../constants'

export default function Header() {

  let color = process.env.REACT_APP_NETWORK ? NETWORKS[process.env.REACT_APP_NETWORK].color : NETWORKS['localhost'].color

  let network = process.env.REACT_APP_NETWORK ? ` on ${process.env.REACT_APP_NETWORK}!` : ' on localhost'

  return (
    <a href="https://github.com/austintgriffith/scaffold-eth/tree/aave-ape" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 scaffold-eth lend & ape"
        subTitle={`forkable Aave interface${network}`}
        style={{ cursor: "pointer", backgroundColor: color }}
      />
    </a>
  );
}
