import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header( props ) {
  return (

      <PageHeader
        title={(
          <a href="https://radwallet.io">
            {window.innerWidth<600?"🌱":"🌱  radwallet.io"}
          </a>
        )}
        subTitle=""
        style={{ cursor: "pointer",fontSize:32 }}
        extra={props.extra}
      />

  );
}
