var express = require("express");
var fs = require("fs");
const https = require('https')
var cors = require('cors')
var bodyParser = require("body-parser");
var app = express();
const ethers = require('ethers')

let chats = {} //the current "target" chat (what should be displayed to the user)
let indexes = {} //where any given user is within the dialog

app.use(cors())

/*
const allDialog = [
  {id: 1, punk: 1234, text: "Welcome to [eth.dev](/)!!!"},
  {id: 2, text: "You need to be a good dev..."},
  {id: 3, buttons: [
    {
      text: "No, I'm not a developer",
      link: "https://eth.build"
    },
    {
      text: "Yes, I can code!",
      props:{ primary: true },
      goto: 4
    }
  ]},
  {id: 4, text: "okay cool, let's continue..."},
  {id: 5, text: "This is testing the basic flow of dialog."},
  {id: 6, text: "What would you like to try next?"},
  {id: 7, buttons: [
    {
      text: "No, I'm not a developer",
      link: "https://eth.build"
    },
    {
      text: "Yes, I can code!",
      props:{ primary: true },
      goto: 4
    }
  ]},
]*/

const allDialog = [{"type":"Text","id":"b8992fc0-445f-492d-b0f5-9fe8211f9f9f","actor":"punk5950.png","name":"Welcome to [eth.dev](/)!!!\n\nI'm in charge of onboarding around here.","next":"6fc0a558-294c-4700-b281-23bb8b770020"},{"type":"Text","id":"b96ab52c-af5c-4a39-ab7b-2099267d2ccf","actor":"punk5950.png","name":"You in?","choices":["0995adc9-037f-480f-97cf-8e89cd8144ec","aa9a6df8-25d3-4b53-92ab-25ad3b451331"]},{"type":"Choice","id":"aa9a6df8-25d3-4b53-92ab-25ad3b451331","title":"primary","name":"I'm in, let's go!","next":"5da826ed-4413-435f-bf9c-7e3df0cca0e0"},{"type":"Choice","id":"0995adc9-037f-480f-97cf-8e89cd8144ec","title":"warning","name":"I can't code. ","next":"86d9f616-c6d5-4d99-8de8-dec08d26a7db"},{"type":"Text","id":"86d9f616-c6d5-4d99-8de8-dec08d26a7db","actor":"punk5719.png","name":"Sup, noob?\n\nHeard you needed a coding refresher.","next":"da58484b-9e26-49c7-b4ac-688e64d108dc"},{"type":"Text","id":"da58484b-9e26-49c7-b4ac-688e64d108dc","actor":"punk5719.png","name":"Where should we start?","choices":["fbfd22ae-c4f5-4f30-9e46-0977c25412f7","91aba211-839e-4990-9431-b212408d686f"]},{"type":"Choice","id":"fbfd22ae-c4f5-4f30-9e46-0977c25412f7","title":"","name":"JavaScript Intro","next":"eacb8f99-f17a-481c-8dea-6e74c9c93adb"},{"type":"Choice","id":"91aba211-839e-4990-9431-b212408d686f","title":"","name":"React Todo List","next":null},{"type":"Text","id":"5da826ed-4413-435f-bf9c-7e3df0cca0e0","actor":"punk5950.png","name":"Rad!","next":"9d78a412-cb39-4db6-aa47-b9f3e0a09119"},{"type":"Choice","id":"fd168d37-1c4a-43e7-91bc-2855cc0783e7","title":"","name":"What's a keypair?","next":null},{"type":"Text","id":"9d78a412-cb39-4db6-aa47-b9f3e0a09119","actor":"punk5950.png","name":"Next, you need to generate a **key pair** to communicate with the network:\n","choices":["fd168d37-1c4a-43e7-91bc-2855cc0783e7","1cbb8ca6-3123-49c2-b3eb-913f008268f8"]},{"type":"Choice","id":"1cbb8ca6-3123-49c2-b3eb-913f008268f8","title":"success","name":"Generate","next":null},{"type":"Text","id":"eacb8f99-f17a-481c-8dea-6e74c9c93adb","actor":"punk9677.png","name":"Alright dude, let's connect your MetaMask and register an ENS on [app.ens.domains](https://app.ens.domains/)!","next":null},{"type":"Text","id":"6fc0a558-294c-4700-b281-23bb8b770020","actor":"punk5950.png","name":"You'll need to be a *decent* coder to finish these challenges and learn how to build on **Ethereum**.","next":"b96ab52c-af5c-4a39-ab7b-2099267d2ccf"}]

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const getDialog = (id)=>{
  for(let i=0;i<allDialog.length;i++){
    if(allDialog[i].id==id){
      return allDialog[i]
    }
  }
}

app.get("/", function(req, res) {
  //we'll use this end point to serve the onboarding chat:
  //we wont have a user id yet so we'll do ip+agent as a hash
  const tempUserId = ethers.utils.keccak256([req.connection.remoteAddress,req.headers['user-agent']])
  console.log("/ (noob checkin)",tempUserId,req.connection.remoteAddress,req.headers['user-agent'])

  if(!indexes[tempUserId]){
    indexes[tempUserId] = allDialog[0].id
  }

  let allCurrentDialog = []
  let done = false
  let index = indexes[tempUserId]
  while(!done){
    let currentDialog = getDialog(index)
    //console.log("["+currentDialog.id+"]")
    allCurrentDialog.push(currentDialog)

    if(currentDialog.name){
      currentDialog.text = currentDialog.name
      delete currentDialog.name // wtf who named this "name" (ajboni/Talkit did)
    }

    if(currentDialog.next){
      //console.log("=>("+currentDialog.next+")")
      index = currentDialog.next
    } else if(currentDialog.choices){
      let responseDialog = {
        id: currentDialog.id+"-choices"
      }

      responseDialog.buttons = []

      for(let c=0;c<currentDialog.choices.length;c++){

        let thisChoice = getDialog(currentDialog.choices[c])
        console.log("thisChoice",thisChoice)
        let props = {}
        if(thisChoice.title.indexOf("primary")>=0){
          props.primary = true
        }
        else if(thisChoice.title.indexOf("warning")>=0){
          props.warning = true
        }
        else if(thisChoice.title.indexOf("error")>=0){
          props.error = true
        }
        else if(thisChoice.title.indexOf("success")>=0){
          props.success = true
        }
        responseDialog.buttons.push(
          {
            text: thisChoice.name,
            next: thisChoice.next,
            props: props
          }
        )
      }
      allCurrentDialog.push(responseDialog)
      done=true
    }else{
      done=true
    }
  }

  console.log("allCurrentDialog",allCurrentDialog)

  res.status(200).send(JSON.stringify(allCurrentDialog))
});
/*
app.get("/:key", function(req, res) {
    let key = req.params.key
    console.log("/",key)
    res.status(200).send(transactions[key]);
});
*/

app.post('/', function(request, response){
    const tempUserId = ethers.utils.keccak256([request.connection.remoteAddress,request.headers['user-agent']])
    console.log("/ (POST ANSWER) ",tempUserId,request.body)
    if(request.body.next){

      indexes[tempUserId] = request.body.next

      console.log("updated indexes for ",tempUserId,indexes[tempUserId])
    }
      // your JSON
    /*response.send(request.body);    // echo the result back
    const key = request.body.address+"_"+request.body.chainId
    console.log("key:",key)
    if(!transactions[key]){
        transactions[key] = {}
    }
    transactions[key][request.body.hash] = request.body
    console.log("transactions",transactions)*/
});

if(fs.existsSync('server.key')&&fs.existsSync('server.cert')){
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(38124, () => {
    console.log('HTTPS Listening: 48224')
  })
}else{
  var server = app.listen(38124, function () {
      console.log("HTTP Listening on port:", server.address().port);
  });
}
