import { Input, Button, Row, Col, Card, notification } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { LikeOutlined, LikeFilled } from "@ant-design/icons";
import { Address } from "../components";
import { firebase } from "../utils";
import classnames from "classnames";

export default function Board({ typedSigner, mainnetProvider, address }) {
  const { boardId } = useParams();
  const [addingNewProposal, setaddingNewProposal] = useState(false);
  const [boardInfo, setBoardInfo] = useState({});
  const [newProposal, setNewProposal] = useState("");
  const [proposals, setProposals] = useState([]);
  const [myUpvotes, setMyupvotes] = useState([]);
  const [upvoteCounts, setUpvoteCounts] = useState({});

  const handleNewProposals = async () => {
    setaddingNewProposal(true);

    try {
      // The data to sign
      const value = {
        board: boardId,
        proposal: newProposal,
        createdAt: Date.now(),
      };

      const signature = await typedSigner(
        {
          Proposal: [
            { name: "board", type: "string" },
            { name: "proposal", type: "string" },
          ],
        },
        value,
      );

      const createBoard = firebase.functions.httpsCallable("addNewProposal");

      await createBoard({ value, signature });

      // send value and signature to backend for validation
      notification.success({ message: "Success", description: "Proposal submitted" });

      setNewProposal("");
    } catch (error) {
      console.log(error);
    }

    setaddingNewProposal(false);
  };

  const handleVote = async (proposalID, upvote) => {
    const value = {
      upvote,
      board: boardId,
      proposal: proposalID,
      createdAt: Date.now(),
    };

    const signature = await typedSigner(
      {
        Vote: [
          { name: "board", type: "string" },
          { name: "proposal", type: "string" },
          { name: "upvote", type: "bool" },
          { name: "createdAt", type: "uint256" },
        ],
      },
      value,
    );

    const createBoard = firebase.functions.httpsCallable("upvoteProposal");

    await createBoard({ value, signature });

    notification.success({ message: "Success", description: "Votes updated" });
  };

  const loadBoard = async () => {
    try {
      const doc = await firebase.db.doc(`boards/${boardId}`).get();

      if (!doc.exists) {
        throw new Error("Invalid board");
      }

      setBoardInfo({ ...doc.data(), id: doc.id });
    } catch (error) {
      console.log(error);
    }
  };

  // listen for new proposals
  useEffect(() => {
    if (boardId) {
      loadBoard();
      const unsubscribe = firebase.db
        .collection("proposals")
        .where("board", "==", boardId)
        .orderBy("_createdAt", "desc")
        .onSnapshot(snapshot => {
          const data = [];

          snapshot.forEach(doc => {
            data.push({ ...doc.data(), id: doc.id });
          });

          setProposals(data);
        });

      return unsubscribe;
    }
  }, [boardId]);

  // listen for upvotes count
  useEffect(() => {
    if (boardId) {
      loadBoard();
      const unsubscribe = firebase.db
        .collection("upvotes")
        .where("board", "==", boardId)
        .onSnapshot(snapshot => {
          const data = [];

          snapshot.forEach(doc => {
            data.push({ proposal: doc.data().proposal });
          });

          const counts = data.reduce((acc, item) => {
            const key = item.proposal;

            // check if acc has this key
            acc[key] = acc[key] ? acc[key] + 1 : 1;

            return acc;
          }, {});

          setUpvoteCounts(counts);
        });

      return unsubscribe;
    }
  }, [boardId]);

  // listen for proposals update
  useEffect(() => {
    if (boardId && address) {
      const unsubscribe = firebase.db
        .collection("upvotes")
        .where("board", "==", boardId)
        .where("creator", "==", address)
        .onSnapshot(snapshot => {
          const data = [];

          snapshot.forEach(doc => {
            data.push(doc.data().proposal);
          });

          setMyupvotes(data);

          console.log({ myUpvotes: data });
        });

      return unsubscribe;
    }
  }, [boardId, address]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="absolute">
        <Link to="/">Go Back</Link>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-lg font-semibold">{boardInfo.boardName}</h1>
      </div>

      <div className="flex flex-1 mt-8 flex-col w-full max-w-2xl mx-auto">
        <div>
          <Input.TextArea
            placeholder="Add your giga idea..."
            autoSize={{ maxRows: 6 }}
            value={newProposal}
            onChange={e => setNewProposal(e.target.value)}
          />
          {newProposal.length > 0 && (
            <div className="mt-2 flex flex-1 justify-end">
              <Button type="primary" onClick={handleNewProposals} loading={addingNewProposal}>
                Add Proposal
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-1 mt-8">
          <Row gutter={[16, 16]}>
            {proposals.map((item, i) => {
              const hasMyUpvote = myUpvotes.includes(item.id);
              return (
                <Col className="mb-3" span={24} key={`${item.id}-${i}`}>
                  <Card className={classnames("border")} title={null}>
                    <div className="flex flex-1 mb-4">
                      <h2 className="text-base font-normal">{item.proposal}</h2>
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-1 items-center">
                        <span className="mr-2">Created by</span>
                        <Address short address={item.creator} ensProvider={mainnetProvider} fontSize={14} />
                      </div>

                      <Button
                        type={hasMyUpvote ? "primary" : "dashed"}
                        ghost={hasMyUpvote}
                        onClick={() => handleVote(item.id, !hasMyUpvote)}
                      >
                        <div className="inline-flex items-center justify-center">
                          <LikeOutlined style={{ fontSize: "16px" }} />
                          <span className="ml-2 text-base">{upvoteCounts[item.id] || 0}</span>
                        </div>
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
    </div>
  );
}
