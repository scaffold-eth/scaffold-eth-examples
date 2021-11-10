import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import fetch from 'isomorphic-fetch';
import { useQuery, gql } from '@apollo/client';
import { Address, AddressInput, Balance } from "../components";
import { useContractReader, useEventListener } from "../hooks";
import { parseEther, formatEther } from "@ethersproject/units";

export default function Allowed({address, mainnetProvider, blockExplorer, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts }) {

  const owner = useContractReader(readContracts,"AllowList", "owner")
  console.log("😁 owner:",owner)

  const GET_QUESTS_GRAPHQL = `
      {
        addrs(where:{allowed: true}) {
          id
        }
      }
  `
  const getAllowListQuery = useQuery(gql(GET_QUESTS_GRAPHQL),{pollInterval: 2500});
  console.log("getAllowListQuery",getAllowListQuery)

  const [toAddress, setToAddress] = useState()

  return (
    <div style={{width:500, margin:"auto", paddingBotttom:128}}>

      <div style={{padding:64}}>
        <AddressInput
          autoFocus
          ensProvider={mainnetProvider}
          placeholder="address to add"
          value={toAddress}
          onChange={setToAddress}
        />
        <Button style={{marginTop:8}} type={"primary"} onClick={()=>{
          tx( writeContracts.AllowList.update(toAddress,true) )
        }}>Add</Button>
      </div>

      <List
        size="large"
        dataSource={getAllowListQuery&&getAllowListQuery.data?getAllowListQuery.data.addrs:[]}
        renderItem={(item) => {
          console.log("item",item)
          return (
            <List.Item>
              <div>
                <Address
                  value={item.id}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  fontSize={32}
                />
              </div>
              <div>
                <Button onClick={()=>{
                  tx( writeContracts.AllowList.update(item.id,false) )
                }}>Remove</Button>
              </div>
            </List.Item>
          )
        }}
      />

      <div style={{fontSize:16,marginTop:64}}>Owner:</div>
      <Address
        value={owner}
        ensProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        fontSize={32}
      />

    </div>
  )
}
