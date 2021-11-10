import { utils } from "ethers";
const ethUtil = require('ethereumjs-util');

export function id(str) {
	return `0x${ethUtil.keccak256(str).toString("hex").substring(0, 8)}`;
}

export function enc(token, tokenId) {
  const coder = new utils.AbiCoder()
	if (tokenId) {
		return coder.encode(["address", "uint256"], [token, tokenId]);
	} else {
		return coder.encode("address", token);
	}
}

export const ETH = id("ETH");
export const ERC20 = id("ERC20");
export const ERC721 = id("ERC721");
export const ERC1155 = id("ERC1155");
export const ORDER_DATA_V1 = id("V1");
export const TO_MAKER = id("TO_MAKER");
export const TO_TAKER = id("TO_TAKER");
export const PROTOCOL = id("PROTOCOL");
export const ROYALTY = id("ROYALTY");
export const ORIGIN = id("ORIGIN");
export const PAYOUT = id("PAYOUT");
