import { BigNumber } from 'ethers';

export type TLoans = {
  loanId: BigNumber;
  loanPrincipalAmount: BigNumber;
  borrowedAmount: BigNumber;
  collateralRatio: number;
  loanStartTime: BigNumber;
  loanDuration: number;
  borrower: string;
  lender: string;
  nftCollateralParams: string;
};
