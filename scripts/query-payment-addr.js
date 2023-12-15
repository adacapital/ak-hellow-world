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

// const lucid = await Lucid.new();
const lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preprod.blockfrost.io/api/v0",
      process.env.BLOCKFROST_PROJECT,
    ),
    "Preprod",
);
  

const paymentSkey = await convertSkeyToBech32('payment2.skey');

// lucid.selectWalletFromPrivateKey(paymentSkey);
lucid.selectWalletFromPrivateKey('ed25519_sk1xfemz9vv8vfrxlypk47rmxr2xj4jm6vd2jr5532ajk5npppzlznqtruxpu');
const address = await lucid.wallet.address();
const utxos = await lucid.wallet.getUtxos();

console.log("");
console.log("address:", address);
console.log("utxos:", utxos);
