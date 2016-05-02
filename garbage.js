'use strict'
const openpgp = require('openpgp')
const fs = require('fs')
openpgp.initWorker({path:'./node_modules/openpgp/dist/openpgp.worker.js'})
openpgp.config.aead_protect = true

var options, encrypted;

// var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK ... END PGP PUBLIC KEY BLOCK-----';
// var privkey = '-----BEGIN PGP PRIVATE KEY BLOCK ... END PGP PRIVATE KEY BLOCK-----';
const publicFilePath = './keys/public.asc'
const privateFilePath = './keys/private.asc'
const encryptedFilePath = './files/test2.txt.pgp'
const decryptedFilePath = './files/test2.txt'
const encoding = {encoding: 'utf-8'}
const password = 'test'

const pubkey = fs.readFileSync(publicFilePath, encoding)
const privkey = fs.readFileSync(privateFilePath, encoding)

options = {
    data: 'Hello, World!',                             // input as String (or Uint8Array)
    publicKeys: openpgp.key.readArmored(pubkey).keys,  // for encryption
    privateKeys: openpgp.key.readArmored(privkey).keys // for signing (optional)
};

const privateKeys = openpgp.key.readArmored(privkey).keys
const publicKeys = openpgp.key.readArmored(pubkey).keys
const data = `Employee ID|Employee Name|Termination Date|Phone Number
123|Bob|12/19/16|123-456-7890
456|Mangle|12/19/16|123-456-7890
789|Rick|12/29/16|123-456-7890
abc|Jangle|12/09/16|123-456-7890`
// console.log(privateKeys[0])

openpgp.decryptKey({privateKey: privateKeys[0], passphrase: password}).then(decKey => {
  // console.log(decKey)
}).then(decryptionKey => {
  openpgp.encrypt({privateKeys: decryptionKey, publicKeys: publicKeys, data: data}).then(encrypted => {
    // console.log('encrypted', encrypted.data)
    fs.writeFileSync(encryptedFilePath, encrypted.data)
  }).catch(error => {
    console.log('encryption error', error)
  })
})
.catch(error => {
  console.log('decryptKey error', error)
})

const encryptedFile = fs.readFileSync(encryptedFilePath, encoding)

openpgp.decrypt({publicKeys: publicKeys, message: openpgp.message.readArmored(encryptedFile), passphrase: password, privateKey: privateKeys[0]}).then(plaintext => {
  console.log('plaintext', plaintext)
  fs.writeFileSync(decryptedFilePath, plaintext.data)
}).catch(error => {
  console.log('decryption error', error)
})
//Error: Error encrypting message: Private key is not decrypted.
