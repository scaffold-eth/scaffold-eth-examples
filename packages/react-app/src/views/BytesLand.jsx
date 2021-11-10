import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance } from "../components";
import { useContractReader, useEventListener, useResolveName } from "../hooks";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers"

export default function BytesLand({ tx, writeContracts, offSet, blockNumber, localProvider, translateBytes }) {

  const [ land, setLand ] = useState([])

  useEffect(()=>{
    if( blockNumber && localProvider ){
      const searchLand = async ()=>{
        console.log("🔭 SEARCHING BLOCK ",blockNumber)
        const block = await localProvider.getBlock(blockNumber)

        let nextArray = []
        let index = 0
        //console.log(block)
        if(blockNumber>0){
          //console.log("BLOCKHASH FOR",blockNumber,"IS",block.hash)
          let currentHash = block.hash

          while(index<(1024*5)){
            let splitHash = currentHash.replace("0x","")
            splitHash = splitHash.match(/.{1,4}/g)
            for(let s in splitHash){
              //nextArray.push()
              let translated = translateBytes(splitHash[s])
              if(translated){
                let currentLand = land
                currentLand[index] = translated
                setLand(currentLand)
              }
              index++
            }
            currentHash = ethers.utils.keccak256( currentHash )
          }

        }

      }
      searchLand()
    }
  },[ blockNumber, setLand ])


  let display = []
  for(let l in land){
    if(land[l]){
      display.push(
        <div style={{cursor:"pointer",position:"absolute",top: (l * 0.2) }} onClick={()=>{
          console.log("LANDCLICK",blockNumber,l)
          tx( writeContracts.BytesLand.discoverBytesAt(blockNumber,l) )
        }}>
          {land[l]}
        </div>
      )
    }
  }

  return (
    <div key={"blockdiv_"+blockNumber} style={{position:"absolute",left:offSet,top:100}}>
      <div style={{width:25,height:1100,backgroundColor:"#6A6557"}}>
        <div>{blockNumber}</div>
        {display}
      </div>
    </div>
  );
}
