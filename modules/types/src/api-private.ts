
export interface CreateAppBody {
    name:string
    image:string
    version:string
    description:string
}

export class ApiError extends Error {
    private statusCode: number;
    constructor(name: string, statusCode: number, message?: string) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
    }
}

export interface RegisterBodyData {
    pubkeys: any;
}

export interface GetNewAddressBody {
    coin:string
}

export interface PairBody {
    code:string
}
export interface RegisterEosUsername {
    username:string
    pubkey:string
}

export interface GetNewAddressBody {
    coin:string
}

export interface SetContextBody {
    context:string
}

export interface SetAssetContextBody {
    asset:string
}

export interface RegisterEosUsername {
    username:string
    pubkey:string
}

export interface UpdateInvocationBody {
    invocationId:string,
    invocation:any,
    unsignedTx:any,
    signedTx?:any
}
export interface DeleteInvocationBody {
    invocationId:string,
}
export interface IgnoreShitcoins {
    coins:any[]
    shitcoins?:any[]
}
export interface TransactionsBody {
    coin:string
    startTime?:number
    endTime?:number
    startBlock?:number
    endBlock?:number
}
export interface ImportBody {
    source:string,
    coin:string,
    // pubkeys:Array<Pubkeys> //TODO why this no work
    pubkeys:any
}
export interface WalletDescription {
    context: string
    type: string
}
export interface RegisterBody {
    isTestnet?:boolean
    blockchains:any
    username:string
    data:RegisterBodyData,
    walletDescription:WalletDescription,
    context: string,
    queryKey?:string
}
export interface CreateApiKeyBody {
    account:string
    data?:any
}
export interface CreatePairingCodeBody {
    service?:string
    url?:string
    data?:any
}
