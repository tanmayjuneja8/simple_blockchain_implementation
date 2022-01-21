const { BlockChain, transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('04d403b58781a2693d0e698c3ba0c4365d3c04520528356fc342627994f6f919i');

// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex');

// Create new instance of Blockchain class
const BC = new BlockChain();

// Mine first block
BC.minePendingTransactions(myWalletAddress);

// Create a transaction & sign it with your key
const tx1 = new transaction(myWalletAddress, 'address2', 100);
tx1.signTransaction(myKey);
BC.addTransaction(tx1);

// Mine block
BC.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx2 = new transaction(myWalletAddress, 'address1', 50);
tx2.signTransaction(myKey);
BC.addTransaction(tx2);

// Mine block
BC.minePendingTransactions(myWalletAddress);

console.log();
console.log(`Balance of your Account is ${BC.getBalanceOfAddress(myWalletAddress)}`);

// Uncomment this line if you want to tamper with the chain and see the hashes of the blocks change
// BC.chain[1].transactions[0].amount = 10;

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', BC.isChainValid() ? 'Yes' : 'No');