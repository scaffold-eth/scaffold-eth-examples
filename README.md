# Strategy Starter Kit

## How does it work for the User

Let's say Alice holds 100 DAI and wants to start earning yield % on them.

For this Alice needs to `DAI.approve(vault.address, 100)`.

Then Alice will call `Vault.deposit(100)`.

Vault will then transfer 100 DAI from Alice to itself, and mint Alice the corresponding shares.

Alice can then redeem those shares using `Vault.withdrawAll()` for the corresponding DAI balance (exchanged at `Vault.pricePerShare()`).

## Installation and Setup

1. [Install Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html) & [Ganache-CLI](https://github.com/trufflesuite/ganache-cli), if you haven't already.

2. Sign up for [Infura](https://infura.io/) and generate an API key. Store it in the `WEB3_INFURA_PROJECT_ID` environment variable.

```bash
export WEB3_INFURA_PROJECT_ID=YourProjectID
```

3. Sign up for [Etherscan](www.etherscan.io) and generate an API key. This is required for fetching source codes of the mainnet contracts we will be interacting with. Store the API key in the `ETHERSCAN_TOKEN` environment variable.

```bash
export ETHERSCAN_TOKEN=YourApiToken
```

- Optional Use .env file
  1. Make a copy of `.env.example`
  2. Add the values for `ETHERSCAN_TOKEN` and `WEB3_INFURA_PROJECT_ID`
     NOTE: If you set up a global environment variable, that will take precedence

4. Run
```bash
yarn install --lock-file
```

## Basic Use

To deploy the demo Yearn Strategy in a development environment:

1. Open the Brownie console. This automatically launches a forked mainnet.

```bash
$ brownie console --network hardhat
```

2. Create variables for the Yearn Vault and Want Token addresses. These were obtained from the Yearn Registry. We load them from a different repository found in the brownie-config.yml under dependencies (yearn/yearn-vaults@0.4.3):

```python
from pathlib import Path
yearnvaults = project.load(Path.home() / ".brownie" / "packages" / config["dependencies"][0]) #load the base vaults project to access the original Vault contract
Vault = yearnvaults.Vault
Token = yearnvaults.Token
vault = Vault.at("0xdA816459F1AB5631232FE5e97a05BBBb94970c95")
token = Token.at("0x6b175474e89094c44da98b954eedeac495271d0f")
gov = "ychad.eth"  # ENS for Yearn Governance Multisig
```

or you can get the contracts ABI from etherscan API, make sure you have exported your etherscan token.

```
from brownie import Contract
vault = Contract("0xdA816459F1AB5631232FE5e97a05BBBb94970c95")
token = Contract("0x6b175474e89094c44da98b954eedeac495271d0f")
gov = "ychad.eth"  # ENS for Yearn Governance Multisig
```

3. Deploy the [`Strategy.sol`](contracts/Strategy.sol) contract.

```python
>>> strategy = Strategy.deploy(vault, {"from": accounts[0]})
Transaction sent: 0xc8a35b3ecbbed196a344ed6b5c7ee6f50faf9b7eee836044d1c7ffe10093ef45
  Gas price: 0.0 gwei   Gas limit: 6721975
  Flashloan.constructor confirmed - Block: 9995378   Gas used: 796934 (11.86%)
  Flashloan deployed at: 0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87
```

4. Approve the strategy for the Vault. We must do this because we only approved Strategies can pull funding from the Vault.

```python
# 10% of the vault tokens will be allocated to the strategy

>>> vault.addStrategy(strategy, 1000, 0, 2 ** 256 - 1, 1_000, {"from": gov})
Transaction sent: 0xa70b90eb9a9899e8f6e709c53a436976315b4279c4b6797d0a293e169f94d5b4
  Gas price: 0.0 gwei   Gas limit: 6721975
  Transaction confirmed - Block: 9995379   Gas used: 21055 (0.31%)
```

If you are getting a revert error, it's most likley because the vault can't add more strategies, you can check the `vault.debtRatio()` the value should be under 10,000. You can try to lower one of the existing strategy debt ratio `vault.updateStrategyDebtRatio("0x1676055fE954EE6fc388F9096210E5EbE0A9070c", 0, {"from": gov})`

5. Now we are ready to put our strategy into action!

```python
>>> harvest_tx = strategy.harvest({"from": accounts[0]})  # perform as many time as desired...
```

## Implementing Strategy Logic

[`contracts/Strategy.sol`](contracts/Strategy.sol) is where you implement your own logic for your strategy. In particular:

- Create a descriptive name for your strategy via `Strategy.name()`.
- Invest your want tokens via `Strategy.adjustPosition()`.
- Take profits and report losses via `Strategy.prepareReturn()`.
- Unwind enough of your position to payback withdrawals via `Strategy.liquidatePosition()`.
- Unwind all of your positions via `Strategy.exitPosition()`.
- Fill in a way to estimate the total `want` tokens managed by the strategy via `Strategy.estimatedTotalAssets()`.
- Migrate all the positions managed by your strategy via `Strategy.prepareMigration()`.
- Make a list of all position tokens that should be protected against movements via `Strategy.protectedTokens()`.

## Testing

To run the tests:

```
brownie test
```

The example tests provided in this mix start by deploying and approving your [`Strategy.sol`](contracts/Strategy.sol) contract. This ensures that the loan executes succesfully without any custom logic. Once you have built your own logic, you should edit [`tests/test_flashloan.py`](tests/test_flashloan.py) and remove this initial funding logic.

See the [Brownie documentation](https://eth-brownie.readthedocs.io/en/stable/tests-pytest-intro.html) for more detailed information on testing your project.

## Debugging Failed Transactions

Use the `--interactive` flag to open a console immediatly after each failing test:

```
brownie test --interactive
```

Within the console, transaction data is available in the [`history`](https://eth-brownie.readthedocs.io/en/stable/api-network.html#txhistory) container:

```python
>>> history
[<Transaction '0x50f41e2a3c3f44e5d57ae294a8f872f7b97de0cb79b2a4f43cf9f2b6bac61fb4'>,
 <Transaction '0xb05a87885790b579982983e7079d811c1e269b2c678d99ecb0a3a5104a666138'>]
```

Examine the [`TransactionReceipt`](https://eth-brownie.readthedocs.io/en/stable/api-network.html#transactionreceipt) for the failed test to determine what went wrong. For example, to view a traceback:

```python
>>> tx = history[-1]
>>> tx.traceback()
```

To view a tree map of how the transaction executed:

```python
>>> tx.call_trace()
```

See the [Brownie documentation](https://eth-brownie.readthedocs.io/en/stable/core-transactions.html) for more detailed information on debugging failed transactions.

<!--
## Deployment

When you are finished testing and ready to deploy to the mainnet:

1. [Import a keystore](https://eth-brownie.readthedocs.io/en/stable/account-management.html#importing-from-a-private-key) into Brownie for the account you wish to deploy from.
2. Edit [`scripts/deployment.py`](scripts/deployment.py) and add your keystore ID according to the comments.
3. Run the deployment script on the mainnet using the following command:

```bash
$ brownie run deployment --network mainnet
```

You will be prompted to enter your keystore password, and then the contract will be deployed.
-->


# Resources

- Yearn [Discord channel](https://discord.com/invite/6PNv2nF/)
- Brownie [Gitter channel](https://gitter.im/eth-brownie/community)
