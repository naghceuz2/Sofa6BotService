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
  SolanaJSONRPCError,
  sendAndConfirmTransaction,
  TransactionMessage} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getOrCreateAssociatedTokenAccount,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError,
    createAssociatedTokenAccountInstruction,
    createSyncNativeInstruction,
    createCloseAccountInstruction,
    getAssociatedTokenAddressSync
  } from '@solana/spl-token';
import fetch from 'node-fetch';


import { AnchorProvider, Program,Wallet } from "@coral-xyz/anchor";
import BN from "bn.js";
import { serialize, deserialize } from "borsh";
import { Buffer } from "buffer";


import {
    WhirlpoolContext,
    TickUtil,
    SwapUtils, 
    ORCA_WHIRLPOOL_PROGRAM_ID, 
    buildWhirlpoolClient,
    PDAUtil, 
    ORCA_WHIRLPOOLS_CONFIG, 
    WhirlpoolData, 
    PoolUtil, 
    SwapInput,
    swapQuoteByInputToken,
    WhirlpoolAccountFetcher,
    WhirlpoolIx,
    SwapParams,
    MIN_SQRT_PRICE,
    MAX_SQRT_PRICE,
    buildDefaultAccountFetcher,
    PriceMath,
} from "@orca-so/whirlpools-sdk";

import Decimal from "decimal.js";
import { DecimalUtil, Percentage,MathUtil,ZERO, ONE } from "@orca-so/common-sdk";
import {MsgError} from "../controller/error";

import {getAAAddress} from './user'

export const swapSOL =async (uid:number, wrapOrNot: Boolean, amountIn: number) => {
    let url =  EnvConfig.RPC_ADDR;
    let rpcConnection = new Connection(url);
    let aaAddress = await getAAAddress(Number(uid));
  
    let secretKey = Uint8Array.from(JSON.parse(EnvConfig.ADMIN_PRIVATE));
    let keypair = Keypair.fromSecretKey(secretKey); ;
    console.log(`Admin is ${keypair.publicKey.toBase58}`);
  
    const provider = new AnchorProvider(rpcConnection, new Wallet(keypair),AnchorProvider.defaultOptions());
    const wpfetcher = buildDefaultAccountFetcher(rpcConnection);
    const wpctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID,wpfetcher);
    const client = buildWhirlpoolClient(wpctx);
  
    let botUser = await rpcConnection.getAccountInfo(aaAddress); 
    if (botUser == null ) {
      return 0; 
    } 
    const tx = new Transaction();
    const aAta = getAssociatedTokenAddressSync(
      SOLAddress.WSOL_ADDRESS,
      aaAddress,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log(`wSOL's ATA is ${aAta}`);
    if (wrapOrNot) {
        try {
            await rpcConnection.getTokenAccountBalance(aAta);
            console.log("get aAta success");
        } catch (e) {
            if (e instanceof TokenAccountNotFoundError || 
                e instanceof TokenInvalidAccountOwnerError || 
                (e instanceof SolanaJSONRPCError && e.code == -32602)) {
              let cataI = createAssociatedTokenAccountInstruction(
                keypair.publicKey,
                aAta,
                new PublicKey(aaAddress),
                SOLAddress.WSOL_ADDRESS,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID);
              tx.add(cataI);
              console.log(`add create bAta:${aAta}`);
                
            } else {
                console.log("e is typeof:%O", typeof e);
            }
        }
        
        const transferIx = {
            id: 3,
            uid: BigInt(uid),
            amount: BigInt(amountIn),
        };
      
        const transferSerBuf = Buffer.from(
            serialize({struct:{id:"u8", uid:"u64", amount:"u64"}}, transferIx)
        );
        const ti =  new TransactionInstruction({
            data: transferSerBuf,
            keys: [
              { pubkey: aaAddress, isSigner: false, isWritable: true },
              { pubkey: aAta, isSigner: false, isWritable: true },
            ],
            programId: SOLAddress.SOL_TG_BOT_PROGRAM,
        });
        tx.add(ti)


        let wi = createSyncNativeInstruction(aAta);
        const invokeIx = {
            id: 2,
            uid: BigInt(uid),
            data: wi.data,
        };
        
        const invokeSerBuf = Buffer.from(
            serialize({struct:{id:"u8", uid:"u64", data:{ array: { type: 'u8' }}}}, invokeIx)
        );
        
          for (let i=0;i<wi.keys.length; i++) {
            wi.keys[i].isSigner = false;
          }
        const iti =  new TransactionInstruction({
            data: invokeSerBuf,
            keys: [
                { pubkey: aaAddress, isSigner: false, isWritable: true },
                { pubkey: wi.programId, isSigner: false, isWritable: false },
                ...wi.keys,
            ],
            programId: SOLAddress.SOL_TG_BOT_PROGRAM,
        });
        tx.add(iti);


    } else {
      try {
        await rpcConnection.getTokenAccountBalance(aAta);
        console.log("get aAta success");
      } catch (e) {
        return MsgError.ErrNoSourceSPLTokenAccount;
      }

      let wi = createCloseAccountInstruction(aAta, aaAddress, aaAddress);
      const invokeIx = {
          id: 2,
          uid: BigInt(uid),
          data: wi.data,
      };
      
      const invokeSerBuf = Buffer.from(
          serialize({struct:{id:"u8", uid:"u64", data:{ array: { type: 'u8' }}}}, invokeIx)
      );
      
        for (let i=0;i<wi.keys.length; i++) {
          wi.keys[i].isSigner = false;
        }
      const iti =  new TransactionInstruction({
          data: invokeSerBuf,
          keys: [
              { pubkey: aaAddress, isSigner: false, isWritable: true },
              { pubkey: wi.programId, isSigner: false, isWritable: false },
              ...wi.keys,
          ],
          programId: SOLAddress.SOL_TG_BOT_PROGRAM,
      });
      tx.add(iti); 
    }

    const txHash = await sendAndConfirmTransaction(rpcConnection, tx, [
      keypair,
    //]);
     ], {skipPreflight:true});
  
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
    return txHash; 
}

export const swapToken =async (uid:number, aMint: PublicKey,bMint: PublicKey, amountIn: number) => {
  let url =  EnvConfig.RPC_ADDR;
  let rpcConnection = new Connection(url);
  let aaAddress = await getAAAddress(Number(uid));

  let secretKey = Uint8Array.from(JSON.parse(EnvConfig.ADMIN_PRIVATE));
  let keypair = Keypair.fromSecretKey(secretKey); ;
  console.log(`Admin is ${keypair.publicKey.toBase58()}`);

  const provider = new AnchorProvider(rpcConnection, new Wallet(keypair),AnchorProvider.defaultOptions());
  const wpfetcher = buildDefaultAccountFetcher(rpcConnection);
  const wpctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID,wpfetcher);
  const client = buildWhirlpoolClient(wpctx);

  let botUser = await rpcConnection.getAccountInfo(aaAddress); 
  if (botUser == null ) {
    return MsgError.ErrNoSuchUser; 
  } 

  let poolListURL = "https://api.mainnet.orca.so/v1/whirlpool/list";
  const response = await fetch(poolListURL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  let poolListRsp= await  response.json();
  let poolListData = poolListRsp.whirlpools;


  let tickSpacing = 0;
  let aToB = true;
  let sqrtPriceLimit = MIN_SQRT_PRICE;
  let whirlpoolAddress  = null;

  for (let i=0; i<poolListData.length; i++){
    let pool = poolListData[i];
    if (pool.tokenA.mint == aMint.toBase58() && pool.tokenB.mint == bMint.toBase58()) {
      aToB = true;
      tickSpacing = pool.tickSpacing;
      sqrtPriceLimit = MIN_SQRT_PRICE;
      console.log("use MIN_SQRT_PRICE");
      whirlpoolAddress = new PublicKey(pool.address);
      break;
    } else if (pool.tokenA.mint == bMint.toBase58() && pool.tokenB.mint == aMint.toBase58()) {
      aMint = new PublicKey(pool.tokenA.mint);
      bMint = new PublicKey(pool.tokenB.mint);
      aToB = false;
      tickSpacing = pool.tickSpacing;
      sqrtPriceLimit = MAX_SQRT_PRICE;
      console.log("use MAX_SQRT_PRICE");
      whirlpoolAddress = new PublicKey(pool.address);
      break;
    }
  }
  if (0 == tickSpacing || null == whirlpoolAddress) {
    return MsgError.ErrPoolNotExist;
  }

  

  console.log(`aMint ${aMint} bMint ${bMint} ORCA_WHIRLPOOL_PROGRAM_ID ${ORCA_WHIRLPOOL_PROGRAM_ID} NEBULA__WHIRLPOOLS_CONFIG ${ORCA_WHIRLPOOL_PROGRAM_ID}`);
  console.log("whirlpool_key", whirlpoolAddress.toBase58());

  const whirlpoolData = await wpfetcher.getPool(whirlpoolAddress); // or whirlpool.getData()
  if (whirlpoolData == null) {
    console.log(`whirlpool ${whirlpoolAddress.toBase58()} is null`);
    return MsgError.ErrPoolNotExist;
  }
  // Option 2 - Get the sequence of tick-arrays to trade in based on your trade direction. 
  const tickArrays = await SwapUtils.getTickArrays(
    whirlpoolData.tickCurrentIndex,
    whirlpoolData.tickSpacing,
    aToB,
    ORCA_WHIRLPOOL_PROGRAM_ID,
    whirlpoolAddress,
    wpfetcher
  );

  const tx = new Transaction();
  const amountInBN =DecimalUtil.toBN(DecimalUtil.fromNumber(amountIn, 0)); 
  const oraclePda = PDAUtil.getOracle(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress);
  const aAta = getAssociatedTokenAddressSync(
    new PublicKey(aMint),
    aaAddress,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  console.log(`aAta is ${aAta}`);
  try {
    await rpcConnection.getTokenAccountBalance(aAta);
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError || 
        e instanceof TokenInvalidAccountOwnerError || 
        (e instanceof SolanaJSONRPCError && e.code == -32602)) {
      let cataI = createAssociatedTokenAccountInstruction(
        keypair.publicKey,
        aAta,
        new PublicKey(aaAddress),
        new PublicKey(aMint),
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID);
      tx.add(cataI);
      console.log(`add create bAta:${aAta}`);
        
    } else {
        console.log("e is typeof:%O", typeof e);
    }
  }

  const bAta = getAssociatedTokenAddressSync(
    new PublicKey(bMint),
    aaAddress,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  console.log(`bAta is ${bAta}`);
  try {
    await rpcConnection.getTokenAccountBalance(bAta);
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError || 
        e instanceof TokenInvalidAccountOwnerError ||
        (e instanceof SolanaJSONRPCError && e.code == -32602)) {
      let cataI = createAssociatedTokenAccountInstruction(
        keypair.publicKey,
        bAta,
        new PublicKey(aaAddress),
        new PublicKey(bMint),
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID);
      tx.add(cataI);
      console.log(`add create bAta:${bAta}`);
    }
  }


  const swapParams : SwapParams = {
    amount: amountInBN,
    otherAmountThreshold: ZERO,
    sqrtPriceLimit:  new BN(sqrtPriceLimit, 10),
    amountSpecifiedIsInput: true,
    aToB: aToB,
    tickArray0: tickArrays[0].address,
    tickArray1: tickArrays[1].address,
    tickArray2: tickArrays[2].address,


    whirlpool: whirlpoolAddress,
    tokenOwnerAccountA: aAta,
    tokenOwnerAccountB: bAta,
    tokenVaultA: whirlpoolData.tokenVaultA,
    tokenVaultB: whirlpoolData.tokenVaultB,
    oracle: oraclePda.publicKey,
    tokenAuthority: aaAddress,
  }

  let swapIx = WhirlpoolIx.swapIx(wpctx.program, swapParams);
  const invokeIx = {
    id: 2,
    uid: BigInt(uid),
    data: swapIx.instructions[0].data,
  };

  const invokeSerBuf = Buffer.from(
    serialize({struct:{id:"u8", uid:"u64", data:{ array: { type: 'u8' }}}}, invokeIx)
  );

  for (let i=0;i<swapIx.instructions[0].keys.length; i++) {
    swapIx.instructions[0].keys[i].isSigner = false;
  }
  const ti =  new TransactionInstruction({
    data: invokeSerBuf,
    keys: [
      { pubkey: aaAddress, isSigner: false, isWritable: true },
      { pubkey: swapIx.instructions[0].programId, isSigner: false, isWritable: false },
      ...swapIx.instructions[0].keys,
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
