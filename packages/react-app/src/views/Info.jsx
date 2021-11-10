import React from "react";
import { Spin, Divider, Button } from "antd";
import { Address, Balance } from "../components";
import { useContractReader } from "../hooks";


export default function Info({
  mainnetProvider, localProvider, readContracts, writeContracts, price, blockExplorer, tx,
  owner, roundDuration, mode
}) {

  return (
    <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>

      <div>
        {readContracts && readContracts.CLR.address ? <Address value={readContracts?readContracts.CLR.address:readContracts} ensProvider={mainnetProvider} /> : <Spin />}
        <div style={{ float: "right", paddingRight: 25 }}>
          <Balance address={readContracts?readContracts.CLR.address:readContracts} provider={localProvider} dollarMultiplier={price} />
        </div>
      </div>

      < Divider / >

      owner: <Address
        value={owner}
        ensProvider={mainnetProvider}
        blockExplorer={blockExplorer}
      />

      < Divider / >

      <h3>roundDuration:{roundDuration?roundDuration.toNumber():<Spin/>}</h3>

      <h2>{mode}</h2>

      <div style={{margin:8}}>
        <Button onClick={()=>{
          tx( writeContracts.CLR.startRound() )
          //setRerender(rerender+1)
        }}>startRound</Button>
      </div>

      <div style={{margin:8}}>
        <Button onClick={()=>{
          tx( writeContracts.CLR.calculateMatching(99999999) )
          //setRerender(rerender+1)
          //setTimeout(()=>{
            //setRerender(rerender+3)
          //},3000)
        }}>calculateMatching</Button>
      </div>

      <div style={{margin:8}}>
        <Button onClick={()=>{
          tx( writeContracts.CLR.distributeWithdrawal() )
          //setRerender(rerender+1)
        }}>distributeWithdrawal</Button>
      </div>

    </div>
  );
}
