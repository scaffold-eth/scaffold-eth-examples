import { List } from "antd";
import { useEventListener } from "eth-hooks/events/useEventListener";

/*
  ~ What it does? ~

  Displays a lists of events

  ~ How can I use? ~

  <Events
    contracts={readContracts}
    contractName="YourContract"
    eventName="SetPurpose"
    localProvider={localProvider}
    mainnetProvider={mainnetProvider}
    startBlock={1}
  />
*/

export default function Events({ contracts, contractName, eventName, localProvider, mainnetProvider, startBlock }) {
  // 📟 Listen for broadcast events
  const events = useEventListener(contracts, contractName, eventName, localProvider, startBlock);
  console.log("Roll events: ", events);

  return (
    <div style={{ width: "100%", margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h2>Events:</h2>
      <List
        bordered
        dataSource={events}
        renderItem={item => {
          debugger;
          return (
            <List.Item
              key={item.blockNumber}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
            >
              <div>{`Block::${item.blockNumber}`}</div>
              <div>{`Roll: [${item.args[0]}, ${item.args[1]}, ${item.args[2]}, ${item.args[3]}, ${item.args[4]}, ${item.args[5]}]`}</div>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
