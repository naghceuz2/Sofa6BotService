import type { Context, Next } from 'koa';
import { serialize, deserialize } from "borsh";
import { Buffer } from "buffer";
import { getAAAddress,aaExist, createAA } from '@/service';
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
  TransactionMessage} from '@solana/web3.js';



class User {

  createUserInfo =  async (ctx: Context, _next: Next) => {
    const { uid } = ctx.request.body;
    if (uid == null || uid=="0") {
      ctx.body = MsgError.ErrNoneUID;
      return;
    }

    let aaAddress = await createAA(Number(uid));
    ctx.body = {
      user_wallet: aaAddress.toBase58(),
    };
  }
  
  getUserInfo = async (ctx: Context, _next: Next) => {
    console.log('uid:', ctx.request.query["uid"]);
    if (ctx.request.query["uid"] == null || ctx.request.query["uid"]=="0") {
      ctx.body = MsgError.ErrNoneUID;
      return;
    }
    let uid =ctx.request.query["uid"].toString();
    let aaAddress = await getAAAddress(Number(uid));
    console.log(`aaAddress ${aaAddress}`);
    if (await aaExist(aaAddress)) {
      ctx.body = {
        data:{
          user_wallet: aaAddress.toBase58()
        }
      }
    } else {
      ctx.body = MsgError.ErrNoSuchUser;
      return;
    }

  };
}

export const userController = new User();
export default userController;
