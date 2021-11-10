import { ethers } from "ethers";
import { verifySignature } from "./VerifySignature";

// export default async function getSignature(provider, signingAddress, types, values) {
//   console.log("INK", provider, signingAddress, types, values);

//   const hashToSign = await ethers.utils.solidityKeccak256(
//     types, // ['bytes','bytes','address','address','string','string','uint256'],
//     values, // ['0x19','0x0',contract.address,artist,inkUrl,jsonUrl,limit]
//   );

//   console.log("hashToSign", hashToSign);

//   const signature = await provider.send("personal_sign", [hashToSign, signingAddress]);

//   const signerSignedMessage = await verifySignature(signingAddress, signature, hashToSign, provider);
//   console.log("signature", signature);

//   if (signerSignedMessage) {
//     return signature;
//   }
//   throw console.log("Signer is not the signingAddress!");
// }

export default async function getSignature(provider, signingAddress, hashToSign) {
  console.log("hashToSign", hashToSign);

  const signature = await provider.send("personal_sign", [hashToSign, signingAddress]);

  const signerSignedMessage = await verifySignature(signingAddress, signature, hashToSign, provider);
  console.log("signature", signature);

  if (signerSignedMessage) {
    return signature;
  }
  throw console.log("Signer is not the signingAddress!");
}
