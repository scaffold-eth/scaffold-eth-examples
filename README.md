# 🏗 scaffold-eth gets optimistic

> [optimism](https://optimism.io/) proof-of-concept

# This branch is a work-in-progress! [read the Medium](https://azfuller20.medium.com/optimism-scaffold-eth-draft-b76d3e6849e8)

---

## quickstart

```bash
git clone -b oo-ee https://github.com/austintgriffith/scaffold-eth.git optimistic-scaffold

cd optimistic-scaffold
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

__This requires Docker__
Initiate the Optimism submodules...
```bash
cd scaffold-eth/docker/optimism-integration
git submodule init
git submodule update
```
Kick off the local chain, l2 & relay infrastructure (it kind of feels like a space-ship taking off)
```bash
cd scaffold-eth/docker/optimism-integration
make up
```

> in a third terminal window, generate a local account:

```bash
cd scaffold-eth
yarn generate
```
Send that account some ETH using the faucet from http://localhost:3000/ to fund the deployments

> when the local nodes are up and running, deploy local contracts & attempt to go from L1 -> L2 and back again!
```
yarn deploy-oe
```

This deploys an amended `YourContract.sol` and a suite of L1<->L2 erc20 contracts

__Kudos & thanks to the Optimistic Ethereum team whose [erc20 example](https://github.com/ethereum-optimism/optimism-tutorial/tree/deposit-withdrawal) this benefited from!__

### frontend
There are three tabs:
- ETH bridging to Optimistic Eth (send yourself some L1 ETH with the faucet!)
- YourContract on L2
- OldEnglish ERC20 & Bridge contracts (make sure you approve the Gateway to bridge!)

## Notes
- Is OE eompatible with hardhat config accounts? I had to instantiate in my deploy script
- Get a silent failure on L2 if I don't reset the nonces in Metamask
- Using OpenZeppelin contracts that import their Address.sol break:
```OVM Compiler Error (silence by adding: "// @unsupported: ovm" to the top of this file):
 @openzeppelin/contracts/utils/Address.sol:115:17: ParserError: OVM: SELFBALANCE is not implemented in the OVM. (We have no native ETH -- use deposited WETH instead!)
        require(address(this).balance >= value, "Address: insufficient balance for call");
```
- Get a failure on OZ Safemint (https://docs.openzeppelin.com/contracts/3.x/api/token/erc721#ERC721-_safeMint-address-uint256-bytes-)
- Avoiding silent failures - the initial tx response doesn't give you an indication as to whether a transaction has succeeded or failed, you need to add:
```
await result.wait()
```
Which will then throw an error. This is different to the EVM, where the initial await transactionResponse will throw.
- Including a {value: amount} field in ovm .sol doesn't seem to throw?
