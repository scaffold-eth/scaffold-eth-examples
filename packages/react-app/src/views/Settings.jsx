import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Button, Spin, Space, Card, Popconfirm, Divider, Radio } from "antd";
import { Ramp, GasGauge, PrivateKeyModal } from "../components";
const { Text, Title, Paragraph } = Typography;

function Settings({address, network, networks, gasPrice, price, setMyErc20s, avatarType, setAvatarType}) {

  let networkColumns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left'
  },
  {
    title: 'Color',
    dataIndex: 'color1',
    key: 'color1',
    render: text => <span style={{color:text}}>{text}</span>
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Blockexplorer',
    dataIndex: 'blockExplorer',
    key: 'blockExplorer',
    render: text => <a>{text}</a>,
    ellipsis: true,
  },
  {
    title: 'Node URL',
    dataIndex: 'url',
    key: 'url',
    ellipsis: true
  }]

  return (
              <Card style={{ margin: 'auto', maxWidth: "100%"}}>
                    <Row align="middle" justify="center" style={{margin:"12px"}}>
                    {(network&&networks[network].blockExplorer&&address)?<a href={networks[network].blockExplorer+"address/"+address} target="_blank"><Button>Blockexplorer</Button></a>:null}
                    <PrivateKeyModal address={address}/>
                    <Popconfirm
                        title="Are you sure you want to reset your token settings for all networks?"
                        onConfirm={() => {setMyErc20s({})}}
                        okText="Yes"
                        cancelText="No"
                      >
                    <Button>Reset tokens</Button>
                    </Popconfirm>
                    </Row>
                    <Paragraph><Link to="/bridge-xdai" style={{margin: "12px"}}>{"Dai<>xDai bridge"}</Link></Paragraph>
                    <Paragraph><Link to="/network-information" style={{margin: "12px"}}>{"Network information"}</Link></Paragraph>
                    {network==31337?<Paragraph><Link to="/erc20-demo" style={{margin: "12px"}}>{"Erc20 Demo"}</Link></Paragraph>:null}
                    <Typography>Avatar:</Typography>
                    <Radio.Group
                        options={['human','male','female']}
                        optionType="button"
                        onChange={(e) => { setAvatarType(e.target.value) }}
                        value={avatarType}
                      />
                    <Divider/>
                    <Paragraph>
                    8bit money is an experimental ethereum erc20 wallet. Use at your own risk etc.
                    </Paragraph>
                    <a href="https://github.com/austintgriffith/scaffold-eth/tree/instant-wallet-azf" target="_blank"><i class="nes-octocat animate"></i></a>
                    <Paragraph>
                    Built with:
                    </Paragraph>
                    <Paragraph><a href="https://github.com/austintgriffith/scaffold-eth" target="_blank">scaffold-eth</a></Paragraph>
                    <Paragraph><a href="https://docs.ethers.io/v5/" target="_blank">ethers</a></Paragraph>
                    <Paragraph><a href="https://walletconnect.org/" target="_blank">walletconnect</a></Paragraph>
                    <Paragraph><a href="https://github.com/Web3Modal/web3modal" target="_blank">web3modal</a></Paragraph>
                    <Paragraph><a href="xdaichain.com" target="_blank">xdai</a></Paragraph>
                    <Paragraph><a href="https://infura.io" target="_blank">infura</a></Paragraph>
                    <Paragraph><a href="https://ethgasstation.info/" target="_blank">ethgasstation</a></Paragraph>
                    <Paragraph><a href="https://nostalgic-css.github.io/NES.css/" target="_blank">nes.css</a></Paragraph>
                    <Paragraph><a href="https://ant.design" target="_blank">antd</a></Paragraph>
                    <Paragraph><a href="https://avatars.dicebear.com/" target="_blank">dicebear</a></Paragraph>
              </Card>
  );
}

export default Settings;
