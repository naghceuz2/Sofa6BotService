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

import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getOrCreateAssociatedTokenAccount,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync
  } from '@solana/spl-token';

import { serialize, deserialize } from "borsh";
import { Buffer } from "buffer";

import {getAAAddress} from './user'
import { MsgError } from '@/controller/error';

export const transfer = async (uid: number, to:PublicKey, amount: number) => {
    let url =  EnvConfig.RPC_ADDR;
    let rpcConnection = new Connection(url);
    let aaAddress = await getAAAddress(Number(uid));
  
    let botUser = await rpcConnection.getAccountInfo(aaAddress); 
    if (botUser == null ) {
      return MsgError.ErrNoSuchUser; 
    } 

    if (botUser.lamports < amount) {
        return MsgError.ErrNoEnoughBalance;
    }

    let secretKey = Uint8Array.from(JSON.parse(EnvConfig.ADMIN_PRIVATE));
    let keypair = Keypair.fromSecretKey(secretKey); ;
    console.log(`Admin is ${keypair.publicKey.toBase58}`); 
    const transferIx = {
        id: 3,
        uid: BigInt(uid),
        amount: BigInt(amount),
      };
  
      let toAccount = new PublicKey(to);
  
      const tx = new Transaction();
  
      const transferSerBuf = Buffer.from(
        serialize({struct:{id:"u8", uid:"u64", amount:"u64"}}, transferIx)
      );
      const ti =  new TransactionInstruction({
        data: transferSerBuf,
        keys: [
          { pubkey: aaAddress, isSigner: false, isWritable: true },
          { pubkey: toAccount, isSigner: false, isWritable: true },
        ],
        programId: SOLAddress.SOL_TG_BOT_PROGRAM,
      });
  
  
      tx.add(ti);
      const txHash = await sendAndConfirmTransaction(rpcConnection, tx, [
        keypair,
      ],{skipPreflight:true});
      console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
    return txHash;
}
   

export const getSOLBalance = async (uid: number) => {
     
  let url =  EnvConfig.RPC_ADDR;
  let rpcConnection = new Connection(url);
  let aaAddress = await getAAAddress(Number(uid));
  


  let botUser = await rpcConnection.getAccountInfo(aaAddress); 
  if (botUser == null ) {
    return 0; 
  } else {
    return botUser.lamports/LAMPORTS_PER_SOL;
  }
}