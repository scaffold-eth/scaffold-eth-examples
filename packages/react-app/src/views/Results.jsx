import React, { useState } from "react";
import { formatEther } from "@ethersproject/units";
import { useEventListener, useBalance } from "../hooks";
import { List, Button, Card } from "antd";
import { Address, Balance } from "../components";
import { ethers } from "ethers";

const PRECISION = 8
const LEAVE_A_LITTLE_DUST_TO_BE_SAFE = 0.00000001


export default function Results({ tx, clrBalance, roundFinish, address, writeContracts, recipientAddedEvents, mainnetProvider, blockExplorer, readContracts, localProvider, price }) {

  const [ payouts, setPayouts ] = useState()

  const [ totalMatched, setTotalMatched ] = useState()
  const [ totalDonated, setTotalDonated ] = useState()

  const [ sendButtonLoading, setSendButtonLoading ] = useState({})

  const distributeEvents = useEventListener(readContracts, "MVPCLR", "Distribute", localProvider, 1);
  //console.log("📟 distributeEvents:",distributeEvents)

  const donateEvents = useEventListener(readContracts, "MVPCLR", "Donate", localProvider, 1);
  //console.log("📟 donateEvents:",donateEvents)

  // event MatchingPoolDonation(address sender, uint256 value, uint256 total);
  const matchingPoolEvents = useEventListener(readContracts, "MVPCLR", "MatchingPoolDonation", localProvider, 1);

  const balanceOfContract = useBalance(localProvider,readContracts?readContracts.MVPCLR.address:readContracts)


  let payoutDisplay = []

  if(payouts){
    //console.log("payouts",payouts)
    for(let p in payouts){
      //console.log("payouts p ",p,payouts[p])

      let found = []
      for(let e in distributeEvents){
        if(distributeEvents[e].index.eq(p)){
          found.push(distributeEvents[e])
        }
      }

      if(found&&found.length>0){
        payoutDisplay.push(
          <List
            style={{marginBottom:32}}
            bordered
            size="large"
            dataSource={found}
            renderItem={(item)=>{
              return (
                <List.Item>
                  <div style={{color:"#95de64"}}>
                    <Balance
                      balance={item.amount}
                      dollarMultiplier={price}
                    />
                  </div>
                  <Address
                    value={item.to}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={16}
                  />
                </List.Item>
              )
            }}
          />
        )
      }else{
        payoutDisplay.push(
          <div key={"payout"+p}>
            <Card title={payouts[p].title} style={{marginBottom:32}}>
              <Balance
                balance={payouts[p].payout}
                dollarMultiplier={price}
              />
              <div style={{color:"#89f989"}}>
              + <Balance
                balance={payouts[p].matching}
                dollarMultiplier={price}
              />
              </div>

              <Address
                value={payouts[p].address}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={16}
              />
              <div style={{opacity:roundFinish?1:0.1,marginTop:32}}>
                <Button type={"primary"} loading={sendButtonLoading[p]} onClick={async ()=>{
                  /* tx({
                    to: payouts[p].address,
                    value: payouts[p].payout,
                  })*/
                  let newSendButtonLoading = sendButtonLoading
                  newSendButtonLoading[p] = true
                  setSendButtonLoading(newSendButtonLoading)

                  let total = payouts[p].payout
                  if(payouts[p].matching){
                    total = total.add(payouts[p].matching)
                  }
                  console.log("sending a total of ",payouts[p].payout,payouts[p].matching,total)
                  tx( writeContracts.MVPCLR.distribute(payouts[p].address,p,total) )

                  setTimeout(()=>{
                    let secondNewSendButtonLoading = sendButtonLoading
                    secondNewSendButtonLoading[p] = false
                    setSendButtonLoading(secondNewSendButtonLoading)
                  },5000)
                }}>
                  Send
                </Button>
              </div>
            </Card>

          </div>
        )
      }
    }

  }else{
    payoutDisplay = (
      <Button onClick={async ()=>{
          //try {
            let recipients = await readContracts.MVPCLR.queryFilter(readContracts.MVPCLR.filters.RecipientAdded())
            let recipientByIndex = {}
            let addressByIndex = {}
            for(let r in recipients){
              const prettyName = ethers.utils.parseBytes32String(recipients[r].args.data)
              console.log(recipients[r].args.addr+" "+prettyName+" "+recipients[r].args.index)//value index
              recipientByIndex[recipients[r].args.index] = prettyName
              addressByIndex[recipients[r].args.index] = recipients[r].args.addr
            }
            let totalDonationAmount = ethers.BigNumber.from(0)
            let donations = await readContracts.MVPCLR.queryFilter(readContracts.MVPCLR.filters.Donate())
            console.log("There are a total of "+donations.length+" donations")



            let newPayouts = {}
            for(let d in donations){
              if(!newPayouts[donations[d].args.index]) newPayouts[donations[d].args.index] = ethers.BigNumber.from(0)
              newPayouts[donations[d].args.index] = newPayouts[donations[d].args.index].add(donations[d].args.value)
              totalDonationAmount = totalDonationAmount.add(donations[d].args.value)
              console.log(/*donations[d].args.sender*/ donations[d].args.origin+" -> "+donations[d].args.value+" "+recipientByIndex[donations[d].args.index])//value index
            }

            console.log("***** totalDonationAmount",totalDonationAmount,formatEther(totalDonationAmount))

            let totalPayoutFunds = ethers.BigNumber.from(0)
            console.log("newPayouts",newPayouts)

            for(let p in newPayouts){
              console.log("adding payout to total===> ",p,formatEther(newPayouts[p]),newPayouts[p],addressByIndex)
              /*payoutsByAddress.push({
                title: recipientByIndex[p],
                index: p,
                address: addressByIndex[p],
                payout: newPayouts[p]
              })*/
              totalPayoutFunds = totalPayoutFunds.add(newPayouts[p])
            }

            console.log("totalPayoutFunds",totalPayoutFunds,formatEther(totalPayoutFunds))

            console.log("LOOKING THROUGH ALL MATCHING EVENTS",matchingPoolEvents)
            let totalMatchingPoolFunds = ethers.BigNumber.from(0)
            for(let e in matchingPoolEvents){
              console.log("matching pool value add:",formatEther(matchingPoolEvents[e].value))
              totalMatchingPoolFunds = totalMatchingPoolFunds.add(matchingPoolEvents[e].value)
              //totalMatchedFunds = totalMatchedFunds.add(matchingPoolEvents[e].)
            }
            console.log("totalMatchingPoolFunds:",formatEther(totalMatchingPoolFunds))

            //totalMatchedFunds = totalMatchedFunds.sub(totalPayoutFunds)
            //console.log("totalMatchedFunds",formatEther(totalMatchedFunds))
            console.log("Getting donationsByIndexByAddress...")
            let donationsByIndexByAddress = {}
            console.log("donateEvents",donateEvents)
            for(let d in donateEvents){
              console.log("====>donateEvents ",d,donateEvents[d])
              const index = donateEvents[d].index.toNumber()
              console.log("index",index)
              const address = donateEvents[d].origin /* donateEvents[d].sender */
              console.log("address",address)
              if(!donationsByIndexByAddress[index]) donationsByIndexByAddress[index] = {}

              if(!donationsByIndexByAddress[index][address]) donationsByIndexByAddress[index][address] = ethers.BigNumber.from(0)

              donationsByIndexByAddress[index][address] = donationsByIndexByAddress[index][address].add(donateEvents[d].value)
            }


            console.log("donationsByIndexByAddress",donationsByIndexByAddress)
            let sqrtSumDonationsByIndex = []
            let totalSqrts = 0

            for(let i in donationsByIndexByAddress){
              if(!sqrtSumDonationsByIndex[i]) sqrtSumDonationsByIndex[i] = 0

              console.log("INDEXED BY ADDDRRRRRRR ",i,donationsByIndexByAddress[i])
              for(let addr in donationsByIndexByAddress[i])
              {
                console.log("ACTUALLY DO SQRT HERE",addr,i,donationsByIndexByAddress[i][addr])
                const chrushedUpValueForSqrt = parseFloat(ethers.utils.formatEther(donationsByIndexByAddress[i][addr])).toFixed(PRECISION)
                console.log("chrushedUpValueForSqrt",chrushedUpValueForSqrt)
                const sqrt = Math.sqrt(chrushedUpValueForSqrt)
                console.log("SQRT",sqrt)
                sqrtSumDonationsByIndex[i] += sqrt
                totalSqrts += sqrt
              }

            }

            let newMatches = {}

            let totalMatchesCounted = ethers.BigNumber.from(0)
            console.log("sqrtSumDonationsByIndex>=>=>=",sqrtSumDonationsByIndex)
            let floatOfTotalMatchedFunds = parseFloat(formatEther(totalMatchingPoolFunds))
            floatOfTotalMatchedFunds -= LEAVE_A_LITTLE_DUST_TO_BE_SAFE
            console.log("floatOfTotalMatchedFunds",floatOfTotalMatchedFunds)
            for(let s in sqrtSumDonationsByIndex){
              const neverTrustAFloat = parseFloat(sqrtSumDonationsByIndex[s]*100/totalSqrts).toFixed(PRECISION)
              console.log("neverTrustAFloat",neverTrustAFloat,"% of matching pool")
              console.log("recipientByIndex",recipientByIndex[s])
              newMatches[s] = ethers.utils.parseEther(parseFloat(
                (neverTrustAFloat * floatOfTotalMatchedFunds) / 100
              ).toFixed(PRECISION))
              totalMatchesCounted = totalMatchesCounted.add(newMatches[s])
              console.log("##### MATCHING FUNDING ",s,formatEther(newMatches[s]))
            }
            console.log("totalMatchesCounted:",totalMatchesCounted,formatEther(totalMatchesCounted))

            console.log("newMatches",newMatches)
            let payoutsByAddress = []
            for(let p in newPayouts){
              console.log("newPayout:",p,newPayouts[p],addressByIndex)
              payoutsByAddress.push({
                title: recipientByIndex[p],
                index: p,
                address: addressByIndex[p],
                payout: newPayouts[p],
                matching: newMatches[p]
              })
              totalPayoutFunds = totalPayoutFunds.add(newPayouts[p])
            }
            console.log("payoutsByAddress",payoutsByAddress)
            setPayouts(payoutsByAddress)


            let nextTotalMatched = ethers.BigNumber.from(0)
            let nextTotalDonated = ethers.BigNumber.from(0)
            for(let a in payoutsByAddress){
              console.log("payoutsByAddress[a]",a,payoutsByAddress[a])
              nextTotalMatched = nextTotalMatched.add(payoutsByAddress[a].matching)
              nextTotalDonated = nextTotalDonated.add(payoutsByAddress[a].payout)
            }

            console.log("TOTAL MATCHED ",nextTotalMatched,formatEther(nextTotalMatched))
            console.log("TOTAL DONATED ",nextTotalDonated,formatEther(nextTotalDonated))
            setTotalDonated(nextTotalDonated)
            setTotalMatched(nextTotalMatched)

            console.log("BALANCE OF CONTRACT",balanceOfContract,formatEther(balanceOfContract))
            let nextFinalBalance = balanceOfContract.sub(nextTotalDonated.add(nextTotalMatched))
            console.log("ENDING BALANCE",balanceOfContract,"-",nextTotalDonated.add(nextTotalMatched),"=",nextFinalBalance)
            if(nextFinalBalance.lt(0)){
              alert("WATCH OUT, NOT ENOUGH IN CONTRACT TO PAY OUT")
            }else{
              console.log("Looks good, there will be ",formatEther(nextFinalBalance)," left in the contract")
            }

          /*} catch (e) {
            console.log(e);
          }*/
      }}>
       🧮 Calc
      </Button>
    )
  }

  let extraBalanceDisplay = ""
  if(totalMatched&&totalDonated){
    extraBalanceDisplay = (
      <div>

      <div>
        Donated: <Balance
          balance={totalDonated}
          dollarMultiplier={price}
        />
        </div>
        <div style={{color:"#89f989"}}>
        Matched: <Balance
          balance={totalMatched}
          dollarMultiplier={price}
        />
        </div>
      </div>
    )
  }

  return (
    <div style={{width:500,margin:"auto"}}>

      <div style={{marginTop:32,marginLeft:64,marginRight:64,marginBottom:16,border:"1px solid #f8f8f8",backgroundColor:"#fbfbfb",padding:16,fontSize:16, fontWeight:"bold"}}>
        🏦 <Balance
          address={readContracts?readContracts.MVPCLR.address:readContracts}
          provider={localProvider}
          dollarMultiplier={price}
        />
        {extraBalanceDisplay}
      </div>


      <div style={{width:500,margin:"auto",paddingBottom:128,padding:64}}>
        {payoutDisplay}
      </div>
    </div>
  );
}
