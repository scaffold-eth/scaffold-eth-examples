"use strict";
const express = require('express');
const helmet = require('helmet');
const app = express();
const fs = require('fs');
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
var cors = require('cors')
app.use(cors())

let sigs = {}

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
});

app.get('/sig/:id', (req, res) => {
  console.log("/sig/",req.params.id)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify(sigs[req.params.id]));
});

app.post('/sig', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/sig",req.body)
  if(req.body&&req.body.id){
    sigs[req.body.id] = req.body
  }
});

app.listen(8001);
console.log(`http listening on 8001`);