/* eslint no-use-before-define: "warn" */
const { deploy } = require('./utils')
const { Watcher } = require('@eth-optimism/watcher')
const {  JsonRpcProvider } = require("@ethersproject/providers");
const { utils } = require("ethers");
const fs = require("fs");

const main = async () => {

  let demo = true

  console.log(`\n\n 📡 Deploying on ${process.env.HARDHAT_NETWORK || config.defaultNetwork}\n`);

  let deployConfig = {
    localhost: {
      l1RpcUrl: 'http://localhost:9545',
      l2RpcUrl: 'http://localhost:8545',
      l1MessengerAddress: '0x6418E5Da52A3d7543d393ADD3Fa98B0795d27736'
    },
    kovan: {
      l1RpcUrl: 'https://kovan.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad',
      l2RpcUrl: 'https://kovan.optimism.io',
      l1MessengerAddress: '0xb89065D5eB05Cac554FDB11fC764C679b4202322'
    }
  }

  let selectedNetwork = deployConfig[process.env.HARDHAT_NETWORK || config.defaultNetwork]

  const l1MessengerAddress = selectedNetwork.l1MessengerAddress // kovan: 0xb89065D5eB05Cac554FDB11fC764C679b4202322 // local: 0x6418E5Da52A3d7543d393ADD3Fa98B0795d27736
  const l2MessengerAddress = '0x4200000000000000000000000000000000000007'

  const decimals = 18
  let name = "OldEnglish"
  let symbol = "OE"
  const initialSupply = "100000000000000000000"

  const mnemonic = fs.readFileSync("./mnemonic.txt").toString().trim()
  const deployWallet = new ethers.Wallet.fromMnemonic(mnemonic)//, optimisticProvider)

  const yourContractL2 = await deploy({contractName: "YourContract", rpcUrl: selectedNetwork.l2RpcUrl, ovm: true})

  const L1_ERC20 = await deploy({contractName: "ERC20", rpcUrl: selectedNetwork.l1RpcUrl, ovm: false, _args: [initialSupply, symbol, decimals]})
  const OVM_L2DepositedERC20 = await deploy({contractName: "L2DepositedERC20", rpcUrl: selectedNetwork.l2RpcUrl, ovm: true, _args: [l2MessengerAddress, name, symbol]})

  const OVM_L1ERC20Gateway = await deploy({contractName: "L1ERC20Gateway", rpcUrl: selectedNetwork.l1RpcUrl, ovm: false, _args: [L1_ERC20.address, OVM_L2DepositedERC20.address, l1MessengerAddress]})

  const init = await OVM_L2DepositedERC20.init(OVM_L1ERC20Gateway.address)
  console.log(' L2 initialised: ',init.hash)

  name = "Optimistico Punks"
  symbol = "OP"


// L1 ERC721
  const ERC721 = await deploy({contractName: "TestERC721", rpcUrl: selectedNetwork.l1RpcUrl, ovm: false, _args: [name, symbol]})
  const OVM_DepositedERC721 = await deploy({contractName: "DepositedERC721", rpcUrl: selectedNetwork.l2RpcUrl, ovm: true, _args: [l2MessengerAddress, name, symbol]})
  const OVM_ERC721Gateway = await deploy({contractName: "ERC721Gateway", rpcUrl: selectedNetwork.l1RpcUrl, ovm: false, _args: [ERC721.address, OVM_DepositedERC721.address, l1MessengerAddress]})
  const initERC721 = await OVM_DepositedERC721.init(OVM_ERC721Gateway.address)
  console.log(initERC721)


/*
// L2 ERC721
  const ERC721 = await deploy({contractName: "TestERC721", rpcUrl: selectedNetwork.l2RpcUrl, ovm: true, _args: [name, symbol]})
  const OVM_DepositedERC721 = await deploy({contractName: "DepositedERC721", rpcUrl: selectedNetwork.l1RpcUrl, ovm: false, _args: [l1MessengerAddress, name, symbol]})
  const OVM_ERC721Gateway = await deploy({contractName: "ERC721Gateway", rpcUrl: selectedNetwork.l2RpcUrl, ovm: true, _args: [ERC721.address, OVM_DepositedERC721.address, l2MessengerAddress]})
  const initERC721 = await OVM_DepositedERC721.init(OVM_ERC721Gateway.address)
  console.log(initERC721)
  */

  if(demo == true) {

    console.log('\n 👾Purpose demonstration')

    let newPurposeTx = await yourContractL2.setPurpose("Demonstration")
    await newPurposeTx.wait()

    let newPurpose = await yourContractL2.purpose()
    console.log(` New Purpose: ${newPurpose}`)

    console.log('\n 👾Bridge demonstration')

    const l1Provider = new JsonRpcProvider(selectedNetwork.l1RpcUrl)
    const l2Provider = new JsonRpcProvider(selectedNetwork.l2RpcUrl)

    const watcher = new Watcher({
      l1: {
        provider: l1Provider,
        messengerAddress: l1MessengerAddress
      },
      l2: {
        provider: l2Provider,
        messengerAddress: l2MessengerAddress
      }
    })

    const trackMessageTransmission = async (startingLayer, hash) => {
      if(startingLayer === 1) {
        const [msgHash] = await watcher.getMessageHashesFromL1Tx(hash)
        console.log(' got L1->L2 message hash', msgHash)
        const receipt = await watcher.getL2TransactionReceipt(msgHash)
        console.log(' completed! tx hash:', receipt.transactionHash)
      } else if (startingLayer === 2) {
        const [msgHash] = await watcher.getMessageHashesFromL2Tx(hash)
        console.log(' got L2->L1 message hash', msgHash)
        const receipt = await watcher.getL1TransactionReceipt(msgHash)
        console.log(' completed! L1 tx hash:', receipt.transactionHash)
      }
    }

    

    const logBalances = async (description = '') => {
      console.log('\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ' + description + ' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
      if(L1_ERC20) {
        const l1Balance = await L1_ERC20.balanceOf(deployWallet.address)
        console.log(' L1 balance of', deployWallet.address, 'is', l1Balance.toString())
      } else { console.log(' no L1_ERC20 configured') }
      if(OVM_L2DepositedERC20) {
        const l2Balance = await OVM_L2DepositedERC20.balanceOf(deployWallet.address)
        console.log(' L2 balance of', deployWallet.address, 'is', l2Balance.toString())
      } else { console.log(' no OVM_L2DepositedERC20 configured') }
      console.log(' ~'.repeat(description.length) + '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
    }

    // Approve
    console.log(' Approving L1 deposit contract...')
    let approveTx = await L1_ERC20.approve(OVM_L1ERC20Gateway.address, 100)
    console.log(' Approved: ' + approveTx.hash)
    await approveTx.wait()

    await logBalances()

    // Deposit
    console.log(' Depositing into L1 deposit contract...')
    let depositTx = await OVM_L1ERC20Gateway.deposit(100)
    console.log(' Deposited: ' + depositTx.hash)
    await depositTx.wait()

    await trackMessageTransmission(1, depositTx.hash)

    await logBalances()

    // Withdraw
    console.log(' Withdrawing from L1 deposit contract...')

    let withdrawalTx = await OVM_L2DepositedERC20.withdraw(100)
    await withdrawalTx.wait()
    console.log(' Withdrawal tx hash:' + withdrawalTx.hash)

    await logBalances()

    await trackMessageTransmission(2, withdrawalTx.hash)

    await logBalances()



    const logERC721Balances = async (description = '') => {
      console.log('\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ' + description + ' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
      if(ERC721) {
        const l1Balance = await ERC721.balanceOf(deployWallet.address)
        console.log(' L1 balance of', deployWallet.address, 'is', l1Balance.toString())
      } else { console.log(' no ERC721 configured') }
      if(OVM_DepositedERC721) {
        const l2Balance = await OVM_DepositedERC721.balanceOf(deployWallet.address)
        console.log(' L2 balance of', deployWallet.address, 'is', l2Balance.toString())
      } else { console.log(' no OVM_DepositedERC721 configured') }
      console.log(' ~'.repeat(description.length) + '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
    }

    // mint
    console.log(' Minting an ERC721...')
    const mintTx = await ERC721.mint(deployWallet.address, 1, 'dummy-token-uri')
    console.log(' Minted: ' + mintTx.hash)
    await mintTx.wait()

    /*
    // Approve
    console.log(' Approving deposit contract...')
    approveTx = await ERC721.approve(OVM_ERC721Gateway.address, 1)
    console.log(' Approved: ' + approveTx.hash)
    approveTx.wait()
    */

    await logERC721Balances()

    // Deposit
    console.log(' Depositing into deposit contract...')
    depositTx = await ERC721['safeTransferFrom(address,address,uint256)'](deployWallet.address, OVM_ERC721Gateway.address, 1, {
    gasLimit: 500000
})//await OVM_ERC721Gateway.deposit(1)
    console.log(' Deposited: ' + depositTx.hash)
    await depositTx.wait()

    await trackMessageTransmission(1, depositTx.hash)

    await logERC721Balances()

    // Withdraw
    console.log(' Withdrawing from deposit contract...')

    withdrawalTx = await OVM_DepositedERC721.withdraw(1)
    await withdrawalTx.wait()
    console.log(' Withdrawal tx hash:' + withdrawalTx.hash)

    await logERC721Balances()

    await trackMessageTransmission(2, withdrawalTx.hash)

    await logERC721Balances()

  }

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

exports.deploy = deploy;
