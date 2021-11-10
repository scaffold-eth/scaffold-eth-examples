/* eslint-disable jsx-a11y/accessible-emoji */

import React from "react";


export default function Hints({yourLocalBalance, mainnetProvider, price, address }) {

  return (
    <div>
      <div style={{ margin: 32 }}>
        Welcome to 🏗 <b>scaffold-eth</b>: erc20 edition
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>👷</span>
        Check out a few example <b>contracts</b> in
        <span style={{ marginLeft: 4, backgroundColor: "#f9f9f9", padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          packages/hardhat/contracts
        </span>
        built on <a href="https://docs.openzeppelin.com/contracts/3.x/erc20" target="_blank" rel="noopener noreferrer">OpenZeppelin's ERC20 implementation</a>
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🛰</span>
        <b>compile / deploy</b> with
        <span style={{ marginLeft: 4, backgroundColor: "#f1f1f1", padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          yarn run deploy
        </span>
      </div>

      <div style={{ margin: 32 }}>
        <p>💺 <b>Fixed</b> has a fixed supply. Try adding in your address to the constructor() mint statement!</p>
        <p>📈 <b>Unlimited</b> lets anyone mint 10 more tokens. Can you limit that to just one trusted address?</p>
        <p>🔥 <b>Burnable</b> lets any user burn all their tokens. Can you let the user specify the number of tokens to burn?</p>
        <p>🎈 <b>Inflating</b> increases the number of available tokens with every new block. Can you reduce this reward over time?</p>
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>👀</span>
        <b>explore</b> the Example UI or the raw Contract
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🚀</span>
        Your <b>contract artifacts</b> are automatically injected into your frontend at
        <span style={{ marginLeft: 4, backgroundColor: "#f9f9f9", padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          packages/react-app/src/contracts/
        </span>
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🎛</span>
        Edit your <b>frontend</b> in
        <span style={{ marginLeft: 4, backgroundColor: "#f9f9f9", padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          packages/reactapp/src/App.js
        </span>
      </div>

    </div>
  );
}
