const ethers = require("ethers");
const express = require('express')
var bodyParser = require('body-parser');
const ipfsAPI = require('ipfs-api');
var cors = require('cors')
var fs = require('fs');
var path = require('path');
var str = require('string-to-stream')
var httpProxy = require('http-proxy');

const app = express()
const port = 443

const https = require('https')

const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

// https://ipfs.nifty.ink/QmeVPfnCq25cEeTSWy96x2m5dWCATBZ7xCcVVKc4JQ6HUJ.png

const xdaiProvider = new ethers.providers.JsonRpcProvider("https://dai.poa.network")
///// LOAD NiftyInk contract:
const readContract = new ethers.Contract(
  require("./NiftyInk.address.js"),
  require("./NiftyInk.abi.js"),
  xdaiProvider,
);

app.use(cors())
//app.use('/', function (req, res, next) {
//  res.end("Hello world")
//})
app.use(function (req, res, next) {
  console.log("REQ",req.url);
  next();
});
app.use(express.static('public'))

app.use(async (req, res, next) => {
  const ipfsHash = req.url.replace("/","").replace(".png","")
  if(ipfsHash && ipfsHash!="favicon.ico"){
    console.log("FAILED TO FIND",ipfsHash);
    console.log("Reading NiftyInk.inkInfoByInkUrl from xDAI...",ipfsHash)
    const newChainInfo = await readContract["inkInfoByInkUrl"](ipfsHash)
    if(newChainInfo){
      //console.log("RESULT",newChainInfo)//result[0].content//
      console.log("LOADING",newChainInfo[2]," FROM IPFS...")
      let result = await ipfs.get(newChainInfo[2])
      let obj = JSON.parse(result[0].content)
      let imagePreviewHash = obj.image.replace("https://ipfs.io/ipfs/","")

      console.log("NOW LOADING ",imagePreviewHash,"FROM IPFS...")
      let image = await ipfs.get(imagePreviewHash)
      fs.writeFileSync("public/"+ipfsHash+".png",image[0].content)
      res.writeHead(200, {
          'Content-Type': "image/png",
          'Content-Length': image[0].content.length
      });
      res.end(Buffer.from(image[0].content, 'binary'));
    }else{
      next();
    }
  }else{
    res.end("Hello world")
  }

});

https.createServer({
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem'),
  ca: fs.readFileSync('fullchain.pem')
}, app).listen(443, () => {
  console.log('Listening on 443 SSL Style...')
})
