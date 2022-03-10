// import { useContractReader } from "eth-hooks";
// import { ethers } from "ethers";
import { Button, Input, Row, Col, Card } from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Address } from "../components";
import { firebase } from "../utils";
// import { Link } from "react-router-dom";

function Home({ typedSigner, mainnetProvider }) {
  const [boardName, setBoardName] = useState("");
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [boards, setBoards] = useState([]);

  const handleCreateBoard = async () => {
    setCreatingBoard(true);

    try {
      // The data to sign
      const value = {
        boardName: boardName,
        createdAt: Date.now(),
      };

      const signature = await typedSigner(
        {
          Board: [
            { name: "boardName", type: "string" },
            { name: "createdAt", type: "uint256" },
          ],
        },
        value,
      );

      const createBoard = firebase.functions.httpsCallable("createBoard");

      const { data } = await createBoard({ value, signature });

      // send value and signature to backend for validation
      console.log({ signature, id: data });
      setBoardName("");
    } catch (error) {
      console.log(error);
    }

    setCreatingBoard(false);
  };

  useEffect(() => {
    const unsubscribe = firebase.db
      .collection("boards")
      .orderBy("_createdAt", "desc")
      .onSnapshot(snapshot => {
        const data = [];

        snapshot.forEach(doc => {
          data.push({ ...doc.data(), id: doc.id });
        });

        setBoards(data);
      });

    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-row justify-between items-center">
        <h1 className="text-lg font-semibold p-0 m-0">Idea Boards</h1>
        <div className="inline-flex flex-row">
          <Input
            type="text"
            placeholder="New board name..."
            name="boardName"
            value={boardName}
            onChange={v => setBoardName(v.target.value)}
          />
          <Button loading={creatingBoard} className="ml-2" type="primary" onClick={handleCreateBoard}>
            Create Board
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <Row gutter={[16, 16]}>
          {boards.map((board, i) => (
            <Col className="mb-3" span={6} key={`${board.boardName}-${i}`}>
              <Link to={`/board/${board.id}`}>
                <Card bordered hoverable title={null}>
                  <div className="flex flex-1 mb-4">
                    <h2 className="text-base font-medium">{board.boardName}</h2>
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-1 items-center">
                      <span className="mr-2">By</span>
                      <Address short address={board.creator} ensProvider={mainnetProvider} fontSize={14} noLink />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default Home;
