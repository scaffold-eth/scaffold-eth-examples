/* eslint-disable jsx-a11y/accessible-emoji */

import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther, parseEther } from "@ethersproject/units";
import { Select, Button, List, Card, Divider, Input } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { Address, AddressInput } from "../components";
import { useContractReader, useExternalContractLoader, useOnBlock } from "../hooks";
import { notification } from "antd";

export default function ContractCloneFactory({
  address,
  readContracts,
  userProvider,
  localProvider,
  tx,
  writeContracts,
  mainnetProvider
}) 
{
  //TODO: Lots of repeated code between both views. Look into how to refactor into components

  const ABI = require("../contracts/YourContract.abi");

  let clonesCount = useContractReader(readContracts, "YourContractFactory", "clonesCount");
  const numberClonesCount = clonesCount && clonesCount.toNumber && clonesCount.toNumber();
  const [contractClones, setContractClones] = useState();

  const [newPurposes, setNewPurposes] = useState({});

  function showNotification(tx){
    notification.info({
            message: "Transaction Sent",
            description: tx.hash,
            placement: "bottomRight",
            duration:10,
          });
  }

  useEffect(() => {
    const updateClones = async () => {
      const clonesUpdate = [];
    
      for (let clonesIndex = 0; clonesIndex < numberClonesCount; clonesIndex++) {
        try {
          const _address = await readContracts.YourContractFactory.yourContractClones(clonesIndex);
          const clone = new Contract(_address, ABI, userProvider.getSigner());
          const _purpose = await clone.purpose();

          clonesUpdate.push({id:clonesIndex, address: _address, purpose: _purpose, clone:clone});
          console.log("Contract address:",_address)
        
        } catch (e) {
          console.log(e);
        }
      }
      setContractClones(clonesUpdate);
    };
    updateClones();
  }, [numberClonesCount]);


  async function deployNewContract(){
    try{
      const txa = await tx(writeContracts.YourContractFactory.createYourContract("🍻 Cheers"));
      await txa.wait();
    }catch (e) {
      console.log(e);
    }
  }

  async function setPurpose(id){
    console.log(contractClones[id].address, newPurposes[id]);
    const tx = await contractClones[id].clone.setPurpose(newPurposes[id]);
    showNotification(tx)
    await tx.wait();
    contractClones[id].purpose = newPurposes[id];
  }

  return (
    <div style={{width: 640, margin: "auto",paddingBottom: 128, marginBottom:128 }}>
      <Button type="primary"onClick={() => {deployNewContract();}}>Create instance</Button>

      <div>
      <List
        bordered
        dataSource={contractClones}
        renderItem={item => {
          const id = item.id;
          return (
            <List.Item key={item.address}>

              <div>
                <h3>Instance address: {item.address} </h3>
                <h4>purpose: {item.purpose}</h4>
                <Divider />
                <div style={{ margin: 8 }}>
                  <Input 
                  onChange={newValue => {
                            const update = {};
                            update[id] = newValue.target.value;
                            setNewPurposes({ ...newPurposes, ...update });
                          }}
                  />
                  <Button
                    style={{ marginTop: 8 }}
                    onClick={async () => {setPurpose(id)}}
                  >
                    Set Purpose!
                  </Button>
                </div>
                {/* <AddressInput
                  ensProvider={mainnetProvider}
                  placeholder="transfer to address"
                  value={transferToAddresses[id]}
                  onChange={newValue => {
                    const update = {};
                    update[id] = newValue;
                    setTransferToAddresses({ ...transferToAddresses, ...update });
                  }}
                />
                <Button
                  onClick={() => {
                    console.log("writeContracts", writeContracts);
                    tx(writeContracts.YourCollectible.transferFrom(address, transferToAddresses[id], id));
                  }}
                >
                  Transfer
                </Button> */}
              </div>
            </List.Item>
          );
        }}
      />
    </div>
    </div>

    
  )
}
