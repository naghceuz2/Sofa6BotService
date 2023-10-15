import type { Request } from 'koa';
import {SOLAddress,EnvConfig} from './const';
import { LAMPORTS_PER_SOL,
  Keypair, 
  PublicKey, 
  Connection, 
  Transaction,
  SystemProgram ,
  VersionedTransaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  TransactionMessage} from '@solana/web3.js';

import { serialize, deserialize } from "borsh";
import { Buffer } from "buffer";

import {getAAAddress} from './user'

export const createAA= async (uid: number) => {
  
  let url =  EnvConfig.RPC_ADDR;
  let rpcConnection = new Connection(url);
  let aaAddress = await getAAAddress(Number(uid));
  


  let botUser = await rpcConnection.getAccountInfo(aaAddress);
  if (botUser == null ) {
    let secretKey = Uint8Array.from(JSON.parse(EnvConfig.ADMIN_PRIVATE));
    let keypair = Keypair.fromSecretKey(secretKey); ;
    console.log(`Admin is ${keypair.publicKey.toBase58}`);
    const createIx = {
      id: 0,
      uid: BigInt(uid),
    };

    const createSerBuf = Buffer.from(
      serialize({struct:{id:"u8", uid:"u64"}}, createIx)
    );

    const ti =  new TransactionInstruction({
      data: createSerBuf,
      keys: [
        { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: aaAddress, isSigner: false, isWritable: true },
        { pubkey: SOLAddress.SYS_PROGRAM, isSigner: false, isWritable: true },
      ],
      programId: SOLAddress.SOL_TG_BOT_PROGRAM,
    });

    const tx = new Transaction();
    tx.add(ti);
    const txHash = await sendAndConfirmTransaction(rpcConnection, tx, [
      keypair,
    ]);
    console.log(`Create Bot user for ${uid} with  tx:${txHash}' `);
  } else {
    console.log(botUser);
  }
  return aaAddress;
};

export default createAA;
