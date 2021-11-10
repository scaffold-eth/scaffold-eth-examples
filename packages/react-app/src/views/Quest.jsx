import React, { useCallback, useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
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

export default function Quest({subgraphUri, questId, address, blockExplorer, mainnetProvider, price, tx, readContracts, writeContracts }) {

  let history = useHistory();

  if(DEBUG) console.log("🏷 questId",questId)

  //const support = useContractReader(readContracts,"Quests", "support", [questId])
  //if(DEBUG) console.log("💵 support:",support)

  const registryOwner = useContractReader(readContracts,"Registry", "owner")
  if(DEBUG) console.log("👩‍✈️ registryOwner:",registryOwner)

  const GET_QUEST_BY_ID_GRAPHQL = `
  {
    quest (id: "${questId}") {
      idBytes
      title
      desc
      link
      author { id }
      timestamp
      project { id title owner { id }  }
      looks {
        id timestamp builder {
          id
        }
      }
      works (orderBy: timestamp, orderDirection: asc) {
        id timestamp link builder {
          id
        }
      }
      finished
      recipient {
        id
      }
      sender {
        id
      }
      amount
      support
    }
  }

  `
  const getQuestByIdQuery = useQuery(gql(GET_QUEST_BY_ID_GRAPHQL),{pollInterval: questId?2500:0});
  if(DEBUG || getQuestByIdQuery.error) console.log("getQuestByIdQuery",getQuestByIdQuery)


  let [ newWork, setNewWork ] = useState()
  let [ toAddress, setToAddress ] = useState()
  let [ supportAmount, setSupportAmount ] = useState()

  let greatestLookTimestamp = 0
  if( questId && getQuestByIdQuery && getQuestByIdQuery.data && getQuestByIdQuery.data.quest ){

    const isProjectOwner = (address.toLowerCase() == getQuestByIdQuery.data.quest.project.owner.id.toLowerCase())
    const questFinished = getQuestByIdQuery.data.quest.finished


    const item = getQuestByIdQuery.data.quest
    if(DEBUG) console.log("SINGLE ITEM:",item)
    let parseProjectName = item.project.title

    const looks = []
    for(let l in item.looks){
      const look = item.looks[l]
      if(look.timestamp > greatestLookTimestamp){
        greatestLookTimestamp = look.timestamp
      }
      looks.push(
        <span key={"look"+l} style={{marginRight:8}}>
          <Address
            value={look.builder.id}
            minimized={true}
            blockExplorer={blockExplorer}
          />
        </span>
      )
    }

    const works = []
    let latestWorkAddress

    for(let w in item.works){
      const work = item.works[w]
      let shorter = work.link
      if(shorter.length>67){
        shorter = shorter.substr(0,64)+"..."
      }

      if(!latestWorkAddress) latestWorkAddress=work.builder.id

      works.push(
        <Card key={"work"+w}
          style={{ marginTop: 16 }}
          type="inner"
          title={(
            <Address
              value={work.builder.id}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              fontSize={16}
            />
          )}
          extra={format(work.timestamp*1000)}
        >
          <a href={work.link} target="_blank">{shorter}</a>
        </Card>
      )
    }


    let ownerDisplay = ""
    if( !questFinished && (address==registryOwner || isProjectOwner) ){
      ownerDisplay = (
        <>
          <Divider></Divider>

          <Row style={{marginBottom:32,marginTop:16}} gutter={8}>
            <Col span={17} >
              <AddressInput
                size={"large"}
                ensProvider={mainnetProvider}
                placeholder="finish and send to address"
                value={toAddress}
                onChange={setToAddress}
              />
            </Col>
            <Col span={7}>
              <Button size={"large"} onClick={()=>{
                console.log("item",item)
                //finishQuest( bytes32 project, string memory title, address payable recipient )
                tx( writeContracts.Quests.finishQuest(item.project.id,item.title,toAddress) )
              }}>
                <span style={{marginRight:8}}>🏁</span> Finish Quest
              </Button>
            </Col>
          </Row>
        </>
      )
    }

    let submitWorkButton
    if(!questFinished){
      submitWorkButton=(
        <Row style={{marginBottom:32,marginTop:16}} gutter={8}>
          <Col span={17}>
            <Input
              size="large"
              placeholder="url to work, commit, or PR"
              value={newWork}
              onChange={(e)=>{setNewWork(e.target.value)  }}
            />
          </Col>
          <Col span={7}>
            <Button size={"large"} onClick={()=>{
              //submit work
              tx( writeContracts.Quests.submitWork(questId,newWork) )
            }}>
              <span style={{marginRight:8}}>📥</span> Submit Work
            </Button>
          </Col>
        </Row>
      )
    }else{
      submitWorkButton = <div style={{textAlign:"center",padding:8,opacity:0.333,fontSize:32}}>{""}</div>
    }

    const workLog = (
      <div>

        <Divider orientation="left">Work Log:</Divider>

        {works}

        {submitWorkButton}

        {ownerDisplay}

      </div>
    )

    let lookTime=""


    if(greatestLookTimestamp>0){
      lookTime = (
        <span style={{marginRight:8,opacity:0.33,fontSize:12}}>
          {format(greatestLookTimestamp*1000)}
        </span>
      )
    }

    let lookButton
    if(!questFinished){
      lookButton = (
        <div style={{float:"right",marginTop:32,marginBottom:16}}>

          {lookTime} {looks}

          <Button style={{margin:8}} onClick={()=>{
            tx( writeContracts.Quests.lookingAt(questId) )
          }}>
           <span style={{marginRight:8}}>👀</span> I'm taking a look!
          </Button>

        </div>
      )
    }

    let bottomRow
    if(!questFinished){
      bottomRow = (
        <Row>
          <Col span={6}>
            <div style={{marginLeft:16}}>
              <Balance
                balance={getQuestByIdQuery.data.quest.support}
                dollarMultiplier={price}
              />
            </div>
          </Col>
          <Col span={12}>
            <EtherInput
              price={price}
              value={supportAmount}
              onChange={setSupportAmount}
            />
          </Col>
          <Col span={6}>
            <Button onClick={()=>{
              tx(
                writeContracts.Quests.supportQuest(questId,
                  {
                    value:parseEther(""+supportAmount.toFixed(8))
                  }
                )
              )
            }}>
              💸 Support
            </Button>
          </Col>
        </Row>
      )
    }else{
      bottomRow = (
        <Row>
          <Col span={12}>
            <div style={{marginLeft:16}}>
              <Balance
                balance={getQuestByIdQuery.data.quest.amount}
                dollarMultiplier={price}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{width:100}}>
              <Address
                value={getQuestByIdQuery.data.quest.recipient.id}
                blockExplorer={blockExplorer}
              />
            </div>
          </Col>
        </Row>
      )

    }

    return (
      <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:64, marginBottom:128 }}>
        <Card
          style={{marginTop:32,textAlign:'left'}}
          key={"quest"+item.id} title={item.title}
          extra={(
            <Link key="list-quests" style={{color:"#000000"}}
              to={{
                pathname: "/quests",
                search: `?search=${parseProjectName}`,
              }}
            >
            {parseProjectName.substr(0,parseProjectName.indexOf(" "))}
            </Link>
          )}
          actions={[bottomRow]}
        >

          <div style={{marginBottom:8}}>
            {item.desc}
          </div>

          {lookButton}

          {workLog}

        </Card>
      </div>
    )
  } else {return <Spin/>}
}
