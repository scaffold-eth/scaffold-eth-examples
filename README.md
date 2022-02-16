# DefiNFT

# Project
DefiNFT: NFT based lending / borrowing + veNFT

## TDLR
We use NFT as collateral to allow lending and borrowing.  


## Details
### Lender

A lender can lend dai with some parameters (collaterization ratio, lenght of time for loan).  

### Borrower 

A borrower can borrow based on floor price of their NFT Collection.  


### Loan process

if the borrower returns the loan in time, 
- borrower gets his NFT back
- lender gets ERC-20 rewards

if the time passes, 
- the lender can claim the NFT and any rewards from deposit obtained



## Quick Start

Running the app

1. install your dependencies

   ```bash
   yarn install
   ```

2. start a hardhat node

   ```bash
   yarn chain
   ```

3. run the app, `open a new command prompt`

   ```bash
   # build hardhat & external contracts types
   yarn contracts:build 
   # deploy your hardhat contracts
   yarn deploy
   # start vite 
   yarn start 
   ```

4. The directories that you'll use are:

   ```bash
   packages/vite-app-ts/
   packages/hardhat-ts/
   ```
