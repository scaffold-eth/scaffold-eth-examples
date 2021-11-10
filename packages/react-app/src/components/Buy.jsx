import React from "react";
import { Button, Input, Tooltip } from "antd";
import { createSellOrder} from "../rarible/createOrders";
import { RARIBLE_EXCHANGE_RINKEBY } from "../constants";
const { utils } = require("ethers");

function handleMenuClick(e) {
  console.log("click", e);
}

export default function Buy(props) {
  const [sellState, setSellState] = React.useState();
  const [sellForEthValue, setSellForEthValue] = React.useState();
  const [salt, setSalt] = React.useState();
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
      <Button onClick={() => setSellState("YERC")}>Sell for YERC</Button>
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
          <Input
            value={salt}
            placeholder="Salt... 0-10000"
            onChange={e => {
              setSalt(e.target.value);
            }}
          />
          <Button
            onClick={() =>
              createSellOrder("MAKE_ERC721_TAKE_ETH", props.provider, {
                accountAddress: props.accountAddress,
                exchangeContract: RARIBLE_EXCHANGE_RINKEBY,
                makeERC721Address: props.ERC721Address,
                makeERC721TokenId: props.tokenId,
                ethAmt: sellForEthValue.toString(),
                salt: salt.toString(),
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
