import React, { useState, useEffect } from "react";
import random from "random";
import randomcolor from "randomcolor";
import { Button, Slider } from "antd";
import { ethers } from "ethers";
import { useERC721Mint } from "../hooks";
// import { useContractReader } from "eth-hooks";
// import { Link } from "react-router-dom";

const splitAlpha = color => {
  const rgb = color.replace(/^rgba?\(|\s+|\)$/g, "").split(",");
  const alpha = rgb.pop().toString().split(".");

  return [rgb, alpha];
};

function Home({ tx, readContracts, writeContracts }) {
  const [shades, setShades] = useState({
    topLeft: "rgba(0, 0, 0, 0)",
    topRight: "rgba(0, 0, 0, 0)",
    bottomLeft: "rgba(0, 0, 0, 0)",
    bottomRight: "rgba(0, 0, 0, 0)",
  });

  const mints = useERC721Mint(readContracts, "OptimisticShades");

  console.log(mints);

  const rotateShades = () => {
    const colors = [];
    let last = "light";

    do {
      const color = randomcolor({ luminosity: last, hue: "random", format: "rgba" });
      // const color = randomcolor({ hue: "random", format: "rgba" });

      if (!colors.includes(color)) {
        colors.push(color);
        last = last === "light" ? "bright" : "light";
      }
    } while (colors.length < 4);

    last = "bright";

    setShades({
      topLeft: colors[0],
      topRight: colors[1],
      bottomLeft: colors[2],
      bottomRight: colors[3],
    });
  };

  const handleMint = async () => {
    const [topLeftRGB, topLeftAlpha] = splitAlpha(shades.topLeft);
    const [topRightRGB, topRightAlpha] = splitAlpha(shades.topRight);
    const [bottomLeftRGB, bottomLeftAlpha] = splitAlpha(shades.bottomLeft);
    const [bottomRightRGB, bottomRightAlpha] = splitAlpha(shades.bottomRight);

    const palletteShades = [...topLeftRGB, ...topRightRGB, ...bottomLeftRGB, ...bottomRightRGB];
    const alphas = [topLeftAlpha, topRightAlpha, bottomLeftAlpha, bottomRightAlpha];

    console.log(palletteShades, alphas);

    tx(
      writeContracts.OptimisticShades.mint(palletteShades, alphas, { value: ethers.utils.parseUnits("0.1") }),
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
    <div className="flex flex-1 flex-col justify-center items-center" style={{ lineHeight: "0" }}>
      <div className="w-80 h-80">
        <div className="inline-flex m-0 p-0 w-40 h-40" style={{ backgroundColor: shades.topLeft }} />
        <div className="inline-flex m-0 p-0 w-40 h-40" style={{ backgroundColor: shades.topRight }} />
        <div className="inline-flex m-0 p-0 w-40 h-40" style={{ backgroundColor: shades.bottomLeft }} />
        <div className="inline-flex m-0 p-0 w-40 h-40" style={{ backgroundColor: shades.bottomRight }} />
      </div>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center w-full">
        {/* <Slider min={0} max={360} value={degree} className="w-full max-w-xl" onChange={setDegree} /> */}
        <div>
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
