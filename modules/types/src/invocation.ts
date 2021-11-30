
/*
    This is a magical object that can describe every blockchain transaction known to man

            --- that's been added to the pioneer stack atleast

    Goals:
        - universal fee estimation
        - universal intent detection
                -did you intend on sending all moniez to highlander?


    note: yes this Invocation type object was a bad idea FIXME
        (sub types?)
            type classes?

 */
export interface Invocation {
    //required
    asset:any
    //TODO type FEE
    fee:any
    network:string
    context:string
    username:string
    //optionals
    addressFrom?:string,
    type?:string
    noBroadcast?:boolean
    invocationId?:string
    inboundAddress?:any
    address?:string,
    addressTo?:string,
    validator?:string,
    validatorOld?:string,
    poolId?: string
    shareOutAmount?: string
    tokenInMaxs?:any
    memo?:string
    blockchain?:string
    routes?:any
    tokenIn?:any
    tokenOutMinAmount?:string
    coin?:string
    amount?:string
    //IBC imports (some are snake case for conformity with cosmosSdk) ... rabble pascal mixed with snake rabble
    token?:any
    sender?:string
    receiver?:string
    source_port?:string
    source_channel?:string
    timeout_height?:any
}

export interface InvocationBody {
    msg?: string;
    context: string;
    network:string;
    type:string
    username:string,
    invocation:Invocation
    addressFrom?:string,
    invocationId?:string
    auth?:string
    service?:string
    servicePubkey?:string
    serviceHash?:string
    appName?:string
    mode?:'sync' | 'async'
}

export interface createAppBody {
    name:string
    image:string
    version:string
    description:string
}
