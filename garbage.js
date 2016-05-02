'use strict'
// boilerplate-seeming stuff
const openpgp = require('openpgp')
const fs = require('fs')
openpgp.initWorker({path:'./node_modules/openpgp/dist/openpgp.worker.js'})
openpgp.config.aead_protect = true

// filepaths
const publicFilePath = './keys/public.asc'
const privateFilePath = './keys/private.asc'
const encryptedFilePath = './files/test2.txt.pgp'
const decryptedFilePath = './files/test2.txt'
// since default encoding is null and we want to be able to read words and not buffers
const utf8 = {encoding: 'utf-8'}
// secret password
const password = 'test'
// text of our keys
const pubkey = fs.readFileSync(publicFilePath, utf8)
const privkey = fs.readFileSync(privateFilePath, utf8)
// openpgp reading of our keys
const privateKeys = openpgp.key.readArmored(privkey).keys
const publicKeys = openpgp.key.readArmored(pubkey).keys
// data to encrypt
const data = `Employee ID|Employee Name|Termination Date|Phone Number
123|Bob|12/19/16|123-456-7890
456|Mangle|12/19/16|123-456-7890
789|Rick|12/29/16|123-456-7890
abc|Jangle|12/09/16|123-456-7890`

// it seems you have to decode the privatekey before you can use it in encryption
// at the moment when i try to get rid of this empty then() it breaks
openpgp.decryptKey({privateKey: privateKeys[0], passphrase: password}).then(decKey => {
  // console.log(decKey)
}).then(decryptionKey => {
  openpgp.encrypt({privateKeys: decryptionKey, publicKeys: publicKeys, data: data}).then(encrypted => {
    // console.log('encrypted', encrypted.data)
    fs.writeFileSync(encryptedFilePath, encrypted.data)
  }).catch(error => {
    console.log('encryption error', error)
  })
}).catch(error => {
  console.log('decryptKey error', error)
})

// this doesn't work for some reason
// openpgp.decryptKey({privateKey: privateKeys[0], passphrase: password}).then(decryptionKey => {
//   openpgp.encrypt({privateKeys: decryptionKey, publicKeys: publicKeys, data: data}).then(encrypted => {
//     fs.writeFileSync(encryptedFilePath, encrypted.data)
//   }).catch(error => console.log('encryption error', error))
// }).catch(error => console.log('decryptKey error', error))

// text of encrypted file to decrypt
const encryptedFile = fs.readFileSync(encryptedFilePath, utf8)

//decrypt pgp file
openpgp.decrypt({publicKeys: publicKeys, message: openpgp.message.readArmored(encryptedFile), passphrase: password, privateKey: privateKeys[0]}).then(plaintext => {
  // console.log('plaintext', plaintext)
  fs.writeFileSync(decryptedFilePath, plaintext.data)
}).catch(error => {
  console.log('decryption error', error)
})
