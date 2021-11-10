import { apiRequest } from "./util";

export const login = async ({ signer }) => {
  console.log({ signer });
  const address = await signer.getAddress();
  console.log({ address });

  const nonceResult = await apiRequest({path: `v1/sessions?PublicAddress=${address}`, method: "GET"});

  const nonce = nonceResult.nonce;
  console.log({ nonce });

  // sign nonce
  const msg = `LET ME IN!!! ${nonce}`
  const signature = await signer.signMessage(msg);

  const loginResult = await apiRequest({path: `v1/sessions`, method: "POST", data: {
    publicAddress: address,
    signature,
  }});
  
  console.log({loginResult})

  return loginResult.token;
};

export const logout = async ({setJwtAuthToken}) => setJwtAuthToken(null)
