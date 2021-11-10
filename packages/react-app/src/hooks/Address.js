import React, { useState, useEffect } from "react";

export default function useAddress(signer) {

  const [address, setAddress] = useState('')

  useEffect(() => {
    const getAddress = async (signer) => {
      if(signer) {
      let _address = await signer.getAddress()
      setAddress(_address)
    }
    }
    getAddress(signer)

  }, [signer])

  return address
}
