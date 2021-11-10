# 🧾 scaffold-eth - Minimal Viable Payment Channel

> Discover how you can create a payment channel and send micropayments with signatures

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

We will show you how a Minimal Viable Payment Channel can be built and also will demonstrate how you can spin it up locally as a playground.
We take the case of a student and teacher/mentor just to simpilify things, so basically if a student is facing a issue related to code so he can consult a teacher for a time period and create a payment channel and steam eth in the form of micro payments throught the session by just sending in signatures and the teacher can at any time within the session withdraw and close it.

## Speed Run
[![ethdenvervideo](https://user-images.githubusercontent.com/28860442/121821835-6167a600-ccbd-11eb-8171-a0da0635827a.png)](https://youtu.be/hZDbrIICBQI)

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

6. Start the backend server which is responsible for storing signatures
```bash
yarn backend
```

## Smart contracts

Let's navigate to `packages/hardhat/contracts` folder and check out what contracts we have there.

We are mostly interested in `MVPC.sol` smart contract which contains all the logic for NFT auction.

### MVPC.sol

So basically there are 3 main functions:

- ```function open(address signer, address payable destination, uint256 timeout) public payable``` responsible for opening the channel and setting a session/channel id by encoding the parameters passed in this function

- ```function close(bytes32 id, uint256 value, bytes memory signature, bytes memory receiverSignature) public``` responsible for closing the stream to be calld by the receiver of the stream

- ```function withdraw(bytes32 optionalId) public``` responsible for getting the left over stake back to the channel creator incase the receiver does not close the stream



## Practice

Firstly, let's get us some funds using local faucet.

<img width="1654" alt="open" src="https://user-images.githubusercontent.com/26670962/121770624-f799b000-cb87-11eb-9eaf-060b2941cb5d.png">

open a payment channel and you can also see the previous payment channels created

<img width="1667" alt="per min" src="https://user-images.githubusercontent.com/26670962/121770659-37609780-cb88-11eb-999d-fa5edbd1d488.png">

after clicking on channel detail button set the eth stream / minute amount

<img width="1652" alt="teacher" src="https://user-images.githubusercontent.com/26670962/121770694-7abb0600-cb88-11eb-95ed-181289760f64.png">

the receiver in this case a teacher can view the payment channel details and can claim and close it any time till the session does not expire

<img width="1642" alt="close" src="https://user-images.githubusercontent.com/26670962/121770742-cb326380-cb88-11eb-88db-10d12569821c.png">

the channel creator can close and withdraw the stream funds too espcially when the receiver does not close the channel



## Contact

Join the [telegram support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!
