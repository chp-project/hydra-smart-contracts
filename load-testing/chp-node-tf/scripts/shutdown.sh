curl -X POST \
  https://us-central1-tierion-iglesias.cloudfunctions.net/eth-address-init-stream-processor \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 127b5e92-b8fd-4fd0-b6f9-3a58f9d0c0d9' \
  -H 'cache-control: no-cache' \
  -d "{
	\"ethAddress\": \"$(<eth-address.txt) --- foobarfoobar\"
}"

cd /srv/chp/chainpoint-node-src

make deregister