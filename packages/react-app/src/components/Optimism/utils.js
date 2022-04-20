export const invalidSignerForTargetNetwork = (crossChainMessenger, targetNetwork) => {
  if (!crossChainMessenger) {
    return true;
  }

  if (targetNetwork.chainId === 42) {
    try {
      crossChainMessenger.l1Signer;
    } catch (e) {
      return true;
    }
  }

  if (targetNetwork.chainId === 69) {
    try {
      crossChainMessenger.l2Signer;
    } catch (e) {
      return true;
    }
  }

  return false;
};

export const ethL2Token = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000";
