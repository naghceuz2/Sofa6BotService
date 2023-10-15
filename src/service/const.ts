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

export const SOLAddress = {
    SOL_TG_BOT_PROGRAM: new PublicKey("4yHtVGmiySuTrF2XqeenuK2XUsHYWrEKqEJHVrZv6qUk"),
    SYS_PROGRAM: new PublicKey("11111111111111111111111111111111"),
    WSOL_ADDRESS: new PublicKey("So11111111111111111111111111111111111111112")
}

export const EnvConfig = {
    RPC_ADDR:"https://api.mainnet-beta.solana.com",
    ADMIN_PRIVATE:""
}
