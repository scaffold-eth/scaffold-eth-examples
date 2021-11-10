import React, { useCallback, useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import fetch from 'isomorphic-fetch';
import { useQuery, gql } from '@apollo/client';
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin, Skeleton } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { useEventListener } from "../hooks";
import { Address, AddressInput, Balance, Contract } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
const { utils } = require("ethers");



export default function Projects({ subgraphUri, blockExplorer, mainnetProvider }) {

  let history = useHistory();

  function graphQLFetcher(graphQLParams) {
    return fetch(subgraphUri, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_GRAPHQL = `
  {
    projects (orderBy: timestamp, orderDirection: desc) {
      id
      title
      desc
      owner { id }
      repo
      quests { title author { id } }
      timestamp
    }
  }
  `
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL)
  const { loading, error, data } = useQuery(EXAMPLE_GQL,{pollInterval: 2500});


  return (
    <div>
      <div style={{ width:780, margin: "auto", textAlign:"left", marginTop:32, paddingBottom:256 }}>

        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={data?data.projects:data}
          renderItem={item => {
            //console.log(item)
            let firstSpace = item.title.indexOf(" ")
            let title = item.title.substr(firstSpace).trim()
            let emoji = item.title.substr(0,firstSpace).trim()
            return (
              <List.Item
                actions={[
                  <Link key="list-quests" style={{color:"#000000"}}
                    to={{
                      pathname: "/quests",
                      search: `?search=${item.title}`,
                    }}
                  >
                  🚩 quest
                  </Link>,
                  <a style={{color:"#000000"}} key="list-support" href={"/support/"+item.id} target="_blank">⚡️ support</a>,
                  <a style={{color:"#000000"}} key="list-code" href={item.repo} target="_blank">🍴 fork</a>
                ]}
              >
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar={
                      emoji
                    }
                    title={<a href={"https://"+title} target="_blank">{title}</a>}
                    description={item.desc}
                  />
                </Skeleton>
                <Address
                    value={item.owner.id}
                    blockExplorer={blockExplorer}
                    ensProvider={mainnetProvider}
                    fontSize={16}
                  />
              </List.Item>
            )
          }}
        />

      </div>
    </div>
  );
}
