const EIP712 = require("./EIP712");

const ERC721Types = {
	Part: [
		{name: 'account', type: 'address'},
		{name: 'value', type: 'uint96'}
	],
	Mint721: [
		{name: 'tokenId', type: 'uint256'},
		{name: 'tokenURI', type: 'string'},
		{name: 'creators', type: 'Part[]'},
		{name: 'royalties', type: 'Part[]'}
	]
};

const ERC1155Types = {
	Part: [
		{name: 'account', type: 'address'},
		{name: 'value', type: 'uint96'}
	],
	Mint1155: [
		{name: 'tokenId', type: 'uint256'},
		{name: 'supply', type: 'uint256'},
		{name: 'tokenURI', type: 'string'},
		{name: 'creators', type: 'Part[]'},
		{name: 'royalties', type: 'Part[]'}
	]
};

export async function sign(provider, chainId, contractAddress, form, account, type) {
	let data
	if (type === 'ERC721') {
	data = EIP712.createTypeData({
    name: 'Mint721',
    version: '1',
    chainId,
    verifyingContract: contractAddress
  },
  'Mint721',
  {...form, tokenURI: form.uri},
  ERC721Types
  );
  console.log({data})

	} else if (type === 'ERC1155') {
	data = EIP712.createTypeData({
    name: 'Mint1155',
    version: '1',
    chainId,
    verifyingContract: contractAddress
  },
  'Mint1155',
  {...form, tokenURI: form.uri},
  ERC1155Types
  );
  console.log({data})

	}
	console.log({data})
	return (await EIP712.signTypedData(provider, account, data)).sig;
}
