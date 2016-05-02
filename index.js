'use strict'
const openpgp = require('openpgp')
const fs = require('fs')
openpgp.initWorker({path:'./node_modules/openpgp/dist/openpgp.worker.js'})
openpgp.config.aead_protect = true

const publicFilePath = './keys/public.asc'
const privateFilePath = './keys/private.asc'
const encryptedFilePath = './files/test.txt.pgp'
const encoding = {encoding: 'utf-8'}
const password = 'test'

const pubkey = fs.readFileSync(publicFilePath, encoding)
const privkey = fs.readFileSync(privateFilePath, encoding)

// console.log(pubkey, privkey)

const options = { //this doesn't work for whatever reason but when you split it out it does
    data: 'Hello, World!',                             // input as String (or Uint8Array)
    publicKeys: openpgp.key.readArmored(pubkey).keys,  // for encryption
    privateKeys: openpgp.key.readArmored(privkey).keys // for signing (optional)
};
// it seems that privateKeys breaks it

// console.log(options.publicKeys)

const string = 'hey get this to work'
const publicKeys = openpgp.key.readArmored(pubkey).keys
const privateKeys = openpgp.key.readArmored(privkey).keys

// console.log(privateKeys[0])

// console.log(privateKeys[0].decrypt(password)) // true

// openpgp.encrypt({publicKeys: publicKeys, data: string}).then(encrypted => {
// openpgp.encrypt({publicKeys: publicKeys, data: string, privateKeys: privateKeys}).then(encrypted => {
openpgp.encrypt({data: string, passwords: password}).then(encrypted => {
  // console.log('encrypted', encrypted)
  fs.writeFileSync(encryptedFilePath, encrypted.data)
  // console.log('encrypted.data', encrypted.data)
}).catch(error => {
  console.log('encryption error', error)
})

const encryptedFile = fs.readFileSync(encryptedFilePath, encoding)
// console.log('enF', encryptedFile)

// openpgp.decrypt({publicKeys: publicKeys, privateKeys: privateKeys, message: openpgp.message.readArmored(encryptedFile), password: password}).then(function (plaintext) {
// openpgp.decrypt({publicKeys: publicKeys, message: openpgp.message.readArmored(encryptedFile), password: password}).then(plaintext => {
openpgp.decrypt({message: openpgp.message.readArmored(encryptedFile), password: password}).then(plaintext => {
  console.log('plaintext', plaintext)
}).catch(error => {
  console.log('decryption error', error)
})
