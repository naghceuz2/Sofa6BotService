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

export const getAAAddress= async (uid: number) => {
  let uidBuffer = new ArrayBuffer(8);
  let uidBufferView = new DataView(uidBuffer);
  uidBufferView.setBigUint64(0, BigInt(uid), true);
  let seed = [Buffer.from('bot_user', 'utf8'), Buffer.from(uidBuffer)];
  let programId = SOLAddress.SOL_TG_BOT_PROGRAM;
  let sysPID= SOLAddress.SYS_PROGRAM;
  let [ aaAddress,bump] = await  PublicKey.findProgramAddressSync(seed, programId);
  return aaAddress;
};

export const aaExist  = async (aa: PublicKey) => {
  
    let url =  EnvConfig.RPC_ADDR;
    let rpcConnection = new Connection(url);
    let botUser = await rpcConnection.getAccountInfo(aa);
    if (botUser == null ){
      return false;
    }
    return true;
}

export default getAAAddress;
