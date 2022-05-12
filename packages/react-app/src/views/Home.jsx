import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Button } from "antd";
import React from "react";

const zero = ethers.BigNumber.from("0");

function Home({ tx, readContracts, writeContracts }) {
  const price = useContractReader(readContracts, "YourContract", "price", []) || zero;
  // const balance = (useContractReader(readContracts, "YourContract", "balanceOf", [address]) || zero).toNumber();

  const buyTicket = async () => {
    const result = tx(writeContracts.YourContract.buyTicket({ value: ethers.utils.parseEther("0.01") }), update => {
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
  };

  return (
    <section>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>Hello Ticket App</div>

      {/* Buy a ticket: start */}
      <div style={{ margin: "20px auto", maxWidth: "500px", border: "1px solid" }}>
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>Buy A Ticket (1 per address)</div>
        <div style={{ marginBottom: "20px" }}>
          <Button type="primary" onClick={buyTicket}>
            Buy Ticket for Ξ {ethers.utils.formatUnits(price)}
          </Button>
        </div>
      </div>
      {/* Buy a ticket: end */}
    </section>
  );
}

export default Home;
