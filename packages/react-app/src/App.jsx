import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { MailOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, List, Tabs, Menu, Select, Typography, Table } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { Hints, ExampleUI } from "./views"
import { useQuery, gql } from '@apollo/client';
import {  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  Crosshair} from 'react-vis';
import "./ReactVis.css";
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';
import fetch from 'isomorphic-fetch';


/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)
*/
import { INFURA_ID, ETHERSCAN_KEY } from "./constants";
const { Title } = Typography;
const { TabPane } = Tabs;

const { Option } = Select;

function App(props) {

  function graphQLFetcher(graphQLParams) {
    return fetch(props.subgraphUri, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_QUERY = `
  {
    inks(first: 25, orderBy: createdAt, orderDirection: desc) {
      id
      jsonUrl
      limit
      artist {
        id
      }
    }
  }
  `

  const GET_NIFTY_DAYDATA = gql`
  {
    dayTotals(first: 100, orderBy: id, orderDirection: desc) {
      id
      inks
    }
    artists(first: 100, orderBy: inkCount, orderDirection: desc) {
      id
      inkCount
    }
  }
  `;

  const { loading, error, data } = useQuery(GET_NIFTY_DAYDATA);
  let transformedData

  if (data) {
  transformedData = data['dayTotals'].map( s => ({x:new Date(s.id * 1000), y: parseFloat(s.inks)}) );
}

  const [crosshairValues, setCrosshairValues] = useState([]);

  const onMouseLeave = () => setCrosshairValues([]);
  const onNearestX = (value, {index}) => {
    setCrosshairValues([{x: value.x, y: new Intl.NumberFormat('en-US', { maximumSignificantDigits: 5 }).format(value.y)}])
  }

  let inkGraph
  console.log(loading, error)

  if(data) {
    inkGraph = (
      <>
        <XYPlot xType="time" width={400} height={300} onMouseLeave={onMouseLeave}>
            <LineSeries
              data={transformedData}
              onNearestX={onNearestX}
              curve={'curveMonotoneX'}
              color={'blue'}
            />
            <Crosshair values={crosshairValues}/>
      </XYPlot>
    </>)
  }  else if (loading) {
      inkGraph = (<Typography>Loading...</Typography>)
    } else {
      inkGraph = (<pre>Error: {error.message}. Is your subgraph ready?
      </pre>)
    }

    const artistColumns = [
    {
      title: 'Address',
      dataIndex: 'id',
      key: 'id',
      render: text => <a href={'https://nifty.ink/artist/'+text} target="_blank">{text}</a>,
    },
    {
      title: 'Inks Created',
      dataIndex: 'inkCount',
      key: 'inkCount',
    },
  ];

  console.log("Location:",window.location.pathname)

  const [route, setRoute] = useState();
  useEffect(() => {
    console.log("SETTING ROUTE",window.location.pathname)
    setRoute(window.location.pathname)
  }, [ window.location.pathname ]);

  return (
    <div className="App">

      <Header />

      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">Nifty</Link>
          </Menu.Item>
          <Menu.Item key="/graphiql">
            <Link onClick={()=>{setRoute("/graphiql")}} to="/graphiql">GraphiQL</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
          <div style={{ width:400, margin: "auto", marginTop:32 }}>
          <Title>Inks per day</Title>
          {inkGraph}
          {data?<><Title>Most prolific artists</Title><Table dataSource={data.artists} columns={artistColumns} /></>:<></>}
          </div>
          </Route>
          <Route path="/graphiql">
          <div style={{height:500, marginTop:32, textAlign:'left' }}>
          <GraphiQL fetcher={graphQLFetcher} docExplorerOpen={true} query={EXAMPLE_QUERY}/>
          </div>
          </Route>
        </Switch>
      </BrowserRouter>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
       <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
         <Row align="middle" gutter={[4, 4]}>

           <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
             <Button
               onClick={() => {
                 window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
               }}
               size="large"
               shape="round"
             >
             <span style={{ marginRight: 8 }} role="img" aria-label="support">
                 💬
               </span>
             </Button>
           </Col>
         </Row>

       </div>

    </div>
  );
}

export default App;
