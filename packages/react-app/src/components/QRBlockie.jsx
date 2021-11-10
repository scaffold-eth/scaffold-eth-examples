import React, { useState, useEffect } from "react";
import QR from 'qrcode.react';
import { Blockie, Balance } from "."
import { Typography } from 'antd';
const { Text } = Typography;


export default function QRBlockie(props) {

  const size = useWindowSize();
  const minSize = 360
  let qrWidth
  if(size.width / 3 < minSize) {
    qrWidth = minSize
  } else {
    qrWidth = size.width / 3
  }

  let scale = Math.min(size.height-130,size.width,1024)/(qrWidth*1)

  let offset =  0.42

  const url  = window.location.href+""

  return (
    <div style={{margin:"auto", position:"relative"}}>

      <QR level={"M"} includeMargin={false} value={props.address?props.address:""} size={qrWidth} imageSettings={{width:qrWidth/5,height:qrWidth/5,excavate:true}}/>
      <div style={{margin:"auto", position:"absolute", width:"100%", top:qrWidth/2-40}}>
        <Blockie address={props.address} scale={10}/>
      </div>
    </div>
  );
}


function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}
