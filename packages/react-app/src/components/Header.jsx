import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/">
      <PageHeader
        title={
          <div>
            <img src="./rocket_2.svg" style={{ maxWidth: 48, marginRight: 8 }} />
            MoonshotCollective.space
            <span style={{ marginLeft: 16, fontSize: 14 }}>
              <a href="https://gov.gitcoin.co/t/workstream-suggestion-public-goods-prototyping/130" target="_blank">
                Announcement
              </a>
            </span>
            <span style={{ marginLeft: 16, fontSize: 14 }}>
              <a href="https://gitcoin.co/grants/3004/moonshot-collective" target="_blank">
                Gitcoin Grant
              </a>
            </span>
            <span style={{ marginLeft: 16, fontSize: 14 }}>Trello (coming soon)</span>
          </div>
        }
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
