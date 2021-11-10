import React, { useRef } from "react";
import { Row, message } from "antd";
import { QRBlockie, Address } from "../components";

function Receive({address, mainnetProvider}) {

  const addressRef = useRef(null);

  function copyToClipboard(e) {
    addressRef.current.select();
    document.execCommand('copy');
    e.target.focus();
    console.log('Copied!');
    message.success({content: 'Copied to clipboard!'
    });
  };

  return (
              <>
              <QRBlockie address={address} />
              <Row align="middle" justify="center" gutter={[4, 4]} style={{width: "100%", maxWidth: "450px", margin: "auto"}}>
              <div class="nes-field is-inline">
                  <input type="text" id="message" class="nes-input" ref={addressRef} readOnly value={address} style={{fontSize:"28px"}}/>
                  <button type="button" class="nes-btn"  onClick={copyToClipboard} style={{fontSize:"28px"}}>Copy</button>
              </div>
              </Row>
              </>
  );
}

export default Receive;
