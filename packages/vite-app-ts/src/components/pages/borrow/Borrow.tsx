import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Address } from 'eth-components/ant';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useContractReader, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumber, utils } from 'ethers';
import { FC, useContext, useEffect, useState } from 'react';
import { useNFTBalances } from 'react-moralis';

import { useAppContracts } from '~~/config/contractContext';

interface Loan {
  id: number | undefined;
  duration?: number;
  collateralRatio?: number;
  lender?: string;
  amount?: BigNumber;
}

interface MoonshotBot {
  id: BigNumber;
  name: string;
  description: string;
  image: string;
}

export interface IBorrowProps {
  mainnetProvider: StaticJsonRpcProvider | undefined;
}

export const Borrow: FC<IBorrowProps> = (props) => {
  const { mainnetProvider } = props;
  const { getNFTBalances, data, error, isLoading, isFetching } = useNFTBalances();
  const ethersContext = useEthersContext();
  const deNFT = useAppContracts('DeNFT', ethersContext.chainId);
  const moonshotNft = useAppContracts('MockNFTContract', ethersContext.chainId);

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [numberOfLoans] = useContractReader(deNFT, deNFT?.totalNumLoans);
  // TODO: loans should be filtered to only show in the ones that don't have a borrower yet
  const [loans, setLoans] = useState<Loan[]>([]);
  useEffect(() => {
    const getLoans = async (): Promise<void> => {
      const loans: Loan[] = [];
      const myLoans: any[] = [];
      if (!numberOfLoans) return;
      for (let i = 0; i < numberOfLoans.toNumber(); i++) {
        const loan = await deNFT?.loanIdToLoan(i);
        if (!loan) continue;

        const [loanId, loanPrincipalAmount, collateralRatio, borrower] = loan;
        console.log('loan', loan);
        loans.push({
          id: loanId.toNumber(),
          amount: loanPrincipalAmount,
          collateralRatio: collateralRatio.toNumber(),
          lender: loan.lender,
        });
      }
      setLoans(loans);
    };
    // ugghh linter
    getLoans().then(
      () => {},
      () => {}
    );
  }, [numberOfLoans]);

  useEffect(() => {
    getNFTBalances({ params: { address: ethersContext.account ?? '', chain: 'mumbai' } }).then(
      () => {},
      () => {}
    );
  }, [ethersContext.account]);

  const [moonShotBots, setMoonShotBots] = useState<MoonshotBot[]>([]);
  const [balance] = useContractReader(moonshotNft, moonshotNft?.balanceOf, [ethersContext.account ?? '']);
  useEffect(() => {
    const getMoonShotBots = async (): Promise<void> => {
      const bots: MoonshotBot[] = [];
      if (!balance) return;
      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await moonshotNft?.tokenOfOwnerByIndex(ethersContext.account ?? '', i);
        if (!tokenId) continue;
        console.log('token id', tokenId);
        const uri = await moonshotNft?.tokenURI(tokenId);
        if (!uri) continue;
        const res = await fetch(uri);
        const json = await res.json();
        console.log(json);
        bots.push({
          id: tokenId,
          name: json.name,
          image: json.image,
          description: json.description,
        });
      }
      setMoonShotBots(bots);
    };
    getMoonShotBots().then(
      () => {},
      () => {}
    );
  }, [balance]);

  useEffect(() => {});
  return (
    <>
      <div className="container mx-auto">
        <h2>Avialable Loans</h2>
        <div className="my-4 shadow-md card card-bordered">
          {loans?.map((loan) => (
            <div key={loan.id} className="flex items-center justify-around m-1">
              <div>id: {loan.id}</div>
              <div>Amount: {utils.formatEther(loan.amount ?? '')}</div>
              <div className="flex items-center">
                Lender: <Address address={loan.lender} ensProvider={mainnetProvider} fontSize={16} />
              </div>
              <div className="badge badge-accent">Choose an NFT</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 grid-cols-3">
          {moonShotBots?.map((nft, i) => (
            <div key={i}>
              <div className="shadow-md card card-bordered">
                <figure>
                  <img src={nft.image} />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{nft.name}</h2>
                  <p className="overflow-y-auto max-h-20 text-clip ...">{nft.description}</p>
                  <div className="justify-end card-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={async (): Promise<void> => {
                        await tx?.(moonshotNft?.approve(deNFT?.address ?? '', nft.id));
                        await tx?.(deNFT?.borrow(0, nft.id, moonshotNft?.address ?? '', loans[0].amount ?? ''));
                      }}>
                      Borrow
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* commented out for demo purposes /*}
        {/* <div className="grid gap-4 grid-flow-col auto-cols-4">
          {data?.result?.map((nft) => (
            <div key={nft.token_id}>
              <div className="shadow-md card card-bordered">
                <figure>
                  <img src={nft.metadata.image} />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{nft.name}</h2>
                  <p className="overflow-y-auto max-h-20 text-clip ...">{nft.metadata.description}</p>
                  <div className="justify-end card-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={async (): Promise<void> => {
                        const result = await tx?.(
                          deNFT?.borrow(0, nft.token_id, nft.token_address, utils.parseEther('1'))
                        );
                        console.log(result);
                      }}>
                      Borrow
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </>
  );
};
