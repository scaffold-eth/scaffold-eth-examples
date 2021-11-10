import React, { useState, useEffect } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { Avatar, Spin, Button } from "antd";
import { useEventListener } from "./hooks";
import { getFromIPFS, isBlacklisted } from "./helpers";
import { Loader } from "./components";
import StackGrid from "react-stack-grid";
import { useQuery } from "react-apollo";
import { ALL_INKS_QUERY } from "./apollo/queries"

const INKS_TO_SHOW = 24;

export default function NftyWallet(props) {

  const { loading, error, data, fetchMore } = useQuery(ALL_INKS_QUERY, {
    variables: { first: INKS_TO_SHOW, skip: 0 },
      fetchPolicy: "cache-and-network"
  });

  const [inks, setInks] = useState([])
  const [inkList, setInkList] = useState([])

  useEffect(() => {

    const getInks = (data) => {
      data.forEach(async (ink) => {
        if (isBlacklisted(ink.jsonUrl)) return;
        if (inkList.includes(ink.id)) return;
        let _ink = ink;
        let tIpfsConfig = {...props.ipfsConfig}
        tIpfsConfig['timeout'] = 10000
        try {
          let newInkJson = await getFromIPFS(ink.jsonUrl, tIpfsConfig);
          _ink.metadata = JSON.parse(newInkJson)
          console.log(_ink)
          setInks((inks) => [...inks, _ink]);
        } catch (e) { console.log(e) }
        setInkList((inkList) => [...inkList, _ink.id])
      });
    };

    data ? getInks(data.inks) : console.log("loading");
  }, [data]);

  console.log(inks)

  let allInkView

  if (inks && inks.length > 0) {
    allInkView = (
      <>
      <StackGrid columnWidth={120} gutterHeight={32} gutterWidth={32}>
        {inks.map((item) => {
          return (
            <div
              key={item["id"]}
              ipfsHash={item["jsonUrl"]}
              style={{ cursor: "pointer" }}
            >
              {item.metadata ? (
                <Link to={`viewink/${item.id}`}>
                <img
                  src={item.metadata.image}
                  alt={item.metadata.name}
                  width="120"
                  height="120"
                />
                </Link>
              ) : (
                <Avatar
                  size={120}
                  style={{ backgroundColor: "#FFFFFF" }}
                  icon={<Spin style={{ opacity: 0.125 }} size="large" />}
                />
              )}
            </div>
          );
        })}
      </StackGrid>
      {<Button
          style={{margin:12, justifyContent: 'center'}}
          onClick={() =>
        fetchMore({
          variables: {
            skip: data.inks.length,
            first: INKS_TO_SHOW
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return Object.assign({}, prev, {
              inks: [...prev.inks, ...fetchMoreResult.inks]
            });
          }
        })}
          //loading={xloading}
          disabled={false}
          >
          Button
          {//xloading?'Loading':(((inkPage * inksPerPage + inksPerPage).toString() < inkCreations.length)?'Show More':allInksArray.length + ' inks')
          }
        </Button>}
        </>
    );
  } else {
    allInkView = <Loader />;
  }

  return allInkView;
}
