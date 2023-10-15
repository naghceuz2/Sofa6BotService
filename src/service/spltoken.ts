import type { Request } from 'koa';
import {SOLAddress,EnvConfig} from './const';
import { LAMPORTS_PER_SOL,
  Keypair, 
  PublicKey, 
  Connection, 
  Transaction,
  SystemProgram ,
  VersionedTransaction,
  SolanaJSONRPCError,
  TransactionInstruction,
  sendAndConfirmTransaction,
  TransactionMessage} from '@solana/web3.js';
import {MsgError} from "../controller/error";
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

export const transferSPLToken =async (uid:number, mint: PublicKey,to: PublicKey, amount: number) => {
  let url =  EnvConfig.RPC_ADDR;
  let rpcConnection = new Connection(url);
  let aaAddress = await getAAAddress(Number(uid));

  let botUser = await rpcConnection.getAccountInfo(aaAddress); 
  if (botUser == null ) {
    return MsgError.ErrNoSuchUser; 
  } 
  const transferIx = {
    id: 1,
    uid: BigInt(uid),
    amount: BigInt(amount),
  };

  const uidAta = getAssociatedTokenAddressSync(
    new PublicKey(mint),
    aaAddress,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  try {
    let ta = await rpcConnection.getTokenAccountBalance(uidAta);
    //transferIx.amount = transferIx.amount* (BigInt(10)**BigInt(ta.value.decimals));
    //console.log(`transferIx.amount:${transferIx.amount} ta.value.amount:${ta.value.amount}`);
    if (ta.value.uiAmount == null || transferIx.amount >BigInt(ta.value.amount)) {
        return MsgError.ErrNoEnoughBalance;
    }
  } catch (e) {
    console.log(`getTokenAccountBalance error:${e}`);
    return  MsgError.ErrNoSourceSPLTokenAccount;
  }
  const toAta = getAssociatedTokenAddressSync(
    new PublicKey(mint),
    new PublicKey(to),
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  let secretKey = Uint8Array.from(JSON.parse(EnvConfig.ADMIN_PRIVATE));
  let keypair = Keypair.fromSecretKey(secretKey); ;
  console.log(`Admin is ${keypair.publicKey.toBase58}`);
  const tx = new Transaction();
  try {
    await rpcConnection.getTokenAccountBalance(toAta);

  } catch (e) {
    if (e instanceof TokenAccountNotFoundError || 
      e instanceof TokenInvalidAccountOwnerError || 
      (e instanceof SolanaJSONRPCError && e.code == -32602)) {
      let cataI = createAssociatedTokenAccountInstruction(
        keypair.publicKey,
        toAta,
        new PublicKey(to),
        new PublicKey(mint),
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID);
      tx.add(cataI);
    }
  }

  const transferSerBuf = Buffer.from(
    serialize({struct:{id:"u8", uid:"u64", amount:"u64"}}, transferIx)
  );
  const ti =  new TransactionInstruction({
    data: transferSerBuf,
    keys: [
      { pubkey: aaAddress, isSigner: false, isWritable: true },
      { pubkey: uidAta, isSigner: false, isWritable: true },
      { pubkey: toAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: SOLAddress.SOL_TG_BOT_PROGRAM,
  });


  tx.add(ti);
  const txHash = await sendAndConfirmTransaction(rpcConnection, tx, [
    keypair,
  ]);
  //], {skipPreflight:true});
  console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  return txHash;
}

export const getSPLTokenBalance = async (uid: number, mint: PublicKey) => {
     
    let url =  EnvConfig.RPC_ADDR;
    let rpcConnection = new Connection(url);
    let aaAddress = await getAAAddress(Number(uid));
  
    let botUser = await rpcConnection.getAccountInfo(aaAddress); 
    if (botUser == null ) {
      return 0; 
    }

    const uidAta = getAssociatedTokenAddressSync(
        new PublicKey(mint),
        aaAddress,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    try {
        let ta = await rpcConnection.getTokenAccountBalance(uidAta);
    if (ta.value.uiAmount != null) {
        return ta.value.uiAmount
    }
    } catch (e) {
        console.log(`getTokenAccountBalance error:${e}`);
        return 0;
    }
    return 0;
}
