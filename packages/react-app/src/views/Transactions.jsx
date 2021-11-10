import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance, Blockie } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useContractReader, useEventListener, usePoller } from "../hooks";
const axios = require('axios');

export default function Transactions({poolServerUrl, contractName, signaturesRequired, address, nonce, userProvider, mainnetProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, blockExplorer }) {


   const [ transactions, setTransactions ] = useState();
   usePoller(()=>{
     const getTransactions = async ()=>{
       console.log("🛰 Requesting Transaction List")
       const res = await axios.get(poolServerUrl+readContracts[contractName].address)
       let newTransactions = []
       for(let i in res.data){
         //console.log("look through signatures of ",res.data[i])
         let thisNonce = ethers.BigNumber.from(res.data[i].nonce)
         if(thisNonce && nonce&& thisNonce.gte(nonce)){
           let validSignatures = []
           for(let s in res.data[i].signatures){
             //console.log("RECOVER:",res.data[i].signatures[s],res.data[i].hash)
             let signer = await readContracts[contractName].recover(res.data[i].hash,res.data[i].signatures[s])
             let isOwner = await readContracts[contractName].isOwner(signer)
             if(signer&&isOwner){
               validSignatures.push({signer,signature:res.data[i].signatures[s]})
             }
           }
           let update = { ...res.data[i],validSignatures }
           //console.log("update",update)
           newTransactions.push(update)
         }
       }
       setTransactions(newTransactions)
       //console.log("Loaded",newTransactions.length)
     }
     if(readContracts) getTransactions()
   },3777)


  const getSortedSigList = async (allSigs,newHash)=>{
    console.log("allSigs",allSigs)

    let sigList = []
    for(let s in allSigs){
      console.log("SIG",allSigs[s])
      let recover = await readContracts[contractName].recover(newHash,allSigs[s])
      sigList.push({signature:allSigs[s],signer:recover})
    }


    sigList.sort((a,b)=>{
      return ethers.BigNumber.from(a.signer).sub(ethers.BigNumber.from(b.signer))
    })

    console.log("SORTED SIG LIST:",sigList)

    let finalSigList = []
    let finalSigners = []
    let used = {}
    for(let s in sigList){
      if(!used[sigList[s].signature]){
        finalSigList.push(sigList[s].signature)
        finalSigners.push(sigList[s].signer)
      }
      used[sigList[s].signature] = true
    }

    console.log("FINAL SIG LIST:",finalSigList)
    return [finalSigList,finalSigners]
  }

  if(!signaturesRequired){
    return <Spin/>
  }

  //console.log("transactions",transactions)

  return (
    <div style={{maxWidth:750, margin:"auto",marginTop:32,marginBottom:32}}>

    <h1><b style={{padding:16}}>#{nonce?nonce.toNumber():<Spin></Spin>}</b></h1>

    <List
      bordered
      dataSource={transactions}
      renderItem={(item) => {
        console.log("ITE88888M",item)

        const hasSigned = (item.signers.indexOf(address)>=0)
        const hasEnoughSignatures = (item.signatures.length<=signaturesRequired.toNumber())

        return (
          <List.Item style={{position:"relative"}}>
            <div style={{position:"absolute",top:55,fontSize:12,opacity:0.5}}>
              {item.data}
            </div>

            <span>
              <Blockie size={4} scale={8} address={item.hash} /> {item.hash.substr(0,6)}
            </span>
            <Address
              value={item.to}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              fontSize={16}
            />
            <Balance
              balance={parseEther(""+parseFloat(item.amount).toFixed(12))}
              dollarMultiplier={price}
            />

            <span>
              {item.signatures.length}/{signaturesRequired.toNumber()} {hasSigned?"✅":""}
            </span>
            <Button onClick={async ()=>{

              console.log("item.signatures",item.signatures)

              let newHash = await readContracts[contractName].getTransactionHash(item.nonce,item.to,parseEther(""+parseFloat(item.amount).toFixed(12)),item.data)
              console.log("newHash",newHash)

              let signature = await userProvider.send("personal_sign", [newHash, address]);
              console.log("signature",signature)

              let recover = await readContracts[contractName].recover(newHash,signature)
              console.log("recover--->",recover)

              let isOwner = await readContracts[contractName].isOwner(recover)
              console.log("isOwner",isOwner)

              if(isOwner){
                let [ finalSigList, finalSigners ] = await getSortedSigList([...item.signatures,signature], newHash)
                const res = await axios.post(poolServerUrl, { ...item, signatures: finalSigList, signers: finalSigners});
              }

              //tx( writeContracts[contractName].executeTransaction(item.to,parseEther(""+parseFloat(item.amount).toFixed(12)), item.data, item.signatures))
            }} type={"secondary"}>
              Sign
            </Button>
            <Button onClick={async ()=>{

              let newHash = await readContracts[contractName].getTransactionHash(item.nonce,item.to,parseEther(""+parseFloat(item.amount).toFixed(12)),item.data)
              console.log("newHash",newHash)

              console.log("item.signatures",item.signatures)

              let [ finalSigList, finalSigners ] = await getSortedSigList(item.signatures, newHash)


              tx( writeContracts[contractName].executeTransaction(item.to,parseEther(""+parseFloat(item.amount).toFixed(12)), item.data, finalSigList))
            }} type={hasEnoughSignatures?"primary":"secondary"}>
              Exec
            </Button>
          </List.Item>
        )
      }}
    />

    </div>
  );
}
