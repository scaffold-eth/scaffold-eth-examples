import { useState, useMemo, useEffect } from "react";
// import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { Alert, Form, Input, Button } from "antd";
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
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState("");
  const [form] = Form.useForm();
  const [tokenInfo, tokenRead, tokenWrite] = useERC20(token, localProvider, userSigner, {
    spender: readContracts?.Multidrop?.address,
    owner: address,
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

  const onFinish = async () => {
    // handle finish here
    setSubmitting(true);

    const { addresses, amounts, totalAmount } = await handleParseFormatting(token ? tokenInfo.decimals : "ether");

    if (token) {
      setMessage(`Checking spend limit for ${tokenInfo.symbol}...`);
      // check for approvals before continuing
      if (tokenInfo.balanceOfOwner.lt(totalAmount)) {
        setMessage(`Not enough ${tokenInfo.symbol} balance`);
        return null;
      }

      if (tokenInfo.allowance.lt(totalAmount)) {
        setMessage(`Not enough allowance to spend, awaiting approval...`);
        const approval = await tx(tokenWrite.approve(readContracts?.Multidrop?.address, totalAmount));
        await approval.wait(1);
      }
    }

    const params = [addresses, amounts];

    if (token) {
      params.push(token);
    }

    // add fees here
    const fees = await readContracts.Multidrop.fee();

    // add fees to tx value
    params.push({ value: token ? fees : totalAmount.add(fees) });

    setMessage(
      `Dropping ${ethers.utils.formatUnits(totalAmount, token ? tokenInfo.decimals : "ether")} ${
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

    setSubmitting(false);
  };

  const onFinishFailed = async () => {
    // handle finish failure here
  };

  return (
    <div className="mt-16">
      {/* <div className="flex flex-1 justify-center">
        <h1 className="text-2xl">Multidrop</h1>
      </div> */}

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
                required: true,
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
          <div className="flex flex-1 flex-col mt-4 justify-center items-center">
            {submitting && (
              <div className="my-4 italic">
                <Alert type="info" message={message} />
              </div>
            )}
            <Form.Item className="no-bottom-margin">
              <Button
                type="primary"
                htmlType="submit"
                className="flex items-center justify-center"
                disabled={token && !tokenInfo.name}
                loading={submitting}
              >
                {submitting
                  ? "Faucet turning..."
                  : token
                  ? !tokenInfo.name
                    ? `...`
                    : `Approve & Drop ${tokenInfo.symbol}`
                  : "Drop ETH"}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Home;
