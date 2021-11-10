import { useState } from "react";
import usePoller from "./Poller";

export default function useBlockNumber(provider, pollTime) {
  const [blockNumber, setBlockNumber] = useState();

  usePoller(() => {
    if (typeof provider !== "undefined" && provider.getBlockNumber) {
      async function getBlockNumber() {
        if (typeof provider.getBlockNumber == "function"){
          const nextBlockNumber = await provider.getBlockNumber();
          console.log("BLOCK NUMBER IS ",nextBlockNumber)
          if (nextBlockNumber !== blockNumber) {
            setBlockNumber(nextBlockNumber);
          }
        }
      }
      getBlockNumber();
    }
  }, pollTime || 1777);

  return blockNumber;
}
