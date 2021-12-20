import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ethers } from "ethers";
import axios from "axios";

import { formatEther } from "@ethersproject/units";
import { usePoller } from "eth-hooks";

const BOOSTPERCENT = 0

/*

  BOOSTPERCENT: 5%

  This adds a percentage to the mint price in the frontend.
  This helps avoid "collisions" as multiple users are minting
    at the same time and the price moves on a curve.
  There is a refund at the very end of the transaction to
    send back whatever value wasn't needed in minting the NFT.
*/

const OPENSEA_LINK = "https://testnets.opensea.io/assets/"

const MainUI = ({ loadWeb3Modal, address, tx, priceToMint, readContracts, writeContracts }) => {
  const [collection, setCollection] = useState({
    loading: true,
    items: [],
  });

  const getTokenURI = async (ownerAddress, index) => {
    const id = await readContracts.GigaNFT.tokenOfOwnerByIndex(ownerAddress, index);
    const tokenURI = await readContracts.GigaNFT.tokenURI(id);
    console.log("tokenURI",tokenURI)
    try{
      const metadata = await axios.get(tokenURI);
      if(metadata){
        return { ...metadata.data, id, tokenURI /*, approved: approved === writeContracts.GigaNFT.address */ };
      }
    }catch(e){console.log(e)}

    //console.log("metadata",metadata.data)
    //const approved = await readContracts.GigaNFT.getApproved(id);

  };

  const loadCollection = async () => {
    if (!address || !readContracts || !writeContracts) return;
    setCollection({
      loading: true,
      items: [],
    });
    const balance = (await readContracts.GigaNFT.balanceOf(address)).toNumber();
    console.log("YOUR BALANCE:",balance)
    const tokensPromises = [];
    for (let i = 0; i < balance; i += 1) {
      tokensPromises.push(getTokenURI(address, i));
    }
    const tokens = await Promise.all(tokensPromises);
    setCollection({
      loading: false,
      items: tokens,
    });
  };

  useEffect(() => {
    if (readContracts.GigaNFT) loadCollection();
  }, [address, readContracts, writeContracts]);

  console.log("collection.items",collection.items)

  return (
    <div style={{ maxWidth: 768, margin: "20px auto", paddingBottom: 256 }}>
      {address ? (
        <>
          <div style={{ display: "grid", margin: "0 auto" }}>
            <h3 style={{ marginBottom: 25 }}>My collection: </h3>
            {collection.items.length === 0 && <p>Your collection is empty</p>}
            {collection.items.length > 0 &&
              collection.items.map(item => {
                console.log("ITEM",item)
                return (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <div style={{padding:32}}>
                      {item?<a href={OPENSEA_LINK+(readContracts&&readContracts.GigaNFT&&readContracts.GigaNFT.address)+"/"+item.id} target="_blank"><img
                        style={{ maxWidth: "150px", display: "block", margin: "0 auto", marginBottom: "20px" }}
                        src={item.image}
                        alt="GigaNFT"
                      /></a>:"🎁 Not Revealed Yet"}
                    </div>
                  </div>
                )
              })}
          </div>

          <Button
            style={{ marginTop: 15 }}
            type="primary"
            onClick={async () => {
              const priceRightNow = await readContracts.GigaNFT.price();

              const boostedPriceToAvoidCollisionsUpTheCurve = priceRightNow.add(priceRightNow.mul(BOOSTPERCENT).div(100))

              try {
                const txCur = await tx(writeContracts.GigaNFT.mintItem(address, { value: boostedPriceToAvoidCollisionsUpTheCurve }));
                await txCur.wait();
              } catch (e) {
                console.log("mint failed", e);
              }
              loadCollection();
            }}
          >
            Mint for Ξ{priceToMint && (+ethers.utils.formatEther(priceToMint.add(priceToMint.mul(BOOSTPERCENT).div(100)))).toFixed(4)}
          </Button>
        </>
      ) : (
        <Button key="loginbutton" type="primary" onClick={loadWeb3Modal}>
          Connect Ethereum Wallet To Mint
        </Button>
      )}
    </div>
  );
};

export default MainUI;
