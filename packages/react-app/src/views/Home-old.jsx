import { useState } from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Form, Input, Button } from "antd";

const zero = ethers.BigNumber.from("0");

function Home({ tx, writeContracts, readContracts, mainnetProvider }) {
  const [submitting, setSubmitting] = useState(false);
  // const [ total, setTotal ] = useState(0);
  const [form] = Form.useForm();

  const handleParseFormatting = async (unit = "ether") => {
    const { addressList } = form.getFieldsValue();
    const skippedAddresses = [];

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
          if (address.includes(".eth")) {
            address = await mainnetProvider.resolveName(address);
          }

          // checksum address
          address = ethers.utils.getAddress(address);
          const formattedAmount = ethers.utils.parseUnits(amount, unit);

          // check if user is indexed
          const index = ((await readContracts.Multidrop.indexOfUser(address)) || zero).toNumber();

          // check Set if address is unique
          if (!acc.tracker.has(address)) {
            acc.tracker.add(address);
            // push to index list, if address exists
            if (index > 0) {
              acc.indexes.push(index);
              acc.indexesAmounts.push(formattedAmount);
            } else {
              // else push to address list
              acc.addresses.push(address);
              acc.addressesAmounts.push(formattedAmount);
            }
            acc.totalAmount = acc.totalAmount.add(formattedAmount);
          }
        } catch (error) {
          console.log(error);
          console.log(`Skipping and adding to skipped pile`);
          skippedAddresses.push(address);
        }

        return acc;
      },
      {
        addresses: [],
        addressesAmounts: [],
        indexes: [],
        indexesAmounts: [],
        tracker: new Set([]),
        totalAmount: ethers.BigNumber.from("0"),
      },
    );

    const addresses = Array.from(_rawPairs.addresses);

    return { ..._rawPairs, addresses, skippedAddresses };
  };

  const onFinish = async () => {
    // handle finish here
    setSubmitting(true);

    const { addresses, addressesAmounts, indexes, indexesAmounts, skippedAddresses, totalAmount } =
      await handleParseFormatting();

    console.log(
      addresses,
      addressesAmounts,
      indexes,
      indexesAmounts,
      skippedAddresses,
      ethers.utils.formatUnits(totalAmount),
    );

    await tx(
      // writeContracts.Multidrop.sendETH(addresses, addressesAmounts, indexes, indexesAmounts, { value: totalAmount }),
      writeContracts.Multidrop.sendETH2(addresses, addressesAmounts, { value: totalAmount }),
      update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          form.resetFields();
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
      },
    );

    setSubmitting(false);
  };

  const onFinishFailed = async () => {
    // handle finish failure here
  };

  return (
    <div className="mt-8">
      <div className="flex flex-1 justify-center">
        <h1 className="text-2xl">Do you want to drop some ETH</h1>
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
              className="border-l-0 border-t-0 border-r-0 border-b rounded-none"
            />
          </Form.Item>
          <div className="flex flex-1 mt-4 justify-center items-center">
            <Form.Item className="no-bottom-margin">
              <Button type="primary" htmlType="submit" loading={submitting}>
                {submitting ? "Dropping..." : "Drop to Addresses"}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Home;
