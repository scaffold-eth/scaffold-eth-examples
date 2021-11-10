#!/bin/bash
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get install certbot
sudo certbot certonly --standalone -d ipfs.nifty.ink
sudo cp /etc/letsencrypt/live/ipfs.nifty.ink/fullchain.pem . -f
sudo chmod 0777 /etc/letsencrypt/live/ipfs.nifty.ink/privkey.pem
sudo chmod 0777 /etc/letsencrypt/live/ipfs.nifty.ink/cert.pem
sudo cp /etc/letsencrypt/live/ipfs.nifty.ink/privkey.pem . -f
sudo cp /etc/letsencrypt/live/ipfs.nifty.ink/cert.pem . -f
