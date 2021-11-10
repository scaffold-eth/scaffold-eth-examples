import { useMemo } from "react";
import { Web3Provider } from "@ethersproject/providers";
import BurnerProvider from "burner-provider";
import { INFURA_ID } from "../constants";

const useUserProvider = (injectedProvider, localProvider) =>
useMemo(() => {
  if (injectedProvider) {
    console.log("🦊 Using injected provider");
    return injectedProvider;
  }
  if (!localProvider) return undefined;

  let burnerConfig = {}

  if(window.location.pathname){
    console.log("PATH",window.location.pathname,window.location.pathname.length,window.location.hash)
    if(window.location.pathname.indexOf("/pk")>=0){
      let incomingPK = window.location.hash.replace("#","")
      let rawPK
      if(incomingPK.length==64||incomingPK.length==66){
        console.log("raw pk ",incomingPK)
        rawPK=incomingPK
        burnerConfig.privateKey = rawPK
        window.history.pushState({},"", "/");
      }
    }
  }

  console.log("🔥 Using burner provider",burnerConfig);
  if (localProvider.connection && localProvider.connection.url) {
    burnerConfig.rpcUrl = localProvider.connection.url
    return new Web3Provider(new BurnerProvider(burnerConfig));
  }else{
    // eslint-disable-next-line no-underscore-dangle
    const networkName = localProvider._network && localProvider._network.name;
    burnerConfig.rpcUrl = `https://${networkName || "mainnet"}.infura.io/v3/${INFURA_ID}`
    return new Web3Provider(new BurnerProvider(burnerConfig));
  }
}, [injectedProvider, localProvider]);

export default useUserProvider;
