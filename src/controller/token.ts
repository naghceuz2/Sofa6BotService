import type { Context, Next } from 'koa';
import { serialize, deserialize } from "borsh";
import { Buffer } from "buffer";
import { getSPLTokenBalance,getSOLBalance,transferSPLToken,transfer } from '@/service';
import {MsgError} from "./error";
import JSBI from "jsbi";

import { LAMPORTS_PER_SOL,
  Keypair, 
  PublicKey, 
  Connection, 
  Transaction,
  SystemProgram ,
  VersionedTransaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  TokenAmount,
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
import { ExecException } from 'child_process';
import fetch from 'node-fetch';

// Instruction variant indexes
enum InstructionVariant {
  Create = 0,
  Transfer = 1,
  Invoke = 2,
}

class Token {


  getTokenInfo = async (ctx: Context, _next: Next) => {
    let token =ctx.request.query["token"]?.toString();

    let poolListURL = "https://api.mainnet.orca.so/v1/whirlpool/list";
    const response = await fetch(poolListURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    let poolListRsp= await  response.json();
    let poolListData = poolListRsp.whirlpools;

    let tokenInfo = null;

    for (let i=0; i<poolListData.length; i++){
      let pool = poolListData[i];
      if (pool.tokenA.mint == token) {
        tokenInfo = pool.tokenA
        break;
      }
      if (pool.tokenB.mint == token) {
        tokenInfo = pool.tokenB
        break;
      }
    }

    if (tokenInfo != null) {
      ctx.body = {
        data: tokenInfo 
      };
    } else {
      ctx.body = {
        data: MsgError.ErrTokenNotSupport 
      }; 
    }

  };


  getUserBalance = async (ctx: Context, _next: Next) => {
    console.log('token:', ctx.request.query["token"]);
    let uid =ctx.request.query["uid"]?.toString();
    let mintToken =ctx.request.query["token"]?.toString();
    if (uid == null ) {
      ctx.body = MsgError.ErrNoneUID;
      return;
    }

    let solAmount = 0;
    let tokenAmount = undefined;
    let solValue= undefined;
    solAmount = await getSOLBalance(Number(uid));
    if (solAmount >0) {
      solValue = 0;
    }
    if (mintToken !=null) {
      tokenAmount = await getSPLTokenBalance(Number(uid), new PublicKey( mintToken));
    }


    const res = {
      sol_balance: solAmount,
      token: mintToken,
      token_balance: tokenAmount,
      sol_value:solValue,
    }
    ctx.body = {
      data: res
    };
  };

  // transfer
  transferToken = async (ctx: Context, _next: Next) => {
    const { uid, token,to, amount } = ctx.request.body;
    console.log(`uid:${uid} token:${token} to:${to} amount:${amount}`);
    let mintToken = token;
    if (uid == null || amount == null || to ==null) {
      ctx.body = MsgError.ErrNoneUID;
      return;
    }

    let txHash = null;
    if (mintToken !=null) {
      console.log("do transferSPLToken");
      txHash = await transferSPLToken(Number(uid), new PublicKey( mintToken), new PublicKey(to), Number(amount));
    } else {
      console.log("do transfer");
      txHash = await transfer(Number(uid), new PublicKey(to), Number(amount));
    }

    if (typeof txHash == typeof ""){
      const res = {
        tx: txHash,
      }
      ctx.body = {
        data: res
      };
    } else {
      ctx.body = txHash;
    }

  };
}

export const tokenController = new Token();
export default tokenController;
