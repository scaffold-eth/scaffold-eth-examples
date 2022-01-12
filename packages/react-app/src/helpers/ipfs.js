const { BufferList } = require("bl");
import { create } from "ipfs-http-client";
export const ipfs = create({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

export async function addToIPFS(file) {
  const fileAdded = await ipfs.add(file);

  return fileAdded;
}

export function urlFromCID(cid) {
  return `https://ipfs.infura.io/ipfs/${cid}`;
}

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
// export async function getFromIPFS(hashToGet) {
//   for await (const file of ipfs.get(hashToGet)) {
//     console.log(file.path);
//     if (!file.content) continue;
//     const content = new BufferList();
//     for await (const chunk of file.content) {
//       content.append(chunk);
//     }
//     console.log(content);
//     return content;
//   }
// }
