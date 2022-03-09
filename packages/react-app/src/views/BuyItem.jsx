import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, InputNumber, List, Progress, Slider, Spin, Switch, Typography } from "antd";
import React, { useState } from "react";
import { Address, Balance } from "../components";

const { Title, Paragraph, Text, Link } = Typography;

export default function BuyItem({
  tx,
  readContracts,
  writeContracts,
}) {
  const [buyPrice, setBuyPrice] = useState('0');
  const displayPrice = (buyPrice*10).toString();
  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, width: "90%", margin: "auto", marginTop: 64 }}>
      <Title>Harberger Tax NFT</Title>
      <Paragraph>
        Harberger Tax is a taxation method, which is highly effecient for public goods funding. It allows an ecosystem to strike a balance between pure private ownership, and total commons ownership of a resource or asset. It's quite simple, when someone claims an asset (in our case an NFT), they have to attach a price to it, that they pay a tax on (10%). And at any point in time anyone can buy that item for that declared price. This system makes it costly for users to unfairly price their assets, and mutually benefits the community if they were to.
      </Paragraph>
      <Title level={2}>Where are my taxes going?</Title>
      <Paragraph>
        All taxes collected by this project are distributed 50% to the holders of the NFT, as well as to me <Link href="https://twitter.com/blind_nabler">@blind_nabler</Link>
      </Paragraph>
      <Title level={2}>Can I still sell my NFT on quixotic or opensea?</Title>
      <Paragraph>
        Absolutely, all of the functions of the NFT are the same and they can still be bought and sold like any other NFT. There is simply another method of purchasing an NFT not traditionally for sale.
      </Paragraph>
      <Title level={2}>I still have more questions, who do I reach out to?</Title>
      <Paragraph>
        Reach out to me whenever on <Link href="https://twitter.com/blind_nabler">TWITTER</Link> or <Link href="https://t.me/blind_nabler">Telegram</Link>
      </Paragraph>
      <Divider />
      <Card style={{width:'40%', margin: 'auto'}}>
      <Title level={2}>Mint your own NFT below!</Title>
        <Input
          placeholder="Amount to pay in Taxes:"
          onChange={e => {
            setBuyPrice(e.target.value);
          }}
        />
        <Title level={4}>DECLARED VALUE OF NFT: { buyPrice ? displayPrice.substring(0,6) : 'NA'}Ξ</Title>
        <Button
          onClick={() => {
            console.log("writeContracts", writeContracts);
            tx(writeContracts.YourCollectible.mintItem({ value: utils.parseEther(buyPrice)}));
          }}
        >
         MINT!
        </Button>
        </Card>
    </div>
  );
}
