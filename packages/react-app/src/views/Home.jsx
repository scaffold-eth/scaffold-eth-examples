import React from "react";
import { useContractReader } from "eth-hooks";
import { useEffect, useState } from "react";
import { Button, Card, Input } from "antd";

export default function Home({ tx, address, readContracts, writeContracts }) {
  const myBalance = useContractReader(readContracts, "Notepad", "balanceOf", [address, 0]);

  const [notepads, setNotepads] = useState([]);
  useEffect(() => {
    const getMyNotepads = async () => {
      if (!myBalance) return;

      const myNotepads = [];
      for (let i = 0; i < myBalance; i++) {
        const tokenURI = await readContracts.Notepad.tokenURI(address, i);

        if (!tokenURI) continue;

        const decoded = Buffer.from(tokenURI.substring(29), "base64");
        const parsed = JSON.parse(decoded);
        console.log(parsed);
        myNotepads.push(parsed);
      }
      setNotepads(myNotepads);
    };

    getMyNotepads();
  }, [myBalance, address, readContracts]);

  const [note, setNote] = useState({});
  const onAddNote = async i => {
    await tx(writeContracts.Notepad.addToNote(i, note[i]));
    setNote({ ...note, [i]: "" });
  };

  const onMintNotepad = async () => {
    await tx(writeContracts.Notepad.mintItem(address));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Button style={{ margin: "15px" }} type="primary" onClick={onMintNotepad}>
        Mint New Notepad!
      </Button>
      {notepads.map((n, i) => {
        return (
          <div style={{ marginBottom: "15px" }} key={i}>
            <div style={{ display: "flex", margin: "15px", justifyContent: "center" }}>
              <Input
                style={{ width: "250px" }}
                value={note[i]}
                onChange={e => setNote({ ...note, [i]: e.target.value })}
              />
              <Button type="primary" onClick={() => onAddNote(i)}>
                Add Note
              </Button>
            </div>
            <Card title={`${n.name} - ${n.description}`}>
              <img alt="an NFT notepad" src={n.image} />
            </Card>
          </div>
        );
      })}
    </div>
  );
}
