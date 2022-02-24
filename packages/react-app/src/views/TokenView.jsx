import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import classnames from "classnames";
import { ethers } from "ethers";
import { Alert, Button, Row, Col, Card } from "antd";
import { Address } from "../components";
import { useContractReader } from "eth-hooks";
import { useRetFundERC721 } from "../hooks";
import nftABI from "../contracts/ERC721ABI";
import { ipfs } from "../helpers";

const zero = ethers.BigNumber.from("0");

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function TokenView({
  tx,
  localProvider,
  mainnetProvider,
  userSigner,
  address,
  readContracts,
  writeContracts,
  loadWeb3Modal,
}) {
  const [minting, setMinting] = useState(false);
  const [myCollection, setMyCollection] = useState([]);
  const { addressParam } = useParams();

  const [info, readRetFund, writeRetFund, refreshRetFund] = useRetFundERC721(
    localProvider,
    userSigner,
    addressParam,
    nftABI,
  );

  // const transferEvents = useEventListener({ readRetFund }, "readRetFund", "Transfer", localProvider);
  const myBalance = (useContractReader({ readRetFund }, "readRetFund", "balanceOf", [address]) || zero).toNumber();

  const isMintComplete = info?.totalSupply && info?.limit ? info.totalSupply.eq(info.limit) : false;
  const hasFloor = info?.floor && info?.floor.gt(zero);

  const bigNumberRender = n => {
    return n ? n?.toString() : null;
  };

  const mint = async () => {
    setMinting(true);
    try {
      const mintTX = await tx(writeRetFund.mintItem(address, { value: info.price }), update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          console.log(" 🍾 Transaction " + update.hash + " finished!");
          console.log(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      });

      await mintTX.wait(1);
    } catch (error) {
      console.log(`Mint error occurred`, error);
    }
    setMinting(false);
  };

  const approveForBurn = async id => {
    tx(writeRetFund.approve(addressParam, id), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
    });
  };

  const tradeForETH = async id => {
    tx(writeRetFund.redeem(id), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
    });
  };

  const updateMyCollect = async () => {
    const myCollectionUpdate = [];

    for (let i = 0; i < myBalance; i++) {
      try {
        const tokenIdAtIndex = await readRetFund.tokenOfOwnerByIndex(address, i);
        const tokenURI = ((await readRetFund.tokenURI(tokenIdAtIndex)) || "").split("/");
        const hash = tokenURI[tokenURI.length - 1];
        const content = JSON.parse((await ipfs.getFromIPFS(hash)) || "{}");

        myCollectionUpdate.push({ ...content, _tokenId: tokenIdAtIndex.toNumber() });
      } catch (error) {
        console.log(`Error on index ${i}`, error);
      }
    }

    setMyCollection(myCollectionUpdate);
  };

  useEffect(() => {
    if (myBalance > 0 && readRetFund) {
      updateMyCollect();
    }
  }, [myBalance, readRetFund]);

  return (
    <div className="container mx-auto mt-12">
      {address ? (
        <>
          <div>
            <div className="flex flex-1 justify-between items-center pb-6 border-b-2">
              <div>
                <Address mainnetProvider={mainnetProvider} address={addressParam} fontSize={16} />
                <h1 className="text-lg font-semibold p-0 m-0">
                  {info.name} ({info.symbol})
                </h1>
              </div>

              {info?.floor?.gt(zero) && (
                <div className="flex items-center justify-center">
                  <Alert
                    type="info"
                    message={`Token floor price is Ξ ${bigNumberRender(ethers.utils.formatEther(info.floor))}`}
                  />
                </div>
              )}

              <div className="flex flex-col items-center">
                <span className="italic mb-1">
                  {bigNumberRender(info.totalSupply)}/{bigNumberRender(info.limit)} minted
                </span>
                {info.price && (
                  <Button disabled={isMintComplete} loading={minting} onClick={mint} type="primary">
                    {isMintComplete
                      ? "Mint Completed"
                      : `Mint for Ξ ${bigNumberRender(ethers.utils.formatEther(info.price))}`}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-12">
              <h2 className="mb-6 text-base">Your Collection</h2>
              <div className="flex flex-1">
                <Row gutter={16}>
                  {myCollection.map((item, i) => (
                    <Col className="mb-3" span={8} key={`${item.name}-${i}`}>
                      <Card
                        bordered
                        cover={
                          <div className="rounded w-full overflow-hidden">
                            <img alt={item.name} className="object-cover" src={ipfs.urlFromCID(item.image)} />
                          </div>
                        }
                      >
                        <Card.Meta
                          title={item.name}
                          description={
                            <div className="flex items-center justify-center">
                              {hasFloor && isMintComplete && (
                                <>
                                  <Button
                                    className={classnames({ "mr-2": hasFloor && isMintComplete })}
                                    onClick={() => approveForBurn(item._tokenId)}
                                  >
                                    Approve for burn
                                  </Button>
                                  <Button onClick={() => tradeForETH(item._tokenId)}>Trade for floor Ξ</Button>
                                </>
                              )}
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </div>
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
