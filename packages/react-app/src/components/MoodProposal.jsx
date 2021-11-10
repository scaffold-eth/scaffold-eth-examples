import React, { useState } from "react";
import { Button, List, Divider } from "antd";

import { Address, Balance, Blockie } from "../components";
import { EllipsisOutlined } from "@ant-design/icons";
import {useContractReader} from "../hooks";
export default function MoodProposal({pollID, mainnetProvider, price, readContracts, contractName, children}){
    // const [pollData, setPollData] = useState(null)
    const pollData = useContractReader(readContracts,contractName,"getPollDisplayData", [1]);
    console.log("pollData",pollData)
    // setPollData(pollingData);
    let dictValues;
    if(pollData){
    dictValues = {
        description : pollData[0],
        leftEmoji : pollData[1],
        rightEmoji : pollData[2],
        yeaVotes : pollData[3] && pollData[3].toNumber(),
        nayVotes : pollData[4] && pollData[4].toNumber()
    }}
    return <>
        {pollData && <div>
        <Divider/>
            <h3>{dictValues.description}</h3>
            <h3>{dictValues.leftEmoji}</h3>
            <h3>{dictValues.rightEmoji}</h3>
            <h3>{dictValues.yeaVotes/(dictValues.yeaVotes+dictValues.nayVotes)}</h3>
        </div>}
        </>
    
}