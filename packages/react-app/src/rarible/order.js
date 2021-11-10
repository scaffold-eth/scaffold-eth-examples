import {TypedDataUtils} from "eth-sig-util"
import {bufferToHex} from "ethereumjs-util"
const EIP712 = require("./EIP712");

function AssetType(assetClass, data) {
	return { assetClass, data }
}

export async function sign(provider, order, account) {
	const data = EIP712.createTypeData(order.domain, order.structType, order.struct, order.types);
  console.log({data})
	return (await EIP712.signTypedData(provider, account, data)).sig;
}

export async function getMessageHash(order) {
	const data = EIP712.createTypeData(order.domain, order.structType, order.struct, order.types);
  console.log({data})
	return bufferToHex(TypedDataUtils.sign(data))
}
