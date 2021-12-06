const {
  FlagsType,
  Postchain,
  KeyPair,
  SingleSignatureAuthDescriptor,
  User,
} = require('ft3-lib');
const {
  Filehub,
  FilehubAdministrator,
  FsFile,
} = require('@snieking/fs-client');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

const filehubUrl = '';
const filehubBrid = '';

async function main() {
  const filehub = new Filehub(filehubUrl, filehubBrid);

  // Registers a new filechain
  // const filechainUrl = '';
  // const filechainBrid = '';
  // await registerFilechain(filehub, filechainUrl, filechainBrid);

  // Store a file
  const user = await createFt3User();
  const file = FsFile.fromData(generateData(1024));
  await filehub.storeFile(user, file);

  const retrievedFile = await filehub.getFile(file.hash);

  console.log(
    `Equals: ${
      file.data.toString('hex') === retrievedFile.data.toString('hex')
    }`
  );
}

// This is an admin only function to register a new filechain in the filehub
async function registerFilechain(filehub, filechainUrl, filechainBrid) {
  const adminKeyPair = new KeyPair(
    '093c5d39705432f3b2036e4add82f1242c7f311bc49c4796e00468d5d5bc6b1b'
  );
  const filehubAdministrator = new FilehubAdministrator(filehub, adminKeyPair);

  await filehubAdministrator.registerFilechain(filechainBrid, filechainUrl);
}

async function createFt3User(privKey) {
  const blockchain = await new Postchain(filehubUrl).blockchain(filehubBrid);

  const walletKeyPair = new KeyPair(
    privKey ? privKey : makeKeyPair().privKey.toString('hex')
  );
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(
    walletKeyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );

  const walletUser = new User(walletKeyPair, walletAuthDescriptor);

  try {
    await blockchain.registerAccount(walletAuthDescriptor, walletUser);
  } catch (error) {
    console.log('User already registered');
  }

  return new Promise((resolve) => resolve(walletUser));
}

function makeKeyPair() {
  let privKey;
  do {
    privKey = crypto.randomBytes(32);
  } while (!secp256k1.privateKeyVerify(privKey));
  const pubKey = secp256k1.publicKeyCreate(privKey);
  return { pubKey, privKey };
}

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function generateData(length) {
  return Buffer.from(generateRandomString(length), 'utf8');
}

main();
