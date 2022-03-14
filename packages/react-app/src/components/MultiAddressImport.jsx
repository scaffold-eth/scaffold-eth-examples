/* eslint-disable react-hooks/exhaustive-deps */
import { Input, Select } from "antd";
import { ethers } from "ethers";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useCallback, useState } from "react";
import Address from "./Address";

const isENS = (address = "") => address.endsWith(".eth") || address.endsWith(".xyz");

export default function MultiAddressInput(props) {
  const { ensProvider, onChange } = props;
  const [rawValue, setRawValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [value, setValue] = useState(props.value || []);

  const handleNewAddresses = async e => {
    e && e.preventDefault();
    setProcessing(true);
    const processedList = (
      await Promise.all(
        rawValue
          .replace(/(?:\r\n|\r|\n)/g, ",")
          .split(",")
          .map(async pAddress => {
            let tpAddress = pAddress.trim();

            if (ethers.utils.isAddress(tpAddress)) {
              tpAddress = ethers.utils.getAddress(tpAddress);
            }

            if (tpAddress.includes(".")) {
              try {
                tpAddress = await ensProvider.resolveName(tpAddress);
              } catch (error) {
                console.log(error);
                tpAddress = "";
              }
            }

            console.log({ pAddress, tpAddress });

            return tpAddress;
          }),
      )
    ).filter(i => i.length > 0);

    const newValues = [...new Set([...value, ...processedList])];

    setValue(newValues);
    setRawValue("");

    setProcessing(false);

    if (onChange) {
      onChange?.(newValues);
    }
  };

  const deleteFromIndex = i => {
    const oldValues = [...value];
    oldValues.splice(i, 1);
    const newValues = [...oldValues];

    setValue(newValues);

    if (onChange) {
      onChange?.(newValues);
    }
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="max-h-32 mb-2 overflow-y-scroll">
          {value.map((add, i) => (
            <div key={add} className="flex items-center justify-between p-2 border-b border-dashed">
              <Address key={add} ensProvider={ensProvider} value={add} fontSize={16} short />
              <DeleteOutlined className="m-0 p-0 ml-1" onClick={() => deleteFromIndex(i)} />
            </div>
          ))}
        </div>
      )}
      <Input.TextArea
        value={rawValue}
        size={props.size}
        disabled={processing}
        placeholder={props.placeholder || "Import an address list..."}
        onPressEnter={handleNewAddresses}
        autoSize={{ minRows: 1, maxRows: 4 }}
        onChange={e => setRawValue(e.target.value)}
      />
    </div>
  );
}
