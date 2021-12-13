import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ethers } from "ethers";
import axios from "axios";

import { formatEther } from "@ethersproject/units";
import { usePoller } from "eth-hooks";

const BOOSTPERCENT = 5

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

  //  console.log("metadata",metadata.data)
    //const approved = await readContracts.GigaNFT.getApproved(id);

  };

  const loadCollection = async () => {
    if (!address || !readContracts || !writeContracts) return;
    setCollection({
      loading: true,
      items: [],
    });
    const balance = (await readContracts.GigaNFT.balanceOf(address)).toNumber();
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


  const approveForBurn = async id => {
    try {
      const approveTx = await tx(writeContracts.GigaNFT.approve(writeContracts.GigaNFT.address, id));
      await approveTx.wait();
    } catch (e) {
      console.log("Approve tx error:", e);
    }
    loadCollection();
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
              collection.items.map(item => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  <div style={{padding:32}}>
                    {item?<img
                      style={{ maxWidth: "150px", display: "block", margin: "0 auto", marginBottom: "20px" }}
                      src={item.image}
                      alt="GigaNFT"
                    />:"🎁 Not Revealed Yet"}
                  </div>
                </div>
              ))}
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
