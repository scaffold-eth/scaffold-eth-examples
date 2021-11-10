import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
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

function useSearchParams() {
  return new URLSearchParams(useLocation().search);
}

export default function Quests({subgraphUri, price, readContracts }) {

  let location = useLocation();

  let searchParams = useSearchParams()
  let currentSearch = searchParams.get("search")
  let [searchTerm, setSearchTerm] = useState(currentSearch?currentSearch:"")

  const handleSearchChange = newSearch => {
    setSearchTerm(newSearch);
    searchParams.set("search", newSearch)
    if(newSearch == "") {
      window.history.replaceState({}, '', `${location.pathname}`);
    } else {
      window.history.replaceState({}, '', `${location.pathname}?${searchParams}`);
    }
    console.log(searchParams.getAll('search'))
  };

  //  OLD METHOD WAS PARSING EVENTS:
  //const questUpdateEvents = useEventListener(readContracts, "Quests", "QuestUpdate", localProvider, 1)
  //console.log("questUpdateEvents",questUpdateEvents)

  //const events = useEventListener(readContracts, "Quests", "QuestFinished", localProvider, 1)
  //console.log("QuestFinished",events)

  let history = useHistory();

  const registryOwner = useContractReader(readContracts,"Registry", "owner")
  if(DEBUG) console.log("👩‍✈️ registryOwner:",registryOwner)

  function graphQLFetcher(graphQLParams) {
    return fetch(subgraphUri, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const GET_QUESTS_GRAPHQL = `
  {
    quests (where: {finished: null},orderBy: support, orderDirection: desc, orderBy: timestamp, orderDirection: desc) {
      id
      idBytes
      title
      desc
      link
      author { id }
      timestamp
      project { id title }
      support
      finished
    }
  }
  `
  const getQuestsQuery = useQuery(gql(GET_QUESTS_GRAPHQL),{pollInterval: 2500});
  if(DEBUG) console.log("getQuestsQuery",getQuestsQuery)

  let questCards = []
  if(getQuestsQuery.data&&getQuestsQuery.data.quests){
    for(let q in getQuestsQuery.data.quests){
      const item = getQuestsQuery.data.quests[q]
      //console.log("item",item)
      //console.log("item.project",item.project)
      let parseProjectName = ""+item.project.title

      if(
        item.id.indexOf(searchTerm)>=0 ||
        item.title.indexOf(searchTerm)>=0 ||
        (item.project.title && item.project.title.toLowerCase().indexOf(searchTerm.toLowerCase())>=0) ||
        item.desc.indexOf(searchTerm)>=0
      )
      questCards.push(
        <Card
          style={{marginTop:32,textAlign:'left'}}
          key={"quest"+item.id} title={item.title}
          extra={(
            <div style={{cursor:"pointer"}} onClick={()=>{
              handleSearchChange(parseProjectName)
            }}>
              {parseProjectName.substr(0,parseProjectName.indexOf(" "))}
            </div>
          )}
        >



          <div>
            {item.desc}
          </div>

            <div style={{float:"right",marginTop:32}}>
              <Button onClick={()=>{
                history.push("/quests/"+item.id)
              }}>
                <span style={{marginRight:8}}>⚔️</span>quest
              </Button>
            </div>

            <div style={{marginTop:32,opacity:0.5,width:200}}>
              <Balance
                balance={item.support}
                dollarMultiplier={price}
              />
            </div>

        </Card>
      )
    }
  }

  return (
    <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:256 }}>

      <Input size={"large"} placeholder={"search"} style={{marginTop:32,width:538}} value={searchTerm} onChange={(event)=>{handleSearchChange(event.target.value)}} />

      {questCards}

    </div>
  );
}
