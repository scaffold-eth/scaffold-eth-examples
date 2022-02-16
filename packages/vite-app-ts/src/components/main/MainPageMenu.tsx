import { Menu } from 'antd';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export interface IMainPageMenuProps {
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
}

export const MainPageMenu: FC<IMainPageMenuProps> = (props) => (
  <Menu
    style={{
      textAlign: 'center',
    }}
    selectedKeys={[props.route]}
    mode="horizontal">
    <Menu.Item key="/lend">
      <Link
        onClick={(): void => {
          props.setRoute('/lend');
        }}
        to="/lend">
        Lend
      </Link>
    </Menu.Item>
    <Menu.Item key="/borrow">
      <Link
        onClick={(): void => {
          props.setRoute('/borrow');
        }}
        to="/borrow">
        Borrow
      </Link>
    </Menu.Item>
    <Menu.Item key="/my-loans">
      <Link
        onClick={(): void => {
          props.setRoute('/my-loans');
        }}
        to="/my-loans">
        My Loans
      </Link>
    </Menu.Item>
    <Menu.Item key="/debug">
      <Link
        onClick={(): void => {
          props.setRoute('/debug');
        }}
        to="/debug">
        Debug: mint
      </Link>
    </Menu.Item>
    <Menu.Item key="/denft">
      <Link
        onClick={(): void => {
          props.setRoute('/denft');
        }}
        to="/denft">
        Debug: DeNFT
      </Link>
    </Menu.Item>
    <Menu.Item key="/price-oracle-nft">
      <Link
        onClick={(): void => {
          props.setRoute('/price-oracle-nft');
        }}
        to="/price-oracle-nft">
        Debug: Price Oracle NFT
      </Link>
    </Menu.Item>
    <Menu.Item key="/mock-token">
      <Link
        onClick={(): void => {
          props.setRoute('/mock-token');
        }}
        to="/mock-token">
        Debug: MockERC20
      </Link>
    </Menu.Item>
  </Menu>
);
