import { Button, Divider } from "antd";
import React, { useState } from "react";
import { login } from "../util/auth";
import { apiRequest } from "../util/util";

export default function ExampleUI({
  purpose,
  setPurposeEvents,
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [jwt, setJwt] = useState();
  const [authResponse, setAuthResponse] = useState();

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Example Auth:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = await login({ signer: userSigner });
              console.log(result);
              setJwt(result);
            }}
          >
            Login!
          </Button>
          <Button
            style={{ marginTop: 8 }}
            onClick={() => {
              setJwt(null);
              setAuthResponse(null);
            }}
          >
            Logout!
          </Button>
          {jwt && <div>Cool you are authenticated</div>}
          <div style={{ padding: 16, paddingBottom: 150 }}>JWT: {jwt}</div>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = await apiRequest({ path: `v1/helloAuth`, accessToken: jwt });
              setAuthResponse(result.message);
            }}
          >
            Say Hi!
          </Button>
          <div style={{ padding: 16, paddingBottom: 150 }}>{authResponse}</div>
        </div>
      </div>
    </div>
  );
}
