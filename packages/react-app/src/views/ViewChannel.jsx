import React, { useEffect, useMemo, useState, useRef } from "react";
import { Input, Spin, Card, Button } from "antd";
import { useParams } from "react-router-dom";
import { formatEther, parseEther } from "@ethersproject/units";
import axios from "axios";

import { getSignature } from "../helpers";

import { Address } from "../components";
import { usePoller } from "../hooks";

const SEND_SIG_EVERY = 15;

const StudentView = ({ tx, writeContracts, readContracts, id, userProvider, address, deadlinePassed, session }) => {
  const [ownerMode, setOwnerMode] = useState(0);
  const [rate, setRate] = useState(null);
  const lastMessage = useRef(null);
  const [fetched, setFetched] = useState(false);

  const toggleStream = () => {
    setOwnerMode(_ownerMode => !_ownerMode);
  };

  useEffect(() => {
    async function fetchLast() {
      const { data } = await axios.get("http://127.0.0.1:8001/sig/" + id);
      if (data) {
        lastMessage.current = data;
        setOwnerMode(1);
        setRate(data.rate);
      }
      setFetched(true);
    }

    fetchLast();
  }, [id]);

  useEffect(() => {
    async function updateSignature() {
      const valueToSend = (
        (rate * SEND_SIG_EVERY) / 60 +
        (lastMessage.current ? lastMessage.current.value : 0)
      ).toFixed(2);
      let bigValue = parseEther(valueToSend.toString());
      if (bigValue.gt(session.stake)) bigValue = session.stake;
      const hash = await readContracts.MVPC.getHash(id, bigValue);

      const signature = await getSignature(userProvider, address, hash);

      // const valid = await readContracts.MVPC.isSignatureValid(id, bigValue, signature);
      // console.log("Is signature valid?", valid);

      const updatedMessage = {
        id,
        value: Number(formatEther(bigValue)),
        hash,
        sig: signature,
        rate,
      };

      lastMessage.current = updatedMessage;
      await axios.post("http://127.0.0.1:8001/sig/", updatedMessage);
    }

    if (ownerMode && !deadlinePassed && fetched) {
      updateSignature();
      const intervalID = setInterval(updateSignature, SEND_SIG_EVERY * 1000);
      return () => clearInterval(intervalID);
    }

    return () => {};
  }, [ownerMode, deadlinePassed, fetched]);

  const withdrawAndClose = async () => {
    tx(writeContracts.MVPC.withdraw(id));
  };

  if (!fetched) {
    return <>Fetching..</>;
  }

  if (session.status === 2) {
    return <>Channel is closed.</>;
  }

  return (
    <div>
      <h2>Student</h2>
      {ownerMode ? (
        <div>
          {!deadlinePassed ? (
            <>
              Sending {((rate * SEND_SIG_EVERY) / 60).toFixed(2)} ETH each {SEND_SIG_EVERY} seconds.
              <br />
              Meanwhile, your teacher can claim {lastMessage.current ? lastMessage.current.value.toFixed(2) : 0} ETH.
              <br />
            </>
          ) : (
            <div>
              <p>Deadline is passed. Your teacher can no longer close the channel and claim is no longer increased.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {!deadlinePassed ? (
            <>
              <p style={{ marginBottom: 7 }}>Please indicate ETH/minute rate for your teacher:</p>
              <Input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Rate" min="0" />
              <Button style={{ marginTop: 7 }} onClick={toggleStream} disabled={!rate}>
                Start streaming
              </Button>
            </>
          ) : (
            <p>No time left to stream for your teacher..</p>
          )}
        </div>
      )}
      {session.status === 1 && (
        <Button style={{ marginTop: 10 }} disabled={session.status === 2} onClick={withdrawAndClose}>
          Withdraw stake and close channel
        </Button>
      )}
    </div>
  );
};

const TeacherView = ({ readContracts, writeContracts, session, id, timeLeft, userProvider, address, tx }) => {
  const [bestSig, setBestSig] = useState(null);

  usePoller(async () => {
    const { data } = await axios.get("http://127.0.0.1:8001/sig/" + id);
    if (data && (!bestSig || bestSig.value < data.value)) {
      setBestSig(data);
    }
  }, 1337);

  const claimAndClose = async () => {
    const bigValue = parseEther(bestSig.value.toString());
    const hash = await readContracts.MVPC.getHash(id, bigValue);
    const signature = await getSignature(userProvider, address, hash);
    tx(writeContracts.MVPC.close(bestSig.id, bigValue, bestSig.sig, signature));
  };

  if (session.status === 2) {
    return <>Channel is closed.</>;
  }

  return (
    <div>
      <h2>Teacher</h2>
      {timeLeft > 0 ? (
        <>
          {bestSig ? (
            <div>
              <p>You can claim {bestSig.value.toFixed(2)} ETH.</p>
              <Button onClick={claimAndClose} disabled={!bestSig.value}>
                Claim and close channel
              </Button>
            </div>
          ) : (
            <p>Fetching signatures from student..</p>
          )}
        </>
      ) : (
        <p>Unfortunately, deadline is passed and channel is no longer valid..</p>
      )}
    </div>
  );
};

const ViewChannel = props => {
  const { readContracts, mainnetProvider, address } = props;
  const [bestSig, setBestSig] = useState(null);

  const { id } = useParams();
  const [session, setSession] = useState(null);

  usePoller(async () => {
    if (readContracts) {
      const currentSession = await readContracts.MVPC.getSession(id);
      const { data } = await axios.get("http://127.0.0.1:8001/sig/" + id);
      if (data && (!bestSig || bestSig.value < data.value)) {
        setBestSig(data);
      }
      setSession(currentSession);
    }
  }, 1337);

  const timeLeft = useMemo(() => {
    if (session && session.status === 0) return 0;
    return session ? Math.max(session.timeout - Date.now() / 1000, 0).toFixed(2) : 0;
  }, [session]);

  return session ? (
    <div>
      <Card>
        <p>
          <b>Channel status: </b>
          {session.status === 1 ? "Opened" : "Closed"}
        </p>
        <p>
          <b>Stake: </b>
          {formatEther(session.stake)} ETH
        </p>
        <p>
          <b>Time left: </b>
          {timeLeft} seconds
        </p>
        <p>
          <b>Signer (student): </b>
          <Address address={session.signer} ensProvider={mainnetProvider} fontSize={16} />
        </p>
        <p style={{ marginBottom: 0 }}>
          <b>Destination (teacher): </b>
          <Address address={session.destination} ensProvider={mainnetProvider} fontSize={16} />
        </p>
      </Card>
      <div style={{ marginTop: "20px" }} />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      {address === session.owner && (
        <StudentView {...props} session={session} id={id} timeLeft={timeLeft} deadlinePassed={timeLeft <= 0} />
      )}
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      {address === session.destination && <TeacherView {...props} session={session} id={id} timeLeft={timeLeft} />}
    </div>
  ) : (
    <div style={{ textAlign: "center" }}>
      <Spin />
    </div>
  );
};

export default ViewChannel;
