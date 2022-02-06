import React, { useState, useEffect } from "react";
import { Card, Button } from "antd";
import { Address } from "../components";
import { useContractReader } from "eth-hooks";

export default function NftCard({
  address,
  tokenAddress,
  readContracts,
  index,
  updateLeaf,
  commit721,
}) {

  const tokenId = useContractReader(readContracts, "Test721", "tokenOfOwnerByIndex", [address, index]);
  // updateLeaf()
  useEffect(() => {
    if (tokenId) {
      updateLeaf(index, tokenId.toString());
    }
  }, [tokenId]);

  return (
    <div style={{ width: "25vw", margin: "auto" }}>
      <Card
        title={`Token ID: ${tokenId}`}
      >
        {/*<div>
          <Address
            address={address}
          />
        </div>*/}
        <div>
          <h3>Contract Address:</h3>
          <Address
            address={tokenAddress}
          />
        </div>
        <div>
          <Button
            size="small"
            onClick={() => {
              commit721(index, 1, tokenId);
            }}
          >
            Set Commitment
          </Button>
        </div>
      </Card>
    </div>
  );

}
