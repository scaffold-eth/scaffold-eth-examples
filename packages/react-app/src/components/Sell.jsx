import React from "react";
import { Button, Input, Tooltip } from "antd";
import { createSellOrder} from "../rarible/createOrders";
const { utils } = require("ethers");

export default function Sell(props) {
  const [sellState, setSellState] = React.useState();
  const [sellForEthValue, setSellForEthValue] = React.useState();
  const buttons = (
    <Tooltip placement="right" title="* 10 ** 18">
      <div
        type="dashed"
        style={{ cursor: "pointer" }}
        onClick={async () => {
          try {
            setSellForEthValue(utils.parseEther(sellForEthValue));
          } catch {
            console.log("enter a value");
          }
        }}
      >
        ✴️
      </div>
    </Tooltip>
  );
  return (
    <div>
      <Button onClick={() => setSellState("ETH")}>Sell for ETH</Button>

      {(sellState && sellState === "ETH" && (
        <div>
          <Input
            value={sellForEthValue}
            placeholder="ETH"
            onChange={e => {
              setSellForEthValue(e.target.value);
            }}
            suffix={buttons}
          />
          <Button
            onClick={() =>
              createSellOrder("MAKE_ERC721_TAKE_ETH", props.provider, {
                accountAddress: props.accountAddress,
                makeERC721Address: props.ERC721Address,
                makeERC721TokenId: props.tokenId,
                ethAmt: sellForEthValue.toString(),
              })
            }
          >
            Create Sell Order
          </Button>
        </div>
      )) ||
        (sellState === "YERC" && <span>YERC</span>)}
    </div>
  );
}
