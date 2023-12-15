import { Lucid, Blockfrost } from "lucid-cardano"
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

// const lucid = await Lucid.new();
const lucid = await Lucid.new(
  new Blockfrost(
    "https://cardano-preprod.blockfrost.io/api/v0",
    process.env.BLOCKFROST_PROJECT,
  ),
  "Preprod",
);
 
const privateKey = lucid.utils.generatePrivateKey();
console.log(privateKey);

fs.writeFile('me.sk', privateKey, (err) => {
  if (err) {
      console.error('Error writing file:', err);
      return;
  }
  console.log('Private key saved to me.sk');
});

 
const address = await lucid
  .selectWalletFromPrivateKey(privateKey)
  .wallet.address();

fs.writeFile('me.addr', address, (err) => {
  if (err) {
      console.error('Error writing file:', err);
      return;
  }
  console.log('Wallet address saved to me.addr');
});
