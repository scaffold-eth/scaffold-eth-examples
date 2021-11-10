#/bin/bash
sudo certbot certonly --standalone -d pool.bank.nifty.ink --config-dir ~/.certbot/config --logs-dir ~/.certbot/logs --work-dir ~/.certbot/work
sudo cp -f ~/.certbot/config/live/pool.bank.nifty.ink/privkey.pem server.key;sudo chmod 0777 server.key
sudo cp -f ~/.certbot/config/live/pool.bank.nifty.ink/cert.pem server.cert;sudo chmod 0777 server.cert
