import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import fetch from 'isomorphic-fetch';
import { useQuery, gql } from '@apollo/client';
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin, Skeleton } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { useEventListener } from "../hooks";
import { Address, AddressInput, Balance, Contract } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
const { utils } = require("ethers");

const DEBUG = true

export default function Support({ projects, projectList, projectEvents, address, userProvider, blockExplorer, mainnetProvider, localProvider, setPurposeEvents, purpose, yourLocalBalance, price, tx, readContracts, writeContracts }) {

  const GET_RECIPIENTS_GRAPHQL = `

  {
    	recipients {
    	  id
        index
        addr
        project{
          id
          title
        }
    	}
  }
  `
  const getRecipientsQuery = useQuery(gql(GET_RECIPIENTS_GRAPHQL),{pollInterval: 2500});
  if(DEBUG) console.log("getRecipientsQuery",getRecipientsQuery)

  let recipients = []
  if(getRecipientsQuery&&getRecipientsQuery.data && getRecipientsQuery.data.recipients){
    recipients = getRecipientsQuery.data.recipients
  }

  return (
    <div>
      <div style={{ width:780, margin: "auto", textAlign:"center", marginTop:32, paddingBottom:32 }}>

        <List
          dataSource={recipients}
          renderItem={item => {
              console.log("item",item)
            return (
              <List.Item>
                {item.project.title}
              </List.Item>
            )
          }}
        />


        <div style={{fontSize:32,padding:32}}>Next quadratic round in 00:00:00</div>
        <div style={{fontSize:16,padding:32}}>contact <a href="https://twitter.com/austingriffith" target="_blank">@austingriffith</a> to participate </div>

        <Divider>OR</Divider>

        <div>Support Buidl Guidl matching pool and get an NFT that gives you access to BG telegram chat. </div>

      </div>
    </div>
  );
}
