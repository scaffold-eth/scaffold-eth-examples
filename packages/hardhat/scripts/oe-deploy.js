/* eslint no-use-before-define: "warn" */
const { deploy } = require('./utils')
const { Watcher } = require('@eth-optimism/watcher')
const {  JsonRpcProvider } = require("@ethersproject/providers");
const { utils } = require("ethers");
const fs = require("fs");

const main = async () => {

  let demo = false

  //load uploaded assets (generated from `yarn upload`)
  let uploadedAssets = JSON.parse(fs.readFileSync("./uploaded.json"))
  let bytes32Array = []
  for(let a in uploadedAssets){
    console.log(" 🏷 IPFS:",a)
    let bytes32 = utils.id(a)
    console.log(" #️⃣ hashed:",bytes32)
    bytes32Array.push(bytes32)
  }
  console.log(" \n")


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
  const name = "OldEnglish"
  const symbol = "OE"
  const initialSupply = "100000000000000000000"

  const mnemonic = fs.readFileSync("./mnemonic.txt").toString().trim()
  const deployWallet = new ethers.Wallet.fromMnemonic(mnemonic)//, optimisticProvider)

/*
  const L1_ERC20 = await deploy({contractName: "ERC20", rpcUrl: selectedNetwork.l1RpcUrl, ovm: false, _args: [initialSupply, symbol, decimals]}) // <-- add in constructor args like line 19 vvvv

  const OVM_L2DepositedERC20 = await deploy({contractName: "L2DepositedERC20", rpcUrl: selectedNetwork.l2RpcUrl, ovm: true, _args: [l2MessengerAddress, name, symbol]})

  const OVM_L1ERC20Gateway = await deploy({contractName: "L1ERC20Gateway", rpcUrl: selectedNetwork.l1RpcUrl, ovm: false, _args: [L1_ERC20.address, OVM_L2DepositedERC20.address, l1MessengerAddress]})

  const init = await OVM_L2DepositedERC20.init(OVM_L1ERC20Gateway.address)
  console.log(' L2 initialised: ',init.hash)
*/

  console.log("input args:",bytes32Array)

  const yourCollectibleL2 = await deploy({contractName: "YourCollectible", rpcUrl: selectedNetwork.l2RpcUrl, ovm: true
    , _args: [[
  '0xd684e2e08b1f363176cb14405d8c1eefb7788c002ba583f1a838130956635ac8',
  '0xb46d21f480f9a029c3f0043b96b48b6352b52dfc282b8f7101aa684590ad9c52',
  '0x873000b60b392df07c7ac4cc870a98e616bb98a462288e8f00cf090f0ff81538',
  '0x8ad03ad905ab0cfc4f9443428f06fdab1f88beb1289a44b06ab9d20e0e272e14',
  '0xd66e3f61a039ae45d14a09e9bec0a9cf135d3abaf56841f919fd0ecf0174ade1',
  '0xfdb2d74c395c0d194bbf0833aad11db4f5ad57297435e0cc67ca6b5dd5c69272',
  '0x54be0683eef72e8de0727aa39dc705dc3d79a17e33ddf7f1c5fbba2f51d9cf30',
  '0xf86b5e05c97bbdaf6dfa8d263d14a89a43dde6cacdce3dc1fde91d2a965c05e8',
  '0x996078a99a6cb246d022fc1431a4097d19eed7d35c3021eb0a6977f0f8ff9fb9'/*,
  '0x49fb56becbe9b75b5c814c73b24069faa8f249f0ee3bffd7556a4ad098da292a',  // <-- this many bytes32s and it breaks 
  '0x68c31705f8079f8f452ae3330bf1d83ed511798387016c6150495a5dfbc7b428',
  '0x21a16f2de96aceaa51c3a08033cd6bca03049a97d0505c658cd4683b88dd36f1',
  '0x82a20069f9e152645a8f42ff7d3d1e836746e2b09a8ceebac45e97ad31721f5b',
  '0x0ec88a9a84cb83e6c0982198a336e18476a6bf38c33285a29f76aa5816621334',
  '0x0ed4703ef08c57867cbfd8c44132214364b3efb6380c458ad47df5da193c6732',
  '0x73806d087a4322f5f106028a9abe90d8da46af14c011232c59dbbc47578b5577',
  '0x4063329ebea8a15b235ecb4bc35f3a9ede08818cedf2c9aead7860c3c76f51db'*/
]]
  })

  console.log("AWAITING....")
  console.log("DEPLOYED:",await yourCollectibleL2.deployTransaction.wait())


  if(demo == true) {

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
    const approveTx = await L1_ERC20.approve(OVM_L1ERC20Gateway.address, 10)
    console.log(' Approved: ' + approveTx.hash)
    await approveTx.wait()

    await logBalances()

    // Deposit
    console.log(' Depositing into L1 deposit contract...')
    const depositTx = await OVM_L1ERC20Gateway.deposit(10, {gasLimit: 1000000})
    console.log(' Deposited: ' + depositTx.hash)
    await depositTx.wait()

    const [l1ToL2msgHash] = await watcher.getMessageHashesFromL1Tx(depositTx.hash)
    console.log(' got L1->L2 message hash', l1ToL2msgHash)
    const l2Receipt = await watcher.getL2TransactionReceipt(l1ToL2msgHash)
    console.log(' completed Deposit! L2 tx hash:', l2Receipt.transactionHash)

    await logBalances()

    // Withdraw
    console.log(' Withdrawing from L1 deposit contract...')
    const withdrawalTx = await OVM_L2DepositedERC20.withdraw(10, {gasLimit: 5000000})
    await withdrawalTx.wait()
    console.log(' Withdrawal tx hash:' + withdrawalTx.hash)

    await logBalances()

    const [l2ToL1msgHash] = await watcher.getMessageHashesFromL2Tx(withdrawalTx.hash)
    console.log(' got L2->L1 message hash', l2ToL1msgHash)
    const l1Receipt = await watcher.getL1TransactionReceipt(l2ToL1msgHash)
    console.log(' completed Withdrawal! L1 tx hash:', l1Receipt.transactionHash)
    await logBalances()
  }

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

exports.deploy = deploy;
