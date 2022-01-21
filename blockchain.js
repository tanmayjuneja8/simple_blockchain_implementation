const crypto = require('crypto'); // Import NodeJS's Crypto Module
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class transaction{
    constructor(userAddress, ApproverAddress, amount, data){
        this.userAddress = userAddress;
        this.ApproverAddress = ApproverAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }
    calculateHash(){
        return crypto.createHash('sha256').update(this.userAddress + this.ApproverAddress + this.data + this.timestamp).digest('hex');
    }
    signTransaction(signingKey) {
        // You can only send a transaction from your public key.
        // So here we check if the fromAddress matches the publicKey
        if (signingKey.getPublic('hex') !== this.userAddress) {
            throw new Error('You cannot sign transactions for other users!');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, "base64");      // sign txn
        this.signature = sig.toDER('hex');      // signature of txn`
        
    }
    isValid(){
        if (!this.signature || this.signature.length === 0) {
            throw new Error('No Signature in this Transaction!');
        }

        const publicKey = ec.keyFromPublic(this.userAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}

class Block { // Our Block Class
    constructor(index, transactions, prevHash = "") {
        this.nonce = 0;
        this.timestamp = Date.now(); // Get the current timestamp
        this.transactions = transactions; // Store whatever transaction is relevant 
        this.prevHash = prevHash; // Store the previous block's hash
        this.hash = this.computeHash(); // Compute this block's hash
    }
  
    computeHash() { // Compute this Block's hash
        let strBlock = this.index + this.prevHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce // Stringify the block's transaction
        return crypto.createHash("sha256").update(strBlock).digest("hex") // Hash said string with bcrypt encrpytion
    }
    mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.computeHash();
    }
    }
    hasValidTransactions() {
        for (const txn of this.transactions) {
            if (!txn.isValid()) {
                return false;
            } 
        }
        return true;
    }
}


class BlockChain { // Our Blockchain Object
    constructor() {
        this.blockchain = [this.startGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 1000;
    }
    startGenesisBlock() {
        return new Block(0, "Genesis Block","0") // Create an empty block to start
    }
    obtainLatestBlock() {
        return this.blockchain[this.blockchain.length - 1] // Get last block on the chain
    }
    addNewBlock(newBlock) { // Add a new block
        newBlock.prevHash = this.obtainLatestBlock().hash // Set its previous hash to the correct value
        newBlock.hash = newBlock.computeHash() // Recalculate its hash with this new prevHash value
        // transaction = 
        this.blockchain.push(newBlock) // Add the block to our chain
    }
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.blockchain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
    addTransaction(transaction){
        if (!transaction.userAddress || ! transaction.ApproverAddress) {
            throw new error('Transaction must include User/Approver Address');
        }
        if (!transaction.isValid()) {
            throw new error('Transaction is invalid');
        }
         if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }
    
        if (this.getBalanceOfAddress(transaction.userAddress) < transaction.amount) {
            throw new Error('Not enough balance');
        }

        this.pendingTransactions.push(transaction);
        
    }
    
    minePendingTransactions(miningRWDAdd) {
        
            const rewardTx = new transaction(null, miningRWDAdd, this.miningReward);
            this.pendingTransactions.push(rewardTx);

            const block = new Block(this.pendingTransactions, this.obtainLatestBlock().hash);
            block.mineBlock(this.difficulty);

            console.log('\nBlock successfully mined!\n');
            this.blockchain.push(block);        
            this.pendingTransactions = [];
    }
    getAllTransactionsForWallet(address) {
    const txs = [];

        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.userAddress === address || tx.ApproverAddress === address) {
                    txs.push(tx);
                }
            }
        }

        return txs;
    }

    checkChainValidity() { // Check to see that all the hashes are correct and the chain is therefore valid
        if (JSON.stringify(this.createGenesisBlock()) !== JSON.stringify(this.chain[0])) {
        return false;
        }
        for(let i = 1; i < this.blockchain.length; i++) { // Iterate through, starting after the genesis block
            const currBlock = this.blockchain[i]
            const prevBlock = this.blockchain[i -1]

            if (!currBlock.hasValidTransactions()) {
                return false;
            }
            
            // Is the hash correctly computed?
            if(currBlock.hash !== currBlock.computeHash()) { 
                return false
            }
          
            // Does it have the correct prevHash value?
            if(currBlock.prevHash !== prevBlock.hash) {                 
              return false
            } 
        }
        return true // If all the blocks are valid, return true
    }
}
module.exports.BlockChain = BlockChain;
module.exports.Block = Block;
module.exports.transaction = transaction;
