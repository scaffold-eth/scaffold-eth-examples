// import { useContractReader } from "eth-hooks";
// import { ethers } from "ethers";
import { Button, Input, Row, Col, Card, Form, Typography } from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Address } from "../components";
import { NewBoard } from "../customComponents";
import { firebase } from "../utils";
// import { Link } from "react-router-dom";

function Home({ typedSigner, mainnetProvider }) {
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [boards, setBoards] = useState([]);
  const [form] = Form.useForm();

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
          <Button type="primary" onClick={() => setCreatingBoard(true)}>
            Create Board
          </Button>
          {/* */}
        </div>
      </div>

      <div className="mt-12">
        <Row gutter={[16, 16]}>
          {boards.map((board, i) => (
            <Col className="mb-3" span={8} key={`${board.name}-${i}`}>
              <Link to={`/board/${board.id}`}>
                <Card bordered hoverable title={null}>
                  <div className="flex flex-1 mb-2">
                    <h2 className="text-base font-medium">{board.name}</h2>
                  </div>
                  <div className="flex flex-1 mb-3">
                    <Typography.Paragraph ellipsis={{ rows: 2 }}>{board.description}</Typography.Paragraph>
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

      <NewBoard
        visible={creatingBoard}
        typedSigner={typedSigner}
        closeModal={() => setCreatingBoard(false)}
        mainnetProvider={mainnetProvider}
      />
    </div>
  );
}

export default Home;
