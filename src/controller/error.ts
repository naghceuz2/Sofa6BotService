
export const MsgError = {
    ErrNoneUID : {
        errno: 1001,
        errmsg: "uid should be provide", 
    },
    ErrNoSuchUser : {
        errno: 1002,
        errmsg: "no such user account", 
    },
    ErrNoSourceSPLTokenAccount : {
        errno: 1003,
        errmsg: "no ATA Token for this account", 
    },
    ErrNoEnoughBalance: {
        errno: 1004,
        errmsg: "no enough balance for this account", 
    },
    ErrNoInvaliedTokenAddress: {
        errno: 1005,
        errmsg: "invalied token address", 
    },
    ErrTokenNotExist: {
        errno: 1006,
        errmsg: "the token is not existed", 
    },
    ErrPoolNotExist: {
        errno: 1007,
        errmsg: "the pool is not existed", 
    },
    ErrTokenNotSupport: {
        errno: 1008,
        errmsg: "the token is not support", 
    },
}