/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Input, Button, Divider } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";

const { TextArea } = Input;

const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })

export default function IPFSUI({purpose, setPurposeEvents, address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts }) {

  const [ yourInput, setYourInput ] = useState()
  const [ adding, setAdding ] = useState( false )

  const [ hash, setHash ] = useState()
  const [ getting, setGetting ] = useState( false )
  const [ content, setContent ] = useState()

  return (
    <div>

      <div style={{padding:16, width:700, margin:"auto",marginTop:64}}>

        Type in some text:

        <TextArea placeholder={"type something here"} style={{marginTop:16,width:"100%",padding:32, fontSize:32 }} rows={3} value={yourInput} onChange={(e)=>{
          setYourInput(e.target.value)
        }}/>

        <div style={{padding:16}}>
          <Button loading={adding} type="primary" disabled={!yourInput} onClick={async ()=>{
            console.log("📡 sending text to IPFS...")
            let buffer = Buffer.from(yourInput, 'utf-8') //we could fall back to going directly to IPFS if our server is down?
            console.log("buffer:",buffer)
            setAdding(true)
            ipfs.files.add(buffer, function (err, file) {
              console.log("ADDED!")
              if (err) {
                console.log(err);
              }
              setHash(file[0].hash)
              setAdding(false)
            })

          }}>
            Save text to IPFS
          </Button>
        </div>

        <Divider />

        <div style={{padding:16,width:"100%"}}>
          <Input placeholder={"hash"} style={{width:"100%",padding:8}} value={hash} onChange={(e)=>{setHash(e.target.value)}}/>
        </div>

        <div style={{padding:16}}>
          <Button loading={getting} type="primary" disabled={!hash} onClick={async ()=>{
            console.log("📡 Getting from IPFS...")
            setGetting(true)
            ipfs.files.get(hash, function (err, file) {
              console.log("GOT!",err, file)
              setContent(file[0].content.toString())
              setGetting(false)
            })
          }}>
            Load from IPFS
          </Button>
        </div>

        <div style={{padding:16}}>
          <pre style={{width:"100%"}}>
            {content}
          </pre>
        </div>

      </div>

    </div>
  );
}
