import React from "react";
import { Button, Input, List, Card } from "antd";
import {AddressInput, Sell} from '.'
import { RARIBLE_BASE_URL } from "../constants";

export default function RaribleItemIndexer(props) {
  const [collectionContract, setCollectionContract] = React.useState();
  const [approveAddress, setApproveAddress] = React.useState();
  const [tokenId, setTokenId] = React.useState();
  const [downloading, setDownloading] = React.useState();
  const [items, setItems] = React.useState();
  console.log({writeContracts: props.writeContracts})
  const writeContracts = props.writeContracts
  const tx = props.tx
  return (
    <div>
            <div style={{ paddingTop: 32, width: 740, margin: "auto" }}>
      <AddressInput
        ensProvider={props.ensProvider}
        placeholder="contractAddress"
        value={collectionContract}
        onChange={newValue => {
          setCollectionContract(newValue);
        }}
      />
      <Input
        value={tokenId}
        placeholder="tokenId"
        onChange={e => {
          setTokenId(e.target.value);
        }}
      />
      <Button
        style={{ margin: 8 }}
        loading={downloading}
        size="large"
        shape="round"
        type="primary"
        onClick={async () => {
                const getItemMetaByIdUrl = `${RARIBLE_BASE_URL}nft/items/${collectionContract}:${tokenId}/meta`
                setDownloading(true);
                const getItemMetaResult = await fetch(getItemMetaByIdUrl);
                const metaResultJson = await getItemMetaResult.json();
                if (metaResultJson) {
                  setItems([{id: `${collectionContract}:${tokenId}`, name: metaResultJson.name, description: metaResultJson.description, image: metaResultJson.image.url.ORIGINAL}])
                }
                setDownloading(false);
        }}
      >
        Get Item
      </Button>
    </div>
            <pre style={{ padding: 16, width: 500, margin: "auto", paddingBottom: 150 }}>
              {JSON.stringify(items)}
            </pre>
            <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={items}
                renderItem={item => {
                  const id = item.id;
                  return (
                    <List.Item key={id}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>{item.name}</span>
                          </div>
                        }
                      >
                        <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>
                          <p>description: {item.description}</p>
                        </div>
                      </Card>
                      <div>
                        <AddressInput
                          ensProvider={props.ensProvider}
                          placeholder="approve address"
                          value={approveAddress}
                          onChange={newValue => {
                            setApproveAddress(newValue);
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            const thisERC721Rarible = writeContracts.ERC721Rarible.attach(collectionContract)
                            tx(thisERC721Rarible.approve(approveAddress, tokenId));
                          }}
                        >
                          Approve
                        </Button>

                        <Sell
                          provider={props.provider}
                          accountAddress={props.accountAddress}
                          ERC721Address={collectionContract}
                          tokenId={tokenId}
                        ></Sell>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
    </div>
  );
}
