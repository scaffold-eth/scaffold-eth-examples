#/bin/bash
sudo certbot certonly --standalone -d txpool.bank.buidlguidl.com --config-dir ~/.certbot/config --logs-dir ~/.certbot/logs --work-dir ~/.certbot/work
sudo cp -f ~/.certbot/config/live/txpool.bank.buidlguidl.com/privkey.pem server.key;sudo chmod 0777 server.key
sudo cp -f ~/.certbot/config/live/txpool.bank.buidlguidl.com/cert.pem server.cert;sudo chmod 0777 server.cert
