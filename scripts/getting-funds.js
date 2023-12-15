import { Lucid, Blockfrost } from "lucid-cardano"
import fs from 'fs/promises';
import { bech32 } from 'bech32';
import * as dotenv from 'dotenv';

dotenv.config();

async function convertSkeyToBech32(skeyFile) {
    try {
        const fileContent = await fs.readFile(skeyFile, 'utf8');
        const jsonData = JSON.parse(fileContent);
        const cborHex = jsonData.cborHex.substring(4); // Remove first 4 characters

        const words = bech32.toWords(Buffer.from(cborHex, 'hex'));
        const bech32Encoded = bech32.encode('ed25519_sk', words);

        // console.log(bech32Encoded);
        return bech32Encoded;
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

// Function to load keys and return them
async function loadKeys() {
    try {
        const privateKey = await fs.readFile('me.sk', 'utf8');
        const address = await fs.readFile('me.addr', 'utf8');

        return { privateKey, address };
    } catch (err) {
        console.error('Error reading file:', err);
        throw err;  // Rethrow the error to handle it outside the function
    }
}

// New address details
let newPrivateKey;
let newAddress;

// Function call and assignment to variables
await loadKeys()
    .then(keys => {
        newPrivateKey = keys.privateKey;
        newAddress = keys.address;

        console.log('Private Key and Address loaded into variables.');
    })
    .catch(err => {
        console.error('Failed to load keys:', err);
    });

// const lucid = await Lucid.new();
const lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preprod.blockfrost.io/api/v0",
      process.env.BLOCKFROST_PROJECT,
    ),
    "Preprod",
);
  

const paymentSkey = await convertSkeyToBech32('payment.skey');
// const payment2Addr = 'addr_test1vrz77yd5s4kgfywx76drj6j35cqj6a3evqdrfddz4llazhg3rxcyf';

lucid.selectWalletFromPrivateKey(paymentSkey);
const address = await lucid.wallet.address();
const utxos = await lucid.wallet.getUtxos();

console.log("");
console.log("source key:", paymentSkey);
console.log("source wallet address:", address);
console.log("source wallet utxos:", utxos);
console.log("");
console.log("destination key:", newPrivateKey);
console.log("destination address:", newAddress);
console.log("");



const tx = await lucid.newTx()
  .payToAddress(newAddress, { lovelace: 2000000n })
  .complete();

const signedTx = await tx.sign().complete();

const txHash = await signedTx.submit();

console.log("txHash:", txHash);

