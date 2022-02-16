import { parseEther } from '@ethersproject/units';
import { Button } from 'antd';
import { useEthersContext } from 'eth-hooks/context';
import { FC } from 'react';

import { useAppContracts } from '~~/config/contractContext';

export const Check: FC = (props) => {
  const ethersContext = useEthersContext();
  const deNFT = useAppContracts('DeNFT', ethersContext.chainId);

  console.log('veNFT', deNFT);

  const increaseAllowance = async (): Promise<void> => {
    await deNFT?.increaseAllowance('0xc035ea520cf981368ac9d9f585b150cecf9e2dfb', parseEther('1'));
  };

  return (
    <>
      <Button onClick={increaseAllowance}>Increase allowance</Button>
    </>
  );
};
