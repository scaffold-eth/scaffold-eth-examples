import React, { useState, useEffect } from "react";
import { Card, Collapse, InputNumber, Button, Tabs, Divider, Result, Typography, message, Row, Col } from "antd";
import ReactJson from 'react-json-view';
import {
  useContractReader,
} from "eth-hooks";
import { TiledHexagons } from 'tiled-hexagons';
import { HexGrid, Layout, Hexagon, Hex, GridGenerator } from 'react-hexgrid';

const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");

export default function GameBoard(
  address,
  readContracts,
  writeContracts,
) {

  const tiles = new Array(26).fill({
    shadow: 'black',
    fill: "lightgrey",
  });

  function rectangle(mapWidth, mapHeight) {
    let hexas = [];
    for (let q = 0; q < mapWidth; q++) {
      let offset = Math.floor(q/2); // or q>>1
      for (let r = -offset; r < mapHeight - offset; r++) {
        hexas.push(
          <HexTile
            q={q}
            r={r}
            s={-q-r}
          />
        );
      }
    }

    return hexas;
  }

  return(
    <div style={{ padding: "4%" }}>
      <TiledHexagons
        maxHorizontal={13}
        tiles={tiles}
        tileSideLengths={25}
        tileBorderRadii={2}
        tileGap={0}
        tileElevations={4}
      />
      <div>
        <HexGrid width={800} height={800} viewBox="-40 -30 150 200">
          <Layout size={{ x: 4, y: 4 }} flat={true} spacing={1.1} origin={{ x: 0, y: 0 }}>
            {rectangle(13, 13)}
          </Layout>
        </HexGrid>
      </div>
    </div>
  );
}
