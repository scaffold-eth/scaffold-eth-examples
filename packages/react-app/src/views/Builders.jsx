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

export default function Builders({subgraphUri, address, userProvider, blockExplorer, mainnetProvider, localProvider, setPurposeEvents, purpose, yourLocalBalance, price, tx, readContracts, writeContracts }) {

  const GET_BUILDERS_GRAPHQL = `
  {
    builders (where:{isActive:true}) {
      id
      works {
        id
      }
      looks {
        id
      }
    }
  }
  `
  const getBuildersQuery = useQuery(gql(GET_BUILDERS_GRAPHQL),{pollInterval: 2500});
  if(true||DEBUG) console.log("getBuildersQuery",getBuildersQuery)

  let builders = []
  if(getBuildersQuery && getBuildersQuery.data && getBuildersQuery.data.builders){
    for(let b in getBuildersQuery.data.builders){
      builders.push({
        id: getBuildersQuery.data.builders[b].id,
        looks: getBuildersQuery.data.builders[b].looks.length,
        works: getBuildersQuery.data.builders[b].works.length
      })
    }
  }

  return (
    <div style={{ width:550, margin: "auto", marginTop:32, paddingBottom:64 }}>

      <List
        dataSource={builders}
        renderItem={item => {
          return (
            <List.Item>
              <Address
                value={item.id}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              />
              <span style={{padding:8}}>
                <span style={{marginRight:8}}>👀</span>
                {item.looks}
              </span>
              <span style={{padding:8}}>
                <span style={{marginRight:8}}>📥</span>
                {item.works}
              </span>
              <span style={{padding:8}}>
                <span style={{marginRight:8}}>💸</span>
                stream info
              </span>
            </List.Item>
          )
        }}
      />

    </div>
  );
}
