import { utils } from "ethers";
import { sign } from "./lazyMint";
import { RARIBLE_BASE_URL } from "../constants";

export async function generateTokenId(contract, minter) {
	console.log("generating tokenId for", contract, minter)
  const raribleTokenIdUrl = `${RARIBLE_BASE_URL}nft/collections/${contract}/generate_token_id?minter=${minter}`
  const res = await fetch(raribleTokenIdUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const resJson = await res.json();
  console.log({resJson})
	return resJson.tokenId
}

async function createLazyMintForm(tokenId, contract, minter, ipfsHash, type, supply) {
  // const tokenId = await generateTokenId(contract, minter)
	console.log("generated tokenId", tokenId)
  if (type == "ERC721") {
	return {
		"@type": "ERC721",
		contract: contract,
		tokenId: tokenId,
		uri: `/ipfs/${ipfsHash}`,
		creators: [{ account: minter, value: "10000" }],
		royalties: []
	}

  }
  else if (type == "ERC1155") {
	return {
		"@type": "ERC1155",
		contract: contract,
		tokenId: tokenId,
		uri: `/ipfs/${ipfsHash}`,
		creators: [{ account: minter, value: "10000" }],
		royalties: [],
    supply: supply
	}

  }
}

export async function createLazyMint(tokenId, provider, contract, minter, ipfsHash, type, supply) {
  const form = await createLazyMintForm(tokenId, contract, minter, ipfsHash, type, supply)
  const signature = await sign(provider, 3, contract, form, minter, type)
	return { ...form, signatures: [signature] }
}

export async function putLazyMint(form) {
  const raribleMintUrl = `${RARIBLE_BASE_URL}nft/mints`
  const raribleMintResult = await fetch(raribleMintUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });
  console.log({raribleMintResult})
}