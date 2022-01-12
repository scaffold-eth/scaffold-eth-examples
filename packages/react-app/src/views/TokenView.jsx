import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOnBlock, usePoller } from "eth-hooks";
import { useExternalContractLoader } from "../hooks";
import nftABI from "../contracts/ERC721ABI";
import { ethers } from "ethers";
import { Button } from "antd";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function TokenView({ tx, localProvider, address, readContracts, writeContracts, loadWeb3Modal }) {
  const { addressParam } = useParams();
  const [collection, setCollection] = useState({
    loading: true,
    items: [],
  });
  const [floor, setFloor] = useState("0.0");
  const [supply, setSupply] = useState();
  const [limit, setLimit] = useState();
  const [nftPrice, setNFTPrice] = useState();

  const NFT = useExternalContractLoader(localProvider, addressParam, nftABI);

  usePoller(async () => {
    if (NFT && address) {
      const nftNowPrice = await NFT.price();
      const floorPrice = await NFT.floor();
      const supply = await NFT.currentToken();
      const limit = await NFT.limit();
      setSupply(supply.toNumber());
      setLimit(limit.toNumber());
      setFloor(ethers.utils.formatEther(floorPrice));
      setNFTPrice(nftNowPrice);
    }
  }, 15000);

  const loadCollection = async () => {
    if (!address || !NFT) return;
    setCollection({
      loading: true,
      items: [],
    });
    const balance = (await NFT.balanceOf(address)).toNumber();
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

  const redeem = async id => {
    try {
      const redeemTx = await tx(NFT.redeem(id));
      await redeemTx.wait();
    } catch (e) {
      console.log("redeem tx error:", e);
    }
    loadCollection();
  };

  const approveForBurn = async id => {
    try {
      const approveTx = await tx(NFT.approve(NFT.address, id));
      await approveTx.wait();
    } catch (e) {
      console.log("Approve tx error:", e);
    }
    loadCollection();
  };

  useEffect(() => {
    if (NFT) loadCollection();
  }, [address, NFT, NFT]);

  console.log({ floor, supply, limit, nftPrice });

  return (
    <div className="container mx-auto mt-5">
      {address ? (
        <>
          <div style={{ display: "row", margin: "0 auto" }}>
            <div style={{ marginLeft: "20px" }}>
              <Button
                style={{ marginTop: 15 }}
                type="primary"
                disabled={supply >= limit}
                onClick={async () => {
                  const priceRightNow = await NFT.price();
                  setNFTPrice(priceRightNow);
                  try {
                    const txCur = await tx(NFT.mintItem(address, { value: nftPrice }));
                    await txCur.wait();
                  } catch (e) {
                    console.log("mint failed", e);
                  }
                  loadCollection();
                }}
              >
                MINT for Ξ{nftPrice && (+ethers.utils.formatEther(nftPrice)).toFixed(4)}
              </Button>
            </div>
            {collection.items.length === 0 && <p>Your collection is empty</p>}
            {collection.items.length > 0 &&
              collection.items.map(item => (
                <div
                  style={{
                    border: "1px solid #cccccc",
                    padding: 16,
                    width: 380,
                    margin: "auto",
                    marginTop: 20,
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <img
                    style={{ maxWidth: "150px", display: "block", margin: "0 auto", marginBottom: "10px" }}
                    src={item.image}
                    alt="Your NFT"
                  />
                  <div style={{ marginLeft: "20px" }}>
                    <p style={{ textAlign: "center", marginTop: 15 }}>Contract: {item.contractName}</p>
                    <Button style={{ width: "100%", minWidth: 100 }} onClick={() => redeem(item.id)}>
                      Redeem
                    </Button>
                    <p style={{ textAlign: "center", marginTop: 15 }}>{item.name}</p>
                  </div>
                </div>
              ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 15 }}>Current floor price = {floor.substr(0, 6)} ETH</p>
        </>
      ) : (
        <Button key="loginbutton" type="primary" onClick={loadWeb3Modal}>
          Connect to mint
        </Button>
      )}
    </div>
  );
}

export default TokenView;
