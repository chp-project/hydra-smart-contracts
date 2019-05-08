const Compute = require('@google-cloud/compute');

const projectId = 'tierion-iglesias';
const compute = new Compute({
  projectId: projectId,
});

let script = `#!/bin/bash
      
cd /srv/chp/chainpoint-node-src
curl -X POST \
  https://us-central1-tierion-iglesias.cloudfunctions.net/eth-address-init-stream-processor \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 127b5e92-b8fd-4fd0-b6f9-3a58f9d0c0d9' \
  -H 'cache-control: no-cache' \
  -d "{
  \"ethAddress\": \"foobarfoobar\"
}"`

async function main() {
  const options = {
    filter: 'name eq ^chp-node.*'
  };
  const vms = await compute.getVMs(options);

  for (let i = 0; i < vms[0].length; i++) {
    const vm = vms[0][i]
    
    await vm.setMetadata({
      'shutdown-script': script
    })
  }
  
  return vms;
}

main()
  .then(results => {
    // console.log(results, 'results')
  })
  .catch(err => {
    console.error(err)
  })