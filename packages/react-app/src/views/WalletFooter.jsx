import React from "react";
import { Link } from "react-router-dom";
import { SettingOutlined, WalletOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Menu, Affix, Typography } from "antd";

function WalletFooter({route, network, networks}) {

  return (
            <Menu mode="horizontal" style={{textAlign: "center", bottom: "0px"}}>
              <Menu.Item key="wallet" style={{fontSize: "60px", margin: 16, width:"25%", bottom: "0px"}}>
                <Link to="/wallet">
                  <Typography style={{color: networks[network]?networks[network].color1:"black"}}>$</Typography>
                </Link>
              </Menu.Item>
              <Menu.Item key="receive" style={{fontSize: "60px", margin: 16, width:"25%", bottom: "0px"}}>
                <Link to="/receive">
                  <Typography style={{color: networks[network]?networks[network].color1:"black"}}>↓</Typography>
                </Link>
              </Menu.Item>
              <Menu.Item key="settings" style={{fontSize: "60px", margin: 16, width:"25%", bottom: "0px"}}>
                <Link to="/settings">
                  <Typography style={{color: networks[network]?networks[network].color1:"black"}}>?</Typography>
                </Link>
              </Menu.Item>
            </Menu>
  );
}

export default WalletFooter;
