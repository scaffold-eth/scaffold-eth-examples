import React from "react";
import { formatEther } from "@ethersproject/units";
import { useEventListener } from "../hooks";
import { Button } from "antd";
import { Address, AddressInput } from "../components";

export default function FishFinder({ externalContracts, localProvider }) {

  const fish = useEventListener(externalContracts["BAY"], "Fish", localProvider, 9258613);
  console.log("📟 fish",fish)
  //📟 Listen for broadcast events
  const catchFish = useEventListener(externalContracts["BAY"], "Catch", localProvider, 9258613);
  console.log("📟 catchFish",catchFish)

  return (
    <div style={{padding:32}}>
      <div style={{padding:32}}>
        Fish:{ fish.length }
      </div>
      <div style={{padding:32}}>
        Caught: { catchFish.length }
      </div>
      <div style={{padding:32}}>
        <Button onClick={()=>{
          console.log("find fish...")
        }}>
        
        Find
        </Button>
      </div>
    </div>
  );
}
