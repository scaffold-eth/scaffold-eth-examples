import { useState, useMemo, useEffect } from "react";
// import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { Alert, Form, Input, Button, Modal } from "antd";

import { useOnBlock } from "eth-hooks";
import { TokenSelect } from "../components";
import { useERC20 } from "../hooks";

function Home({
  tx,
  address,
  localChainId,
  localProvider,
  userSigner,
  writeContracts,
  readContracts,
  mainnetProvider,
}) {
  const [approving, setApproving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState("");
  const [reviewData, setReviewData] = useState({});
  const [review, setReview] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [form] = Form.useForm();
  const [tokenInfo, tokenRead, tokenWrite] = useERC20(token, localProvider, userSigner, {
    spender: readContracts?.Multidrop?.address,
    owner: address,
    refreshKey: refreshKey,
  });

  useOnBlock(localProvider, () => {
    console.log(`Refreshing token info on new Block`);
    setRefreshKey(Date.now());
  });

  const handleParseFormatting = async (unit = "ether") => {
    const { addressList } = form.getFieldsValue();

    const _rawPairs = await addressList.split(/\r?\n/).reduce(
      async (memo, v) => {
        const acc = await memo;
        v = v.trim();

        if (v.length < 1) {
          return acc;
        }

        let address = v;

        try {
          const [add, amount] = v.split(",").map(item => item.trim().toLowerCase());

          address = add;

          // if address is ENS, resolve it here first before continuing
          if (address.includes(".")) {
            address = await mainnetProvider.resolveName(address);
          }

          // checksum address
          address = ethers.utils.getAddress(address);
          const formattedAmount = ethers.utils.parseUnits(amount, unit);

          // check Set if address is unique
          if (!acc.addresses.has(address)) {
            acc.addresses.add(address);
            acc.amounts.push(formattedAmount);
            acc.totalAmount = acc.totalAmount.add(formattedAmount);
          }
        } catch (error) {
          console.log(error);
          console.log(`Skipping and adding to skipped pile`);
          acc.skippedAddresses.push(address);
        }

        return acc;
      },
      {
        addresses: new Set([]),
        amounts: [],
        skippedAddresses: [],
        totalAmount: ethers.BigNumber.from("0"),
      },
    );

    const addresses = Array.from(_rawPairs.addresses);

    return { ..._rawPairs, addresses };
  };

  // const handleTokenChecks = async () => {}

  const approveToken = async () => {
    setApproving(true);
    if (token) {
      setMessage(`Checking spend limit for ${tokenInfo.symbol}...`);
      // check for approvals before continuing
      if (tokenInfo.balanceOfOwner.lt(reviewData.totalAmount)) {
        setMessage(`Not enough ${tokenInfo.symbol} balance`);
        setApproving(false);
        setReview(false);
        return null;
      }

      if (tokenInfo.allowance.lt(reviewData.totalAmount)) {
        setMessage(`Not enough allowance to spend, awaiting approval...`);

        try {
          const approval = await tx(tokenWrite.approve(readContracts?.Multidrop?.address, reviewData.totalAmount));
          await approval.wait(1);

          setRefreshKey(Date.now());
        } catch (error) {
          console.log(`Approval was not successful`);

          setApproving(false);
          setReview(false);
          return null;
        }
      }

      setApproving(false);
      setReview(false);
    }
  };

  const handleSend = async () => {
    setSubmitting(true);
    const params = [reviewData.addresses, reviewData.amounts];

    if (token) {
      params.push(token);
    }

    // add fees here
    const fees = await readContracts.Multidrop.fee();

    // add fees to tx value
    params.push({ value: token ? fees : reviewData.totalAmount.add(fees) });

    setMessage(
      `Dropping ${ethers.utils.formatUnits(reviewData.totalAmount, token ? tokenInfo.decimals : "ether")} ${
        !token ? "ETH" : tokenInfo.symbol
      } into accounts`,
    );

    await tx(writeContracts.Multidrop[token ? "sendToken" : "sendETH"](...params), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        // form.resetFields();
        setSubmitting(false);
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
    });
  };

  const onFinish = async () => {
    // handle finish here
    setSubmitting(true);

    const { addresses, amounts, totalAmount } = await handleParseFormatting(token ? tokenInfo.decimals : "ether");

    setReviewData({ addresses, amounts, totalAmount });

    setReview(true);
    setSubmitting(false);
  };

  const onFinishFailed = async () => {
    // handle finish failure here
  };

  return (
    <div className="mt-16">
      <div className="flex flex-1 justify-center">
        <h1 className="text-2xl">Multidrop Native & ERC-20 Tokens</h1>
      </div>

      <div className="flex flex-1 max-w-3xl mx-auto justify-center mt-4">
        <Form
          className="w-full"
          name="importList"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          form={form}
          autoComplete="off"
        >
          <Form.Item
            name="tokenselect"
            rules={[
              {
                required: false,
                message: "Select your token...",
              },
            ]}
          >
            <TokenSelect
              chainId={localChainId}
              localProvider={localProvider}
              placeholder="Search for your token... Eg: Gitcoin"
              nativeToken={{ name: "Native Token", symbol: "ETH" }}
              onChange={v => setToken(v !== "0x0000000000000000000000000000000000000000" ? v : null)}
            />
          </Form.Item>
          <Form.Item
            name="addressList"
            rules={[
              {
                required: true,
                message: "Put CSV format of addresses & values pairs here, each per line",
              },
            ]}
          >
            <Input.TextArea
              size="large"
              rows={10}
              placeholder="Addresses & values pairs, each per line: Eg: 0x...., 0.01"
            />
          </Form.Item>

          <div className="flex flex-1 justify-end mb-4">
            <span className="italic">Fee: Ξ 0.05</span>
          </div>

          <div className="flex flex-1 flex-col mt-4 justify-center items-center">
            {/* {submitting && (
                <div className="my-4 italic">
                  <Alert type="info" message={message} />
                </div>
              )} */}
            <Form.Item className="no-bottom-margin">
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                className="flex items-center justify-center"
                disabled={token && !tokenInfo.name}
              >
                Review {token ? tokenInfo.symbol : "ETH"} drop
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
      <Modal visible={review} onCancel={() => setReview(false)} footer={null} centered>
        {review && (
          <div className="flex flex-1 flex-col mx-auto items-center justify-center mt-4">
            <h1 className="text-2xl">You are dropping</h1>
            <div className="text-xl italic">
              <span>
                {ethers.utils.formatUnits(reviewData.totalAmount, token ? tokenInfo.decimals : "ether")}{" "}
                {!token ? "ETH" : tokenInfo.symbol}{" "}
              </span>
              to <span>{reviewData.addresses.length}</span> unique addresses
            </div>
            {token ? (
              <>
                <div className="mt-6 flex flex-col w-full">
                  {tokenInfo.balanceOfOwner.lt(reviewData.totalAmount) && (
                    <div className="mb-4 flex items-center justify-center">
                      <Alert type="warning" message="Your token balance is less than your drop total" />
                    </div>
                  )}
                  {tokenInfo?.allowance.lt(reviewData.totalAmount) && (
                    <Button
                      className="mt-2"
                      type="primary"
                      size="large"
                      loading={approving}
                      block
                      onClick={approveToken}
                    >
                      Approve {tokenInfo.symbol}
                    </Button>
                  )}
                  <Button
                    className="mt-2"
                    block
                    loading={submitting}
                    disabled={
                      tokenInfo.balanceOfOwner.lt(reviewData.totalAmount) ||
                      tokenInfo?.allowance.lt(reviewData.totalAmount)
                    }
                    type="primary"
                    size="large"
                    onClick={handleSend}
                  >
                    Drop {tokenInfo.symbol}
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-6 flex flex-col w-full">
                <Button className="mt-2" type="primary" size="large" loading={submitting} onClick={handleSend} block>
                  Send ETH
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Home;
