import { ethers } from "ethers";
import { isValidSignature } from "./eip1271";

export async function verifySignature(address, sig, hash, provider) {
  const messageToArray = ethers.utils.arrayify(hash);
  const arrayToHash = ethers.utils.hashMessage(messageToArray);
  const bytecode = "0x00"; // await provider.getCode(address);/////force this for now because it is failing here
  console.log(bytecode);
  const signer = ethers.utils.verifyMessage(ethers.utils.arrayify(hash), sig);
  console.log(signer);
  if (!bytecode || bytecode === "0x" || bytecode === "0x0" || bytecode === "0x00") {
    return signer.toLowerCase() === address.toLowerCase();
  }
  return isValidSignature(address, sig, arrayToHash, provider);
}
