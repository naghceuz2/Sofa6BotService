import type { Context, Next } from 'koa';
import { serialize, deserialize } from "borsh";
import { Buffer } from "buffer";
import BN from "bn.js";
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
import { swapToken,swapSOL } from '@/service';


import { AnchorProvider, Program,Wallet } from "@coral-xyz/anchor";

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
    //tickIndexToSqrtPriceX64,
    MIN_SQRT_PRICE,
    MAX_SQRT_PRICE,
    buildDefaultAccountFetcher,
    PriceMath,
} from "@orca-so/whirlpools-sdk";

import Decimal from "decimal.js";
import { DecimalUtil, Percentage,MathUtil,ZERO, ONE } from "@orca-so/common-sdk";
import {MsgError} from "./error";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync
} from '@solana/spl-token';

class Swap {

  wrapsol = async (ctx: Context, _next: Next) => {
    const { uid, amount_in } = ctx.request.body;
    let amountIn = amount_in;
    if (uid == null || 
      amountIn ==null) {
      ctx.body = MsgError.ErrNoneUID;
      return;
    }

    let txHash = null;
    txHash = await swapSOL(Number(uid), true, Number(amountIn));

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

  unwrapsol = async (ctx: Context, _next: Next) => {
    const { uid } = ctx.request.body;
    if (uid == null ) {
      ctx.body = MsgError.ErrNoneUID;
      return;
    }

    let txHash = null;
    txHash = await swapSOL(Number(uid), false, Number(0));

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

  swap = async (ctx: Context, _next: Next) => {
    const { uid, a_mint,b_mint, amount_in } = ctx.request.body;
    let aMint=a_mint;
    let bMint =b_mint;
    let amountIn = amount_in;
    if (uid == null || 
      aMint == null || 
      bMint == null || 
      amountIn ==null) {
      ctx.body = MsgError.ErrNoneUID;
      return;
    }

    let txHash = null;
    txHash = await swapToken(Number(uid), new PublicKey(aMint), new PublicKey(bMint), Number(amountIn));

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

export const swapController = new Swap();
export default swapController;
