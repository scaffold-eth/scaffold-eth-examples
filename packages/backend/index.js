var ethers = require("ethers");
var express = require("express");
var fs = require("fs");
const https = require('https')
var cors = require('cors')
var bodyParser = require("body-parser");
var app = express();

/*
  Uncomment this if you want to create a wallet to send ETH or something...
const INFURA = JSON.parse(fs.readFileSync("./infura.txt").toString().trim())
const PK = fs.readFileSync("./pk.txt").toString().trim()
let wallet = new ethers.Wallet(PK,new ethers.providers.InfuraProvider("goerli",INFURA))
console.log(wallet.address)
const checkWalletBalance = async ()=>{
  console.log("BALANCE:",ethers.utils.formatEther(await wallet.provider.getBalance(wallet.address)))
}
checkWalletBalance()
*/

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
    console.log("/")
    res.status(200).send(currentMessage);
});

app.post('/', async function(request, response){
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log("SIG from ip address:",ip,request.body)
    let recovered = ethers.utils.verifyMessage(request.body.message, request.body.signature)
    /*
      maybe you want to send them some tokens or ETH?
    let sendResult = await wallet.sendTransaction({
      to: request.body.address,
      value: ethers.utils.parseEther("0.01")
    })
    */
    const resultMessage = " 👍 successfully verified "+request.body.message+" came in from "+recovered+"!"
    console.log(resultMessage)
    response.send(resultMessage);


});


if(fs.existsSync('server.key')&&fs.existsSync('server.cert')){
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(49832, () => {
    console.log('HTTPS Listening: 49832')
  })
}else{
  var server = app.listen(49832, function () {
      console.log("HTTP Listening on port:", server.address().port);
  });
}
