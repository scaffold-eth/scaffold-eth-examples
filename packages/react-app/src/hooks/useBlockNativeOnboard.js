import { useState, useMemo } from "react";
import Onboard from "bnc-onboard";
import { ethers } from "ethers";

export default function UseBlockNativeOnboard(apiKey, networkId) {
  const [injectedProvider, setInjectedProvider] = useState();

  const onboard = useMemo(() => {
    if (!apiKey) {
      return null;
    }

    return Onboard({
      dappId: apiKey,
      networkId,
      subscriptions: {
        wallet: wallet => {
          if (!wallet.provider) {
            return null;
          }

          setInjectedProvider(new ethers.providers.Web3Provider(wallet.provider));

          window.localStorage.setItem("selectedWallet", wallet.name);
        },
      },
    });
  }, [apiKey, networkId]);

  return [onboard, injectedProvider];
}
