import React, { useEffect, useState } from "react";
import { Card, Row, Col, Select, List, Button } from "antd";
import { EtherInput } from "../components";
import { useContractReader, useEventListener } from "../hooks";
import { parseEther } from "@ethersproject/units";
const { Option } = Select;

export default function Donate({ price, writeContracts, tx, recipientOptions }) {

  const [ donateAmount, setDonateAmount ] = useState()
  const [ donateIndex, setDonateIndex ] = useState()

  return (
    <div style={{width:500, margin:'auto', marginTop:32}}>
      <Card title={"Donate"} extra={""}>
        <Row gutter={4}>
          <Col span={11}>
            <EtherInput
              price={price}
              value={donateAmount}
              onChange={value => {
                setDonateAmount(value);
              }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder = "recipient..."
              onChange={value => {
                setDonateIndex(value);
              }}
            >
              {recipientOptions}
            </Select>
          </Col>
          <Col span={4}>
            <Button onClick={()=>{
              /* you can also just craft a transaction and send it to the tx() transactor */

                const finalTx = {
                  to: writeContracts.CLR.address,
                  value: parseEther(""+parseFloat(donateAmount).toFixed(6)),
                  data: writeContracts.CLR.interface.encodeFunctionData("donate(uint256)",[ donateIndex ])
                }

                console.log("finalTx",finalTx)

              tx(finalTx);
              /* this should throw an error about "no fallback nor receive function" until you add it */
            }}>Donate</Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
