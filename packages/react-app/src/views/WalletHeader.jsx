import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Select, Button, Space } from "antd";
import Blockies from "react-blockies";
const { Option } = Select;

function WalletHeader({address, network, networks, handleChange, loadWeb3Modal, logoutOfWeb3Modal, injectedProvider}) {

  return (
          <Row align="middle" justify="center" gutter={12} style={{padding: 8}}>
              <Col span={8}>
              <Row align="middle" justify="center" gutter={4}>
                <Link style={{fontSize:60}} to="/wallet"><img alt="Mage logo" src={`https://avatars.dicebear.com/api/human/${address?address:'wizard'}.svg`} style={{width: 80, height: 80, imageRendering:"pixelated"}}/></Link>
              </Row>
              </Col>
              <Col span={8}>
              <Link to="/receive">
              <Row align="middle" justify="center" gutter={4}>
                {(address ?
                    <Blockies seed={address.toLowerCase()} size={8} scale={8}/>
                  : <span>"Connecting..."</span>)}
              </Row>
              </Link>
              </Col>
              <Col span={8}>
              <Space>
                {injectedProvider? <span>{networks[network]?networks[network].name:null}</span>
                  : <Select defaultValue={networks[network]?networks[network].name:"ETH"} style={{ width: 160 }} onChange={handleChange} size="large">
                    {Object.values(networks).map(n => (
                      <Option key={n.chainId}>{n.name}</Option>
                    ))}
                   </Select>}
                {<Button onClick={injectedProvider?logoutOfWeb3Modal:loadWeb3Modal}>{injectedProvider?<i class="nes-icon close is-small"></i>:"+"}</Button>}
              </Space>
              </Col>
          </Row>
  );
}

export default WalletHeader;
