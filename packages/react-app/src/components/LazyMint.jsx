import React from "react";
import { Button, Input, Card, Divider } from "antd";
import {AddressInput} from './'
import { createLazyMint, generateTokenId, putLazyMint } from "../rarible/createLazyMint";

export default function LazyMint(props) {
  const [erc721ContractAddress, setErc721ContractAddress] = React.useState();
  const [erc1155ContractAddress, setErc1155ContractAddress] = React.useState();
  const [erc721IpfsHash, setErc721IpfsHash] = React.useState();
  const [erc1155IpfsHash, setErc1155IpfsHash] = React.useState();
  const [erc721TokenId, setErc721TokenId] = React.useState();
  const [erc1155TokenId, setErc1155TokenId] = React.useState();
  const [sending721, setSending721] = React.useState();
  const [sending1155, setSending1155] = React.useState();
  console.log({writeContracts: props.writeContracts})
  return (
    <div>

    <div>
      <h2>ERC721</h2>
      <Input
        value={erc721IpfsHash}
        placeholder="IPFS Hash"
        onChange={e => {
          setErc721IpfsHash(e.target.value);
        }}
      />
      <Button
        style={{ margin: 8 }}
        loading={sending721}
        size="large"
        shape="round"
        type="primary"
        onClick={async () => {
          if (!props.writeContracts) return
          setSending721(true);
          const newTokenId = await generateTokenId(props.writeContracts.ERC721Rarible.address, props.accountAddress)
          setErc721TokenId(newTokenId)
          setErc721ContractAddress(props.writeContracts.ERC721Rarible.address)
          console.log("sending");
          const form = await createLazyMint(newTokenId, props.provider, props.writeContracts.ERC721Rarible.address, props.accountAddress, erc721IpfsHash, 'ERC721')
          await putLazyMint(form)
          setSending721(false);
        }}
      >
        Mint
      </Button>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>Token ID: {erc721TokenId}</span>
                          </div>
                        }
                      >
                        {/* <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div> */}
                        <div>
                          <p>Contract: {erc721ContractAddress}</p>
                        </div>
                      </Card>
    </div>
      <Divider />
    <div>
      <h2>ERC1155</h2>
      <Input
        value={erc1155IpfsHash}
        placeholder="IPFS Hash"
        onChange={e => {
          setErc1155IpfsHash(e.target.value);
        }}
      />
      <Button
        style={{ margin: 8 }}
        loading={sending1155}
        size="large"
        shape="round"
        type="primary"
        onClick={async () => {
          if (!props.writeContracts) return
          setSending1155(true);
          const newTokenId = await generateTokenId(props.writeContracts.ERC1155Rarible.address, props.accountAddress)
          setErc1155TokenId(newTokenId)
          setErc1155ContractAddress(props.writeContracts.ERC1155Rarible.address)
          console.log("sending");
          const form = await createLazyMint(newTokenId, props.provider, props.writeContracts.ERC1155Rarible.address, props.accountAddress, erc1155IpfsHash, 'ERC1155', 1)
          await putLazyMint(form)
          setSending1155(false);
        }}
      >
        Mint
      </Button>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>Token ID: {erc1155TokenId}</span>
                          </div>
                        }
                      >
                        {/* <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div> */}
                        <div>
                          <p>Contract: {erc1155ContractAddress}</p>
                        </div>
                      </Card>
    </div>
    </div>
  );
}
