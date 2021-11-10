import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header( props ) {
  return (

      <PageHeader
        title={(
          <a href="/">
            <img src={"./GTGS21_white_v1.png"} style={{maxWidth:"16vw",maxHeight:60}} />
          </a>
        )}
        subTitle=""
        style={{ cursor: "pointer",fontSize:32,fontFamily:'"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        extra={props.extra}
      />

  );
}
