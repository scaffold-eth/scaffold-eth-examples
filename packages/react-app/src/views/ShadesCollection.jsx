import { useContractReader } from "eth-hooks";
import React, { useState, useEffect } from "react";
// import { ipfs } from "../helpers";
import { Row, Col, Card } from "antd";
import { ethers } from "ethers";

const zero = ethers.BigNumber.from("0");

export default function ShadesCollection({ tx, readContracts, address, ...props }) {
  const [myCollection, setMyCollection] = useState([]);

  const myBalance = (useContractReader(readContracts, "OptimisticShades", "balanceOf", [address]) || zero).toNumber();

  const updateMyCollect = async () => {
    const myCollectionUpdate = [];

    for (let i = 0; i < myBalance; i++) {
      try {
        const tokenIdAtIndex = await readContracts.OptimisticShades.tokenOfOwnerByIndex(address, i);
        const _tokenURI = (await readContracts.OptimisticShades.tokenURI(tokenIdAtIndex)) || "";

        const [format, tokenURI] = _tokenURI.split(";base64,");

        // console.log(tokenURI);

        try {
          // decode base64 here
          const jsonManifest = JSON.parse(decodeURIComponent(escape(window.atob(tokenURI))));
          // console.log("jsonManifest", jsonManifest);
          myCollectionUpdate.push({ id: tokenIdAtIndex.toNumber(), ...jsonManifest });
        } catch (e) {
          console.log(e);
        }
      } catch (error) {
        console.log(`Error on index ${i}`, error);
      }
    }

    setMyCollection(myCollectionUpdate);
  };

  useEffect(() => {
    if (myBalance > 0 && readContracts.OptimisticShades) {
      updateMyCollect();
    }
  }, [myBalance, readContracts]);

  console.log(myCollection);

  return (
    <div>
      <Row gutter={[16, 16]}>
        {myCollection.map((file, i) => (
          <Col className="mb-3" span={6} key={`${file.name}-${i}`}>
            <Card
              bordered
              hoverable
              bodyStyle={{ padding: 0 }}
              title={<div>{file.name}</div>}
              cover={<img alt={file.name} className="object-cover rounded" src={file.image} />}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}
