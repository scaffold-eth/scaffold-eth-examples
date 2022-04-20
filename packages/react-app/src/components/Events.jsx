import { List, Button } from "antd";
import { Text } from "@visx/text";
import { useEffect, useState } from "react";
import { useEventListener } from "eth-hooks/events/useEventListener";
import Address from "./Address";
import { Wordcloud } from "@visx/wordcloud";
import { scaleLog } from "@visx/scale";

import {
  AnimatedAxis, // any of these can be non-animated equivalents
  AnimatedGrid,
  AnimatedLineSeries,
  XYChart,
  Tooltip,
  AnnotationLineSubject,
} from "@visx/xychart";

const { ethers } = require("ethers");
/**
  ~ What it does? ~

  Displays a lists of events

  ~ How can I use? ~

  <Events
    contracts={readContracts}
    contractName="YourContract"
    eventName="SetPurpose"
    localProvider={localProvider}
    mainnetProvider={mainnetProvider}
    startBlock={1}
  />
**/

export default function Events({
  address,
  contracts,
  contractName,
  eventName,
  localProvider,
  mainnetProvider,
  startBlock,
  currentTimestamp,
  tx,
  readContracts,
  writeContracts,
}) {
  // 📟 Listen for broadcast events
  const events = useEventListener(contracts, contractName, eventName, localProvider, startBlock);

  const [deposits, setDeposits] = useState([]);

  const [maxValue, setMaxValue] = useState(1);

  useEffect(() => {
    console.log("EVENTS UPDATED", events);

    for (let e in events) {
      console.log("looking at event", e, events[e]);
      let exists;
      for (let d in deposits) {
        if (deposits[d].voteID.toNumber() === events[e].args.voteID.toNumber()) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        console.log("this is new and not added yet");
        setDeposits([
          ...deposits,
          {
            ...events[e].args,
          },
        ]);
      }
    }
  }, [events]);

  console.log("deposits", deposits);

  const [depositStatus, setDepositStatus] = useState({});
  const [calcedAmount, setCalcedAmount] = useState({});
  const [totalVotes, setTotalVotes] = useState([]);

  const [timeSeries, setTimeSeries] = useState([]);

  const accessors = {
    xAccessor: d => d.x,
    yAccessor: d => d.y,
  };

  const getTimeSeries = async firstVoteTimestamp => {
    var futureDate = new Date(currentTimestamp * 1000 + 1000 * 60 * 60 * 24 * 10);
    let timeSeriesArray = [];
    let mapVoteToIndex = [];

    for (let i = firstVoteTimestamp; i < futureDate.getTime() / 1000; i += 60 * 60 * 24) {
      let convictionValues = await contracts.YourContract?.calculateConvictionsAtTime(i + (60 * 60 * 24 - 1)); // Calculate 23:59 from now - future improvement: UTC midnight
      if (convictionValues === undefined) return;
      for (let j = 0; j < convictionValues.length; j++) {
        if (convictionValues[j]["vote"] === "") continue;
        if (mapVoteToIndex[convictionValues[j]["vote"]] === undefined) {
          mapVoteToIndex[convictionValues[j]["vote"]] = timeSeriesArray.length;
          timeSeriesArray.push([
            {
              x: new Date(i * 1000).toISOString().split("T")[0],
              y: Number(ethers.utils.formatEther(convictionValues[j]["value"])),
            },
          ]);
        } else {
          let found = false;
          for (let k = 0; k < timeSeriesArray[mapVoteToIndex[convictionValues[j]["vote"]]].length; k++) {
            if (
              timeSeriesArray[mapVoteToIndex[convictionValues[j]["vote"]]][k].x ===
              new Date(i * 1000).toISOString().split("T")[0]
            ) {
              timeSeriesArray[mapVoteToIndex[convictionValues[j]["vote"]]][k].y += Number(
                ethers.utils.formatEther(convictionValues[j]["value"]),
              );
              found = true;
              break;
            }
          }
          if (!found) {
            timeSeriesArray[mapVoteToIndex[convictionValues[j]["vote"]]].push({
              x: new Date(i * 1000).toISOString().split("T")[0],
              y: Number(ethers.utils.formatEther(convictionValues[j]["value"])),
            });
          }
        }

        console.log("futureDate value", convictionValues[j]);
      }
    }
    console.log("futureDate convictionValues timeSeriesArray", timeSeriesArray);
    setTimeSeries(timeSeriesArray);
  };

  useEffect(async () => {
    console.log("deposits have changed...");
    let statusObj = {};
    let calcedAmountObj = {};
    let totalVotesObj = {};
    let firstVoteTimestampValue = Number.MAX_SAFE_INTEGER;

    let convictionValues = await contracts.YourContract?.calculateConvictions();

    if (convictionValues === undefined) return;

    console.log("convictionValues", convictionValues);

    for (let d in deposits) {
      let status = convictionValues[deposits[d].voteID]["open"];
      console.log("STATUS OF ", deposits[d].voteID, "IS", status);
      statusObj[deposits[d].voteID] = status;

      firstVoteTimestampValue = Math.min(
        firstVoteTimestampValue,
        ethers.BigNumber.from(convictionValues[deposits[d].voteID]["timestampOpened"]).toNumber(),
      );

      let convictionScore = convictionValues[deposits[d].voteID]["value"];

      console.log("CALC OF ", deposits[d].voteID, "IS", ethers.utils.formatEther(convictionScore));
      calcedAmountObj[deposits[d].voteID] = ethers.utils.formatEther(convictionScore);
      if (!totalVotesObj[deposits[d].vote]) totalVotesObj[deposits[d].vote] = 0;
      totalVotesObj[deposits[d].vote] += convictionScore;
    }
    setDepositStatus(statusObj);
    setCalcedAmount(calcedAmountObj);
    getTimeSeries(firstVoteTimestampValue);

    let votesArray = [];
    let currMaxValue = 0;
    for (let v in totalVotesObj) {
      currMaxValue = Math.max(totalVotesObj[v], currMaxValue);
      votesArray.push({
        text: v,
        value: totalVotesObj[v],
      });
    }

    setMaxValue(currMaxValue);
    setTotalVotes(votesArray);
  }, [deposits, currentTimestamp]);

  console.log("totalVotes", totalVotes);
  console.log("timeSeries >>>", timeSeries);
  console.log("timeSeries >>>", timeSeries.length);

  const fontSize = word => {
    // const size = 20 + 69 * Math.pow(word.value / maxValue, 2) * (1 / (word.value / maxValue));
    const size = fontScale(word.value);
    console.log(size + " is the size for " + word.text + ", and the maxValue is " + maxValue);
    return size;
  };
  const rotate = word => 0; //(word.value % 90) - 45;

  const fontScale = scaleLog({
    domain: [Math.min(...totalVotes.map(w => w.value)), Math.max(...totalVotes.map(w => w.value))],
    range: [10, 90],
  });

  const colors = ["#143059", "#2F6B9A", "#82a6c2"];

  return (
    <>
      {totalVotes.length > 0 && (
        <>
          <div style={{ width: 400, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
            <Wordcloud
              words={totalVotes}
              width={400}
              height={400}
              font={"arial"}
              fontSize={fontSize}
              padding={2}
              spiral={"archimedean"}
              rotate={rotate}
              random={() => 0.5}
            >
              {cloudWords =>
                cloudWords.map((w, i) => (
                  <Text
                    key={w.text}
                    fill={colors[i % colors.length]}
                    textAnchor={"middle"}
                    transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                    fontSize={w.size}
                    fontFamily={w.font}
                  >
                    {w.text}
                  </Text>
                ))
              }
            </Wordcloud>
          </div>
          {timeSeries.length > 0 && (
            <div style={{ width: 800, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <XYChart height={300} xScale={{ type: "band" }} yScale={{ type: "linear" }}>
                <AnimatedAxis orientation="bottom" numTicks={6} />
                <AnimatedAxis orientation="right" />
                <AnimatedGrid columns={false} numTicks={4} />

                {timeSeries.map((series, i) => {
                  console.log("series", series);
                  return <AnimatedLineSeries key={i} dataKey={i} data={series} {...accessors}></AnimatedLineSeries>;
                })}

                <Tooltip
                  snapTooltipToDatumX
                  snapTooltipToDatumY
                  showVerticalCrosshair
                  showSeriesGlyphs
                  renderTooltip={({ tooltipData, colorScale }) => (
                    <div>
                      <div style={{ color: colorScale(tooltipData.nearestDatum.key) }}>
                        {tooltipData.nearestDatum.key}
                      </div>
                      {accessors.xAccessor(tooltipData.nearestDatum.datum)}
                      {", "}
                      {accessors.yAccessor(tooltipData.nearestDatum.datum)}
                    </div>
                  )}
                />
              </XYChart>
            </div>
          )}
        </>
      )}
      <div style={{ width: 800, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <Button
          style={{ marginTop: 8 }}
          onClick={async () => {
            /* look how you call setPurpose on your contract: */
            /* notice how you pass a call back for tx updates too */
            await localProvider.send("evm_increaseTime", [86400]);
          }}
        >
          Go to tomorrow!
        </Button>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={events.reverse()}
          renderItem={item => {
            return (
              <List.Item /*key={item.blockNumber + "_" + item.args.sender + "_" + item.args.purpose}*/>
                <div>#{item.args.voteID.toNumber()}</div>
                <div>
                  <Address address={item.args.voter} ensProvider={mainnetProvider} fontSize={16} />
                </div>
                <div> Ξ{item.args.amount && ethers.utils.formatEther(item.args.amount)}</div>
                <div> {item.args.vote}</div>
                <div> {currentTimestamp - item.args.timestamp.toNumber()}</div>
                <div> {ethers.utils.formatEther(item.args.amount)} </div>
                <div>
                  {" "}
                  <b>{calcedAmount[item.args.voteID]}</b>{" "}
                </div>
                <div>{depositStatus[item.args.voteID] ? " ACTIVE " : " CLOSED "}</div>
                <div>
                  {" "}
                  <Button
                    style={{ marginTop: 8 }}
                    disabled={item.args.voter !== address || !depositStatus[item.args.voteID]}
                    onClick={async () => {
                      /* look how you call setPurpose on your contract: */
                      /* notice how you pass a call back for tx updates too */
                      const result = tx(writeContracts.YourContract.withdraw(item.args.voteID.toNumber()), update => {
                        console.log("📡 Transaction Update:", update);
                        if (update && (update.status === "confirmed" || update.status === 1)) {
                          console.log(" 🍾 Transaction " + update.hash + " finished!");
                          console.log(
                            " ⛽️ " +
                              update.gasUsed +
                              "/" +
                              (update.gasLimit || update.gas) +
                              " @ " +
                              parseFloat(update.gasPrice) / 1000000000 +
                              " gwei",
                          );
                        }
                      });
                      console.log("awaiting metamask/web3 confirm result...", result);
                      console.log(await result);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
}
