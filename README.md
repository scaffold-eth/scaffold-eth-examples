# 🍯🏗 scaffold-eth - Honeypot

> How you can catch hackers by putting a bait into your "vulnerable" smart contract 🤭

---

<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Exploring smart contracts</a></li>
    <li><a href="#usage">Why the attack fails?</a></li>
    <li><a href="#usage">Practice</a></li>
    <li><a href="#contributing">Additional resources</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

This little side quest will allow you to explore the concept of "honeypot". Honeypots are smart contracts designed to look like an easy target for hacking while in fact they are not. 

They look vulnerable to an unsophisticated attacker, but if he tries to “break it” he will lose his money instead.

## Getting Started

### Prerequisites

In order to understand how honeypots work, you should firstly understand what is a reentrancy attack. If you do not know what it is, please have a look at [this](https://github.com/austintgriffith/scaffold-eth/tree/reentrancy-example) and [this](https://solidity-by-example.org/hacks/re-entrancy/).

### Installation

Let's start our environment for tinkering and exploring how honeypots work.

1. Clone the repo first
```sh
git clone https://github.com/austintgriffith/scaffold-eth.git honeypot-example
cd honeypot-example
git checkout honeypot-example
```

2. Install dependencies
```bash
yarn install
```

3. Start your React frontend
```bash
yarn start
```

4. Spin up your local blockchain using [Hardhat](https://hardhat.org/)
```bash
yarn chain
```

5. Deploy your smart contracts to a local blockchain
```bash
yarn deploy
```

<b>Pro Tip: </b> Use [tmux](https://linuxize.com/post/getting-started-with-tmux/) to easily start all commands in a single terminal window!

This is how it looks like in my terminal:

![image](./resources/tmux.png)

If everything worked fine, you have to have something like this opened in your browser:

![image](./resources/browser.png)

## Smart contracts

Let's navigate to `packages/hardhat/contracts` folder and check out what contracts we have there.

### Bank.sol

This smart contract will be deployed as a bait for a hacker. 

Try to read the source code of this contract and if you are familiar with a reentrancy attack, you probably should note that this contract is indeed vulnerable.

```solidity
function withdraw(uint _amount) public {
    require(_amount <= balances[msg.sender], "Insufficient funds");

    (bool sent, ) = msg.sender.call{value: _amount}("");
    require(sent, "Failed to send Ether");

    balances[msg.sender] -= _amount;

    honeyPot.log(msg.sender, _amount, "Withdraw");
}
```

In a `withdraw` method, the bank smart contract firstly sends funds to the user and only after that deducts this `amount` from `balances` mapping. 

This is exactly the reason for possibility to exploit reentrancy.

However, we have another interesting line at the end of the smart contract:

```solidity
honeyPot.log(msg.sender, _amount, "Withdraw");
```

Just keep that in mind. We will return to it in a second.


### Honeypot.sol

Let's now investigate our main smart contract there. This one will catch our hacker and reveal its address!

```solidity
function log(address _caller, uint _amount, string memory _action) public {
    if (equal(_action, "Withdraw")) {
      revert("It's a trap");
    }
}
```

The method that interests us the most is called `log`. It simply compares our `_action` to a value and if it is equal to "Withdraw", we revert our entire operation.

Why we use `revert` there? If you do know yet, all operations on Ethereum are **atomic**. It means that if at some moment some operation on chains of operations fails, the entire transaction is reverted and nothing changes on the blockchain. 

Suppose that contract A calls contract B, and contract B calls contract C. Even if functions executed in contract A and B somehow mutated the state of blockchain, they will not be applied until we are sure that contract C function is executed correctly and there are no errors.

This is exactly the trick we are going to use to fool a hacker.

### Attack.sol

This contract is a typical exploitation contract for a reentrancy attack. It contains `fallback` function that causes "vulnerable" contract to send us funds again and again..

```solidity
fallback() external payable {
    if (address(bank).balance >= target) {
      bank.withdraw(target);
    }
}
```

Once we withdraw money from a bank, our fallback will be called again because bank will send us some funds. This recursive nature will force bank to give us all its money... Or maybe not? 👹

## Why the attack fails?

So you remember that our Bank has some unusual function call in the end of a `withdraw` method.

```solidity
honeyPot.log(msg.sender, _amount, "Withdraw");
```

So how does it help us to prevent the attack? 

Suppose that our Bank has `0.03` ETH locked in it. I am an evil hacker that wants to hack it. I deploy my `Attack.sol` contract and call my `attack` function along with `0.01` ETH sent with it. 

We force bank to execute its withdraw again and again. However, at some point balance of the bank becomes less than `0.01 ETH` and reentrancy comes to an end.

After that, the following lines are executed:

```solidity
balances[msg.sender] -= _amount;

honeyPot.log(msg.sender, _amount, "Withdraw");
```

Hacker is almost successful but `log` function reverts the entire chain of operations and no money was stolen! However, we now know the address of a hacker 😎

## Practice

Let's use our awesome frontend provided by `scaffold-eth` to make sure our assumption works fine. 

Run two different sessions. One will be for a simple user and one will be for an evil hacker.

**Pro tip**: Instead of opening anonymous window in a browser, you can use [containers](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/) provided by Firefox to have two separate sessions in a single browser window.

This is how it looks like for me:

![image](./resources/container.png)

My first tab is for a simple user and second tab is for a hacker.

Let's send some funds to a bank as a simple user using `deposit` function.

![img](./resources/send-0.04.png)

Our bank now has 0.04 ETH locked in it. Let's now try to steal it as a hacker. Navigate to a second tab and enter the `Attack` mode.

![img](./resources/attack-mode.png)

Now let's execute `attack` function and send `0.01` ETH along with our function call. 

However, after we do it, we get an error saying that we `Failed to send the Ether`.

![img](./resources/failed-attack.png)

Now let's get rid of this `log` line in our `Bank.sol` to make sure that without it the attack works just fine. 

```solidity
honeyPot.log(msg.sender, _amount, "Withdraw");
```

Save your new contract and `yarn deploy` it again.

Let's now again deposit 0.03 ETH into a bank and try to attack from an attacker perspective by just sending `0.01` ETH. 

![img](./resources/success-attack.png)

In this case, we are able to steal all the money from a bank! This indeed proves that our `log` function from a `Honeypot` contract saves us from being hacked.

## Additonal resources

Honeypot is a concept that is used in a wild quite often. Here are some resources to learn more about this technique.

* [Video from Smart Contract Programmer](https://www.youtube.com/watch?v=d0q5zVnNLWs)
* [Talk by Scott Bigelow](https://www.youtube.com/watch?v=DDn5mksOUCc)

## Contact

Join the [telegram support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!