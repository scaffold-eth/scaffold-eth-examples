import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import BurnerProvider from 'burner-provider';
import { RelayProvider } from '@opengsn/gsn'

export default function GSN(provider) {

  const [metatxProvider, setMetatxProvider] = useState();

  const createMetatxProvider = () => {
    try{
      const relayHubAddress = require('../helpers/build/gsn/RelayHub.json').address
      const stakeManagerAddress = require('../helpers/build/gsn/StakeManager.json').address
      const paymasterAddress = require('../helpers/build/gsn/Paymaster.json').address
      const gsnConfig = {
        relayHubAddress,
        stakeManagerAddress,
        paymasterAddress
      }
      const gsnProvider = new RelayProvider(new BurnerProvider(provider.connection.url), gsnConfig)
      setMetatxProvider(new ethers.providers.Web3Provider(gsnProvider))
    }catch(e){console.log(e)}
  }
  useEffect(createMetatxProvider, [provider]);

  return metatxProvider;
}
