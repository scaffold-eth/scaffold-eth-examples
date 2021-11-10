import React from "react";
import { Link } from "react-router-dom";
import { Typography, Table, Descriptions, Card } from "antd";
const { Text, Title } = Typography;

function NetworkInformation({network, networks}) {

  let networkColumns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left'
  },
  {
    title: 'Color',
    dataIndex: 'color1',
    key: 'color1',
    render: text => <span style={{color:text}}>{text}</span>
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Blockexplorer',
    dataIndex: 'blockExplorer',
    key: 'blockExplorer',
    render: text => <a>{text}</a>,
    ellipsis: true,
  },
  {
    title: 'Node URL',
    dataIndex: 'url',
    key: 'url',
    ellipsis: true
  }]

  return (
              <Card style={{ margin: 'auto', maxWidth: "100%"}}>
                <Table
                title={() => <Title level={4}>Network information</Title>}
                rowKey="name"
                dataSource={Object.values(networks)}
                columns={networkColumns}
                pagination={false}
                scroll={{ x: 'max-content' }}
                expandable={{
                  expandedRowRender: record => <Descriptions>{
                    record.erc20s.map(
                      (r)=>
                        <Descriptions.Item label={r.name}>
                          {<a href={record.blockExplorer+"address/"+r.address} target="_blank"><p>{r.address}</p></a>}
                        </Descriptions.Item>
                      )
                    }</Descriptions>,
                  rowExpandable: record => record.erc20s,
                }}
                />
              </Card>
  );
}

export default NetworkInformation;
