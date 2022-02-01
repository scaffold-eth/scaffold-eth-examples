import React, { useState, useCallback, useEffect, useReducer } from "react";
import { parseEther, formatEther } from "@ethersproject/units";
import { Address, AddressInput } from "../components";
import { useContractReader } from "eth-hooks";
import { Modal, Button, Input, Row, Col, Tooltip, Select } from 'antd';

const { Option } = Select;

const GridSquare = (props) => {

  const occupant = useContractReader(props.readContracts, "TheBoard", "positionOccupant", [props.x, props.y], 4000);

  const classes = `grid-square color-${occupant && occupant.toNumber() > 0 ? 3 : props.color}`
  return(
    <div
      className={classes}
      onClick={(e) => {
        // Show modal
        props.showModal(e.target.id, occupant.toNumber());
        console.log('ID ', e.target.id);
        console.log(occupant.toNumber());
      }}
      id={props.id}
      x={props.x}
      y={props.y}
      color={props.color}
      amount={0}
    />
  );
}

const GridBoard = ({
  id,
  height,
  width,
  readContracts,
  writeContracts,
  address,
  tx,
}) => {
    
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [x, setX] = useState(undefined)
  const [y, setY] = useState(undefined)
  const [x2, setX2] = useState(undefined)
  const [y2, setY2] = useState(undefined)
  const [amount, setAmount] = useState()
  const [color, setColor] = useState()

  const [selectedPiece, setSelectedPiece] = useState();

  const showModal = (id, piece) => {
    //console.log(id);
    let coords = id.split('-')
    //console.log(coords)
    // Set the coords from the selection
    if (x == coords[0] && y == coords[1]) {
      setX(undefined);
      setY(undefined);
      setX2(undefined);
      setY2(undefined);
      setSelectedPiece(undefined);
    } else {
      if (!x && !y) {
        setX(coords[0]);
        setY(coords[1]);
        setSelectedPiece(piece);
      } else {
        if (x2 == coords[0] && y2 == coords[1]) {
          setX2(undefined);
          setY2(undefined);
        } else {
          setX2(coords[0]);
          setY2(coords[1]);
        }
      }
    }
  }

  // generates an array of 8 rows, each containing 8 GridSquares.
  const gridDisplay = []
  for (let row = 0; row < height; row ++) {
    gridDisplay.push([])
    for (let col = 0; col < width; col ++) {
      gridDisplay[row].push(
        <GridSquare
          key={`${row}-${col}`}
          id={`${row}-${col}`}
          x={col}
          y={row}
          tx={tx}
          color={row == x && col == y ? 1 : row == x2 && col == y2 ? 2 : 0}
          address={address}
          showModal={showModal}
          writeContracts={writeContracts}
          readContracts={readContracts}
        />
      )
    }
  }

  useEffect(() => {
    for (let row = 0; row < height; row ++) {
      gridDisplay.push([])
      for (let col = 0; col < width; col ++) {
        gridDisplay[row].push(
          <GridSquare
            key={`${row}-${col}`}
            id={`${row}-${col}`}
            x={col}
            y={row}
            tx={tx}
            color={row == x && col == y ? 1 : row == x2 && col == y2 ? 2 : 0}
            address={address}
            showModal={showModal}
            writeContracts={writeContracts}
            readContracts={readContracts}
          />
        )
      }
    }
  },);

  return (
    <div className='grid-board'>
      {gridDisplay}

      <div style={{ position: "fixed", textAlign: "left", left: 10, padding: 10 }}>
        <Address
          address={address}
          size="long"
          fontSize={14}
        />
        <div>
          <p>Selected Piece: {selectedPiece}</p>
          <p>X1: {x}, Y1: {y}</p>
          <p>X2: {x2}, Y2: {y2}</p>
          <Button
            onClick={ () => {tx( writeContracts.TheBoard.initPlayer() )} }
          >
            Join
          </Button>
          <Button
            onClick={ () => {tx( writeContracts.TheBoard.move(selectedPiece, y2, x2) )} }
          >
            Move
          </Button>
        </div>
      </div>
    </div>
  )
}

const GridView = ({
  address,
  localProvider,
  mainnetProvider,
  grid,
  writeContracts,
  readContracts,
  tx,
  height,
  width
}) => {
  return (
    <div id="main-container">
      <div id="main-grid-container" style={{ width: 400, margin: 'auto' }}>
        <div className="game-header">
          <h1></h1>
        </div>
        <div id="grid-board-container">
          <GridBoard
            height={height}
            width={width}
            address={address}
            readContracts={readContracts}
            writeContracts={writeContracts}
            tx={tx}
          />
        </div>
      </div>
      <div
      id="control-p anel">
      </div>
    </div>
  )
}

export default GridView;
