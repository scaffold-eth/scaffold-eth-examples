import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import fetch from 'isomorphic-fetch';
import { useQuery, gql } from '@apollo/client';
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin, Row, Col } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { useEventListener, useContractReader } from "../hooks";
import { Address, AddressInput, Balance, Contract, EtherInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { utils } from "ethers";
import { format } from 'timeago.js';


const DEBUG = false

export default function Supporters({subgraphUri, address, userProvider, blockExplorer, mainnetProvider, localProvider, setPurposeEvents, purpose, yourLocalBalance, price, tx, readContracts, writeContracts }) {

  const GET_SUPPORTERS_GRAPHQL = `
  {
    supporters (where:{isActive:true}) {
      id
    }
  }
  `
  const getSupportersQuery = useQuery(gql(GET_SUPPORTERS_GRAPHQL),{pollInterval: 2500});
  if(true||DEBUG) console.log("getSupportersQuery",getSupportersQuery)

  let supporters = []
  if(getSupportersQuery && getSupportersQuery.data && getSupportersQuery.data.supporters){
    for(let s in getSupportersQuery.data.supporters){
      supporters.push({
        id: getSupportersQuery.data.supporters[s].id
      })
    }
  }

  return (
    <div style={{ width:550, margin: "auto", marginTop:32, paddingBottom:64 }}>

      <List
        dataSource={supporters}
        renderItem={item => {
          return (
            <List.Item>
              <Address
                value={item.id}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              />
              <span style={{padding:8}}>
                <span style={{marginRight:8}}>💸</span>
                support info
              </span>
            </List.Item>
          )
        }}
      />

    </div>
  );
}
