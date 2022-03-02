import React, { useState, useEffect } from "react";
import random from "random";
import randomcolor from "randomcolor";
import { Button, Slider } from "antd";
import { ethers } from "ethers";
// import { useContractReader } from "eth-hooks";
// import { Link } from "react-router-dom";

const splitAlpha = color => {
  const rgb = color.replace(/^rgba?\(|\s+|\)$/g, "").split(",");
  const alpha = ethers.utils.parseUnits(rgb.pop().toString());

  return [rgb, alpha];
};

function Home({ tx, readContracts, writeContracts }) {
  const [shades, setShades] = useState({
    background: "rgba(0, 0, 0, 0)",
    left: "rgba(0, 0, 0, 0)",
    right: "rgba(0, 0, 0, 0)",
  });
  const [degree, setDegree] = useState(0);

  const rotateShades = () => {
    setShades({
      background: randomcolor({ luminosity: "light", format: "rgba" }),
      left: randomcolor({ luminosity: "light", format: "rgba" }),
      right: randomcolor({ luminosity: "bright", format: "rgba" }),
    });
    setDegree(random.int(0, 360));
  };

  // console.log(
  //   randomcolor({ luminosity: "light", format: "rgba" })
  //     .replace(/^rgba?\(|\s+|\)$/g, "")
  //     .split(","),
  // );

  const handleMint = async () => {
    const [bgRGB, bgAlpha] = splitAlpha(shades.background);
    const [leftRGB, leftAlpha] = splitAlpha(shades.left);
    const [rightRGB, rightAlpha] = splitAlpha(shades.right);

    const shadesArr = [...bgRGB, ...leftRGB, ...rightRGB];
    const alphas = [bgAlpha, leftAlpha, rightAlpha];

    tx(
      writeContracts.OptimisticShades.mint(shadesArr, degree, alphas, { value: ethers.utils.parseUnits("0.1") }),
      update => {
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
      },
    );
  };

  useEffect(() => {
    rotateShades();
  }, []);

  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      <div
        className="w-80 h-80 rounded"
        style={{
          backgroundColor: shades.background,
          backgroundImage: `linear-gradient(${degree}deg, ${shades.left}, ${shades.right})`,
        }}
      ></div>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center w-full">
        <Slider min={0} max={360} value={degree} className="w-full max-w-xl" onChange={setDegree} />
        <div className="mt-8">
          <Button className="mr-4" onClick={rotateShades}>
            Change Shades
          </Button>
          <Button onClick={handleMint}>Mint Shade</Button>
        </div>
      </div>
    </div>
  );
}

export default Home;
