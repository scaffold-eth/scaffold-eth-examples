import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useContractReader, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumberish, utils } from 'ethers';
import { FC, useContext, useEffect, useState } from 'react';

import { useAppContracts } from '~~/config/contractContext';

export const MyLoans: FC = (props) => {
  const ethersContext = useEthersContext();
  const deNFT = useAppContracts('DeNFT', ethersContext.chainId);

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [numberOfLoans] = useContractReader(deNFT, deNFT?.totalNumLoans);
  const [myLoans, setMyLoans] = useState<any[]>([]);
  useEffect(() => {
    const getLoans = async (): Promise<void> => {
      const myLoans: any[] = [];
      if (!numberOfLoans) return;
      for (let i = 0; i < numberOfLoans.toNumber(); i++) {
        const loan = await deNFT?.loanIdToLoan(i);
        if (!loan) continue;

        if (loan.borrower === ethersContext.account) {
          console.log('my loan', loan);
          myLoans.push(loan);
        }
      }
      setMyLoans(myLoans);
    };
    getLoans().then(
      () => {},
      () => {}
    );
  }, [numberOfLoans, ethersContext.account]);

  return (
    <>
      <h2>My Loans</h2>
      <div className="my-4 shadow-md card card-bordered">
        {myLoans?.map((loan, i) => (
          <div key={i} className="flex items-center justify-around m-1">
            <div>id: {loan.loanId.toNumber()}</div>
            <div>Duration: {loan.loanDuration} seconds</div>
            <div>Amount owed: {utils.formatEther(loan.borrowedAmount as BigNumberish)}</div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={async (): Promise<void> => {
                await tx?.(deNFT?.repay(loan.loanId as BigNumberish));
              }}>
              Repay
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
