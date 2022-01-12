import React from "react";
import { Link } from "react-router-dom";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { ethers } from "ethers";
import { Card, List, Descriptions } from "antd";
import { Address } from "../components";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function Home({ readContracts, localProvider, blockExplorer }) {
  const pgs = (
    useEventListener(readContracts, "RetFundERC721Deployer", "tokenDeployed", localProvider, 1) || []
  ).reverse();

  console.log(pgs);

  return (
    <div className="container mx-auto mt-5">
      <div className="flex flex-1 mt-20 w-full">
        <List
          className="w-full"
          grid={{ gutter: 16, column: 3 }}
          dataSource={pgs}
          renderItem={item => {
            return (
              <List.Item>
                <Card
                  size="small"
                  className="hoverableLight"
                  title={
                    <div
                      style={{
                        padding: "0 0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        justifyContent: "space-between",
                        fontWeight: 400,
                      }}
                    >
                      <div style={{ fontSize: "1rem", fontWeight: 500 }}>
                        <Link to={`/token/${item.args.token}`}>{item.args.name}</Link>
                      </div>
                      <Address fontSize="15" value={item.args.token} />
                    </div>
                  }
                >
                  <Descriptions bordered size="small" labelStyle={{ textAlign: "center", height: "2.5rem" }}>
                    <Descriptions.Item label="Creator" span={4}>
                      <Address
                        className="inline-flex justify-center items-center"
                        address={item.args.creator}
                        fontSize={15}
                        blockExplorer={blockExplorer}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At" span={4}>
                      <div>{new Date(item.args.timestamp.toNumber() * 1000).toLocaleString()}</div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Home;
