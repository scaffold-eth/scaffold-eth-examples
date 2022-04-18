export const invalidSignerForTargetNetwork = (signer, targetNetwork) => {
  return !signer || signer?.provider?._network?.chainId !== targetNetwork.chainId;
};
