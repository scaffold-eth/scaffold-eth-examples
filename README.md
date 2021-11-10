# 💎 scaffold-eth - Diamond Starter Kit

> Discover how you can get started with [Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535)

<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#smart-contracts">Exploring smart contracts</a></li>
    <li><a href="#practice">Practice</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

This branch is entitled to showcase how you can get started integrating/using [Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535) in terms of upgradability and interaction with facets of a diamond, so before diving in I would recommend you to read the EIP.

## Speed Run
[![](http://img.youtube.com/vi/AvJ7vceKGoY/0.jpg)](https://youtu.be/AvJ7vceKGoY)


## Getting Started


### Installation

Let's start our environment for tinkering and exploring how NFT auction would work.

1. Clone the repo first
```sh
git clone -b payment-channel https://github.com/austintgriffith/scaffold-eth.git payment-channel
cd payment-channel
```

2. Install dependencies
```bash
yarn install
```
3. Start local chain
```bash
yarn chain
```

4. Start your React frontend
```bash
yarn start
```

5. Deploy your smart contracts to a local blockchain
```bash
yarn deploy
```

## Smart contracts

Let's navigate to `packages/hardhat/contracts` folder and check out what contracts we have there.

The [facets folder](https://github.com/austintgriffith/scaffold-eth/tree/diamond-starter-kit/packages/hardhat/contracts/facets) has test the facets of the diamond including the [Diamond Cut Facet](https://github.com/austintgriffith/scaffold-eth/blob/diamond-starter-kit/packages/hardhat/contracts/DiamondCutFacet.sol) and [Diamond Loupe Facet](https://github.com/austintgriffith/scaffold-eth/blob/diamond-starter-kit/packages/hardhat/contracts/DiamondLoupeFacet.sol) and we are mostly interested in these along with the diamond contract.

#### Diamond Cut Facet
Diamond Cut is mainly responsible for upgrading diamond, there is just 1 main function that we interact with:

- ```function diamondCut(FacetCut[] calldata _diamondCut, address _init, bytes calldata _calldata) external ``` responsible for upgrading diamond, _init and _calldata can be set as [zeroAddress](https://etherscan.io/address/0x0000000000000000000000000000000000000000) and '0x' , the FacetCut struct basically consists of the updated facet address(zeroAddress when you want to remove a selector), the action you want to perform diamond standard offers 3 basic actions (Add, Replace and Remove) and the array of selectors which are just function signatures that are being added/updated/removed.

#### Diamond Loupe Facet
Diamond Loupe is basically responsible for tracking all the facets and their selectors and so cosists of mainly read function, the one specifically used in the UI is:

- ```function facets() external override view returns (Facet[] memory facets_) ``` responsible for fetching all facets and it's selectors in the same call.

#### Diamond
The main contract that we will interact with for every transaction, the diamond contract uses diamond storage and hence acts as. a proxy in order to interact with facets,

- ```fallback() external payable ```  communicates with facets throught the fallback function, we just need to pass the encoded tx data while interacting with facets.


##### NOTE
- Upgradability only works for facets which were initially deployed with the diamond if you are performing a delete operation
- Currently to decode the selector signature hash to string and displaying on UI we are using this [api](https://www.4byte.directory/docs/) so there are cases where a particular selector's text signature isn't available hence isn't display on ui but the upgradability works fine
- For interacting with the diamond facets via the diamond contract please refer to this [branch](https://github.com/austintgriffith/scaffold-eth/tree/diamond-standard) for simplicity the 2 branches have been made separate.




## Practice

Firstly, get us some funds using local faucet.

<img width="1657" alt="action_new" src="https://user-images.githubusercontent.com/26670962/124736196-64f4f280-df34-11eb-9ba2-b3be48048d64.png">

Select the type of upgrade action you want to perform

<img width="1651" alt="rename" src="https://user-images.githubusercontent.com/26670962/124736377-91a90a00-df34-11eb-9277-7ac073e4ddc6.png">

Upload the updated abi of the facet contract you wish to upgrade, you can get the updated abi by running ```yarn compile``` after updating the contract in artifacts folder

<img width="1654" alt="upgrade_new" src="https://user-images.githubusercontent.com/26670962/124736422-9f5e8f80-df34-11eb-8974-bbf73b99c46d.png">

Deploy the new facet, in case of add or delete action specify the exact selector details as mentioned in the placeholder and clicking on upgrade will essentially upgrade the diamond!


## Contact

Join the [telegram support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!
