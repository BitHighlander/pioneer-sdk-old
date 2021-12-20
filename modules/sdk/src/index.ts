/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */

const TAG = " | Pioneer-sdk | "
const log = require("@pioneer-platform/loggerdog")()

//Pioneer follows OpenAPI spec
const Pioneer = require('openapi-client-axios').default;
const Events = require("@pioneer-platform/pioneer-events")
const Datastore = require('nedb-promises')
const keccak256 = require('keccak256')
let {
    getPaths,
    getPrecision,
    getExplorerUrl,
    getExplorerAddressUrl,
    getExplorerTxUrl,
    baseAmountToNative,
    nativeToBaseAmount,
    getNativeAssetForBlockchain,
    assetToBase,
    assetAmount,
    getSwapProtocals,
    normalize_pubkeys,
} = require('@pioneer-sdk/coins')

let Invoke = require("@pioneer-platform/pioneer-invoke")

const Axios = require('axios')
const https = require('https')
const axios = Axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

// import { ethers, BigNumberish } from 'ethers'
// import BigNumber from 'bignumber.js'
const TxBuilder = require("@pioneer-platform/pioneer-tx-builder");
/*
    ShapeShiftOss
 */
import { NativeAdapterArgs, NativeHDWallet } from '@shapeshiftoss/hdwallet-native'
import { ChainAdapterManager } from '@shapeshiftoss/chain-adapters'
// import { caip2 } from '@shapeshiftoss/caip'
import { UtxoAccountType, BIP44Params } from '@shapeshiftoss/types'
// import { getPriceHistory } from '@shapeshiftoss/market-service'
// //import { Vault } from '@shapeshiftoss/hdwallet-native-vault'
// import { SwapperManager, ZrxSwapper } from '@shapeshiftoss/swapper'
// import { bn, bnOrZero } from 'lib/bignumber/bignumber'
// import { fromBaseUnit, toBaseUnit } from 'lib/math'
// import { getWeb3Instance } from 'lib/web3-instance'

//end ssoss


import {
    Chart,
    SendToAddress,
    Config,
    User,
    Swap,
    SDKConfig,
    OnboardWallet,
    IBCdeposit,
    Invocation,
    OsmosisSwap,
    Delegate,
    Redelegate,
    JoinPool,
    Transfer,
    BroadcastBody
} from "@pioneer-sdk/types";

// import {
//     Chart,
//     Config,
//     User,
//     Swap,
//     SDKConfig,
//     OnboardWallet,
//     IBCdeposit,
//     Invocation,
//     OsmosisSwap,
//     Delegate,
//     Redelegate,
//     JoinPool,
//     Transfer,
//     BroadcastBody
// } from "@pioneer-platform/pioneer-types";

export class SDK {
    public unchainedUrls: any;
    public spec: any;
    public pioneerApi: any;
    public init: (blockchains: any) => Promise<any>;
    public config: any;
    public clients: any;
    public createPairingCode: () => Promise<any>;
    public queryKey: string;
    public service: string;
    public isTestnet: boolean;
    // public sendToAddress: (blockchain: string, asset: string, amount: string, memo?: string) => Promise<any>;
    public url: string;
    public events: any;
    public wss: string | undefined;
    public username: string;
    public blockchains: any
    public startSocket: () => Promise<any>;
    public isPaired: boolean
    public context: string;
    public pubkeys:any[]
    public masters:any
    public balances:any[]
    public ibcChannels:any[]
    public paymentStreams:any[]
    public nfts:any[]
    public contexts: any;
    public info: any;
    public wallets: any[];
    public keychain: any;
    public totalValueUsd: number;
    public getUserInfo: () => Promise<any>;
    public getWalletInfo: () => Promise<any>;
    public setContext: (context: string) => Promise<any>;
    public getInvocations: () => Promise<any>;
    public invocationContext: string;
    public assetContext: string;
    public assetBalanceUsdValueContext: string;
    public assetBalanceNativeContext: string;
    public getInvocation: (invocationId: string) => Promise<any>;
    public stopSocket: () => any;
    public contextWalletInfo: any;
    public valueUsdContext: any;
    public chart: (chart: any) => Promise<any>;
    public setAssetContext: (asset: string) => Promise<any>;
    public status: string;
    public apiVersion: string;
    public initialized: boolean;
    public markets: any;
    public txBuilder: any;
    public buildSwapTx: (swap: any) => Promise<any>;
    public invoke: any;
    public signTx: (unsignedTx: any) => Promise<{}>;
    // public ibcDeposit: (tx: IBCdeposit, nativeAsset: string) => Promise<any>;
    public getValidators: () => Promise<any>;
    public getDelegations: (validator: string, network: string, address: string) => Promise<any>;
    public getPool: (asset: string) => Promise<any>;
    public swap: ((tx: any, asset: string) => Promise<any>) | undefined;
    public delegate: (tx: any, asset: string) => Promise<any>;
    public redelegate: (tx: any, asset: string) => Promise<any>;
    public joinPool: (tx: any, asset: string) => Promise<any>;
    // public getFeesWithMemo: (memo?: string) => Promise<{ average: { amount: () => BigNumber }; fast: { amount: () => BigNumber }; fastest: { amount: () => BigNumber }; type: string }>;
    public getFeeRates: () => Promise<any>;
    public getNetwork: () => (string);
    public getExplorerUrl: (network: string) => any;
    public approve: (asset: string, spender: string, sender: string, amount: string, noBroadcast?: boolean) => Promise<any>;
    public replace: (invocationId: string, fee: any) => Promise<any>;
    // public estimateFee: ({sourceAsset, ethClient, ethInbound, inputAmount, memo}: any) => Promise<BigNumber>;
    public isApproved: (routerAddress: string, tokenAddress: string, amount: any) => Promise<boolean>;
    public updateContext: () => Promise<any>;
    public getExplorerAddressUrl: (address: string, network: string) => any;
    public getExplorerTxUrl: (address: string, network: string) => any;
    public getBlockHeight: (asset: string) => Promise<any>;
    public getAddress: (asset: string) => any;
    public validateAddress: (address: string) => boolean;
    public getBalance: (address?: any, asset?: string) => Promise<any>;
    public getTransactions: (address: string) => Promise<void>;
    public getTransactionData: (txid: string, asset: string) => Promise<any>;
    public getFees: (params?: any) => Promise<any>;
    public deposit: (deposit: any, options: any, asset: string) => Promise<any>;
    public transfer: (tx: any, options: any, asset: string) => Promise<any>;
    // public estimateFeesWithGasPricesAndLimits: (params: any) => Promise<{ gasPrices: any; fees: { average: { amount: () => BigNumber }; fast: { amount: () => BigNumber }; fastest: { amount: () => BigNumber }; type: string } }>;
    public getTxCount: (asset: string) => Promise<any>;
    public updateUserInfo: () => any;
    public invokeUnsigned: (tx: any, options: any, asset: string) => Promise<any>;
    public updateInvocation: (updateBody: any) => Promise<any>;
    public broadcastTransaction: (network: string, signedTx: any) => Promise<any>;
    public loadPubkeys: (pubkeys: any) => void;
    public dbPubkeys: any;
    public dbBalances: any;
    public pairWallet: (walletType:string, wallet: any) => Promise<any>;
    public chainAdapterManager: any;
    public HDWallet: any;
    public buildTx: (tx: any) => Promise<any>;
    private getPubkeys: () => Promise<any>;
    pairBridge: () => void;
    private checkBridge: () => void;
    private bridge: string;
    private pair: (code: string) => Promise<any>;
    getCodeInfo: (code: string) => Promise<any>;
    private getBridgeUser: () => Promise<any>;
    constructor(spec:string,config:any) {
        this.unchainedUrls = config.unchainedUrls
        this.service = config.service || 'unknown'
        this.url = config.url || 'unknown'
        this.dbPubkeys = Datastore.create('./path/to/dbPubkeys.db')
        this.dbBalances = Datastore.create('./path/to/dbBalances.db')
        this.isTestnet = false
        this.initialized = false
        this.isPaired = false
        this.status = 'preInit'
        this.apiVersion = ""
        this.config = config
        this.bridge = 'http://localhost:1646'
        this.username = config.username
        this.spec = spec || config.spec
        this.wss = config.wss || 'wss://pioneers.dev'
        this.queryKey = config.queryKey
        this.spec = config.spec
        this.clients = {}
        this.contexts = []
        this.pubkeys = []
        this.balances = []
        this.markets = {}
        this.context = ""
        this.invocationContext = ""
        this.assetContext = ""
        this.assetBalanceNativeContext = ""
        this.assetBalanceUsdValueContext = ""
        this.wallets = []
        this.events = {}
        this.totalValueUsd = 0
        this.blockchains = []
        this.ibcChannels = []
        this.paymentStreams = []
        this.nfts = []
        this.loadPubkeys = function (wallet:any) {
            let tag = TAG + " | loadPubkeys | "
            try {
                let output:any = {
                    balances:[]
                }
                this.dbPubkeys.ensureIndex({fieldName:"pubkey"})
                this.pubkeys = wallet.pubkeys

                //for each pubkey
                for(let i = 0; i < wallet.pubkeys.length; i++){
                    let pubkey = wallet.pubkeys[i]
                    log.debug(tag,"pubkey: ",pubkey)
                    //get db pubkey
                    this.dbPubkeys.insert(pubkey)
                        //if none save

                    //get db balances for pubkey
                        //if none add unsyned

                    let balance = {
                        blockchain: pubkey.blockchain,
                        symbol: pubkey.symbol,
                        asset: pubkey.symbol,
                        path: pubkey.path,
                        pathMaster: pubkey.pathMaster,
                        master: pubkey.master,
                        pubkey: pubkey.pubkey,
                        script_type: pubkey.script_type,
                        network: pubkey.network,
                        created: new Date().getTime(),
                        tags: [
                            this.username,
                            //TODO context
                        ],
                        context: 'kk-undefined-3800',
                        isToken: false,
                        lastUpdated: null,
                        balance: 0,
                        protocols: getSwapProtocals(pubkey.symbol,pubkey.symbol)
                    }
                    output.balances.push(balance)
                    this.dbBalances.insert(balance)
                }
                return output
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getPubkeys = async function () {
            let tag = TAG + " | getPubkeys | "
            try {
                if(!this.blockchains || this.blockchains.length === 0) throw Error("Blockchains required!")
                let output:any = {}
                log.debug(tag,"blockchains: ",this.blockchains)
                //let paths = this.paths(this.blockchains)
                let paths = getPaths(this.blockchains)
                log.debug(tag,"getPaths: ",paths)
                //verify paths
                for(let i = 0; i < this.blockchains.length; i++){
                    let blockchain = this.blockchains[i]
                    let symbol = getNativeAssetForBlockchain(blockchain)
                    log.debug(tag,"symbol: ",symbol)
                    //find in pubkeys
                    let isFound = paths.find((path: { blockchain: string; }) => {
                        return path.blockchain === blockchain
                    })
                    if(!isFound){
                        throw Error("Failed to find path for blockchain: "+blockchain)
                    }
                }

                let pathsKeepkey:any = []
                for(let i = 0; i < paths.length; i++){
                    let path = paths[i]
                    let pathForKeepkey:any = {}
                    //send coin as bitcoin
                    pathForKeepkey.symbol = path.symbol
                    pathForKeepkey.addressNList = path.addressNList
                    //why
                    pathForKeepkey.coin = 'Bitcoin'
                    pathForKeepkey.script_type = 'p2pkh'
                    //showDisplay
                    pathForKeepkey.showDisplay = false
                    pathsKeepkey.push(pathForKeepkey)
                }

                log.notice("***** paths IN: ",pathsKeepkey.length)
                //NOTE: keepkey returns an ordered array.
                //To build verbose pubkey info we must rebuild based on order
                // console.log("pathsKeepkey: ",pathsKeepkey)
                // log.debug(tag,"this.HDWallet: ",this.HDWallet)
                // log.debug(tag,"this.HDWallet: ",this.HDWallet.wallet)
                log.debug(tag,"this.HDWallet: ",await this.HDWallet.isInitialized())
                const result = await this.HDWallet.getPublicKeys(pathsKeepkey);
                log.debug("***** pubkeys OUT: ",result)
                if(pathsKeepkey.length !== result.length) {
                    log.error(tag, {pathsKeepkey})
                    log.error(tag, {result})
                    throw Error("Device unable to get path!")
                }
                log.debug("rawResult: ",result)
                log.debug("rawResult: ",JSON.stringify(result))


                //rebuild
                let pubkeys = await normalize_pubkeys('keepkey',result,paths)
                output.pubkeys = pubkeys
                this.pubkeys = pubkeys
                if(pubkeys.length !== result.length) {
                    log.error(tag, {pathsKeepkey})
                    log.error(tag, {result})
                    throw Error("Failed to Normalize pubkeys!")
                }
                log.debug(tag,"pubkeys: (normalized) ",pubkeys.length)
                log.debug(tag,"pubkeys: (normalized) ",pubkeys)

                //add feature info to pubkey
                let keyedWallet:any = {}
                for(let i = 0; i < pubkeys.length; i++){
                    let pubkey = pubkeys[i]
                    if(!keyedWallet[pubkey.symbol]){
                        keyedWallet[pubkey.symbol] = pubkey
                    }else{
                        if(!keyedWallet['available']) keyedWallet['available'] = []
                        //add to secondary pubkeys
                        keyedWallet['available'].push(pubkey)
                    }

                }

                //verify pubkeys
                for(let i = 0; i < this.blockchains.length; i++){
                    let blockchain = this.blockchains[i]
                    let symbol = getNativeAssetForBlockchain(blockchain)
                    log.debug(tag,"symbol: ",symbol)
                    //find in pubkeys
                    let isFound = pubkeys.find((path: { blockchain: string; }) => {
                        return path.blockchain === blockchain
                    })
                    if(!isFound){
                        throw Error("Failed to find pubkey for blockchain: "+blockchain)
                    }
                    //verify master
                }

                // let features = this.HDWallet.features;
                // log.debug(tag,"vender: ",features)
                // log.debug(tag,"vender: ",features.deviceId)

                //keep it short but unique. label + last 4 of id
                let masterEth = await this.getAddress('ETH')
                let context = masterEth+".wallet"
                let watchWallet = {
                    "WALLET_ID": context,
                    "TYPE": "watch",
                    "CREATED": new Date().getTime(),
                    "VERSION": "0.1.3",
                    "BLOCKCHAINS: ":this.blockchains,
                    "PUBKEYS":pubkeys,
                    "WALLET_PUBLIC":keyedWallet,
                    "PATHS":paths
                }
                log.debug(tag,"writePathPub: ",watchWallet)
                output.context = context
                output.wallet = watchWallet
                return output
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.init = async function (blockchains?:any) {
            let tag = TAG + " | init_wallet | "
            try{
                if(this.initialized) throw Error("102: already initialized!")
                if(!blockchains) throw Error("103: blockchains required!")
                this.initialized = true
                this.status = 'init'
                log.debug(tag,"blockchains: ",blockchains)

                if(!blockchains) blockchains = []
                if(!this.queryKey) throw Error(" You must create an api key! ")
                this.pioneerApi = new Pioneer({
                    definition:spec,
                    axiosConfigDefaults: {
                        headers: {
                            'Authorization': this.queryKey,
                        },
                    }
                });

                //TODO when to use cache?
                // //read pubkeys from db
                // let pubkeysDb = await this.dbPubkeys.find()
                // log.debug(tag,"pubkeysDb: ",pubkeysDb)
                // this.pubkeys = pubkeysDb
                //
                // //read balances from db
                // let balancesDb = await this.dbBalances.find()
                // log.debug(tag,"balancesDb: ",balancesDb)
                // this.balances = balancesDb

                //init blockchains
                for(let i = 0; i < blockchains.length; i++){
                    let blockchain = blockchains[i]
                    this.blockchains.push(blockchain.toLowerCase())
                }
                if(this.blockchains.length === 0) throw Error("Failed to init! must have blockchains!")
                this.pioneerApi = await this.pioneerApi.init()
                if(!this.pioneerApi) throw Error("Failed to init!")
                let config = {
                    queryKey:this.queryKey,
                    username:this.username,
                    blockchains,
                    spec
                }
                this.txBuilder = new TxBuilder('',config);
                await this.txBuilder.init()

                let configInvoke = {
                    queryKey:this.queryKey,
                    username:this.username,
                    spec
                }
                //get config
                this.invoke = new Invoke(spec,configInvoke)
                await  this.invoke.init()

                //is api online
                let health = await this.pioneerApi.Health()
                health = health.data
                log.debug(tag,"health: ",health)
                this.apiVersion = health.version

                //market Status
                let markets = await this.pioneerApi.Status()
                markets = markets.data
                log.debug(tag,"markets: ",markets)
                this.markets = markets

                //get global info
                let userInfo = await this.pioneerApi.User()
                userInfo = userInfo.data
                log.debug(tag,"userInfo: ",userInfo)

                //if success false register username
                if(!userInfo.success){
                    //no wallets paired
                    // log.debug(tag,"user not registered!")
                    //
                    // let userInfo = {
                    //     queryKey:this.queryKey,
                    //     username:this.username
                    // }
                    // let registerUserResp = await this.pioneerApi.RegisterUser(null,userInfo)
                    // log.debug(tag,"registerUserResp: ",registerUserResp)
                } else if(userInfo.success) {
                    log.debug(tag,"userInfo: ",userInfo.success)
                    this.isPaired = true

                    //TODO sync balances
                    // if(userInfo.balances > 0){
                    //     this.balances = userInfo.balances
                    // }

                    if(userInfo.pubkeys)this.pubkeys = userInfo.pubkeys
                    //if(userInfo.wallets)this.wallets = userInfo.wallets

                    // this.pubkeys = userInfo.pubkeys
                    this.ibcChannels = userInfo.ibcChannels
                    this.nfts = userInfo.nfts
                    this.paymentStreams = userInfo.paymentStreams
                    this.totalValueUsd = parseFloat(userInfo.totalValueUsd)
                    this.context = userInfo.context
                    this.invocationContext = userInfo.invocationContext
                    this.assetContext = userInfo.assetContext
                    this.assetBalanceNativeContext = userInfo.assetBalanceNativeContext
                    this.assetBalanceUsdValueContext = userInfo.assetBalanceUsdValueContext
                }
                this.status = 'init'


                return this.pioneerApi
            }catch(e){
                log.error(tag,e)
                throw e
            }
        }
        this.startSocket = function () {
            let tag = TAG + " | startSocket | "
            try {
                let configEvents:any = {
                    queryKey:this.queryKey,
                    wss:this.wss
                }
                if(this.username) configEvents.username = this.username
                //sub to events
                log.debug(tag,"configEvents: ",configEvents)
                this.events = new Events.Events(config)
                this.events.init()

                if(this.username){
                    this.events.pair(this.username)
                }

                this.events.events.on('message', (event:any) => {
                    log.debug(tag,'message event! ',event);
                    this.isPaired = true
                    this.username = event.username
                    this.updateContext()
                    this.events.pair(this.username)

                    log.debug(tag,"EVENT type: ",event.type)

                });

                this.events.events.on('pairings', (event:any) => {
                    log.debug(tag,'message event! ',event);
                    this.isPaired = true
                    this.username = event.username
                    this.updateContext()
                    this.events.pair(this.username)

                    log.debug(tag,"EVENT type: ",event.type)

                });

                this.events.events.on('context', (event:any) => {
                    log.debug(tag,'context set to '+event.context);
                    this.context = event.context
                    this.updateContext()
                });

                this.events.events.on('pubkey', (event:any) => {
                    log.debug(tag,"pubkey event!", event)
                    //update pubkeys
                });

                this.events.events.on('balances', (event:any) => {
                    log.debug(tag,"balances event!", event)
                });

                //onSign
                this.events.events.on('invocations', async (event:any) => {
                    log.info("invocation: ",event)
                    if(this.HDWallet){
                        //TODO ask user for approval
                        //(only renderer will have HDWallet)
                        if(!event.invocationId) throw Error("invalid invocation!")
                        let invocationInfo = await this.getInvocation(event.invocationId)
                        log.info(tag,"invocationInfo: ",invocationInfo)
                        if(!invocationInfo?.invocation.unsignedTx.HDwalletPayload) throw Error("invalid invocation!")
                        //sign & broadcast
                        let signedTx = await this.signTx(invocationInfo.invocation.unsignedTx)
                        log.info(tag,"signedTx: ",signedTx)
                        // let broadcastResult = await this.broadcastTransaction(event.network,signedTx)
                        // log.info(tag,"broadcastResult: ",broadcastResult)
                        //TODO broadcast?
                    } else {
                        log.notice(tag,"Not Signing, no HDWallet found in process")
                    }
                });

                return this.events.events
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.checkBridge = async function () {
            let tag = TAG + " | checkBridge | "
            try {
                //bridge status
                log.debug(tag,"bridge: check")
                let bridgeStatus = await axios.get(this.bridge+"/status")
                return bridgeStatus.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getBridgeUser = async function () {
            let tag = TAG + " | getBridgeUser | "
            try {
                //bridge status
                log.debug(tag,"bridge: check")
                let bridgeStatus = await axios.get(this.bridge+"/user")
                return bridgeStatus.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getCodeInfo = async function (code:string) {
            let tag = TAG + " | getCodeInfo | "
            try {
                //get code
                let respPair = await this.pioneerApi.Pair({code})
                log.debug(tag,"respPair: ",respPair.data)

                return respPair.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.pair = async function (code:string) {
            let tag = TAG + " | pair | "
            try {
                //get code
                let respPair = await this.pioneerApi.Pair({code})
                log.debug(tag,"respPair: ",respPair.data)

                return respPair.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.pairBridge = async function () {
            let tag = TAG + " | pairBridge | "
            try {
                //bridge port
                //get code
                let code = await this.createPairingCode()
                log.debug(tag,"code: ",code)
                //send code to bridge

                let respPair = await axios({method:'GET',url: this.bridge+'/pair/'+code.code})
                log.debug(tag,"respPair: ",respPair.data)

                if(respPair.username){
                    this.username = respPair.username
                    await this.getUserInfo()
                }

                return respPair.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.updateUserInfo = function () {
            let tag = TAG + " | updateUserInfo | "
            try {
                this.events.disconnect()
                return this.events.events
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.stopSocket = function () {
            let tag = TAG + " | stopSocket | "
            try {
                this.events.disconnect()
                return this.events.events
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        /*
              Supported wallets:

                  Onboard.js

              TODO kepler

         */
        this.pairWallet = async function (walletType:string, wallet:any) {
            let tag = TAG + " | pairWallet | "
            try {
                //TODO error if server is offline
                let register
                if(!this.username) throw Error("username not set!")
                if(!this.pioneerApi) throw Error("pioneerApi not set!")
                if(walletType === 'onboard'){
                    if(wallet.network !== 1){
                        throw Error('Network not supported!')
                    }
                    this.context = wallet.name+":"+wallet.address
                    //register wallet
                    register = {
                        username:this.username,
                        blockchains:['ethereum'],
                        context:wallet.name+":"+wallet.address,
                        walletDescription:{
                            context:wallet.name+":"+wallet.address,
                            type:wallet.name
                        },
                        data:{
                            pubkeys:[
                                {
                                    "blockchain": "ethereum",
                                    "symbol": "ETH",
                                    "asset": "ETH",
                                    "path": "m/44'/60'/0'", //TODO capture from onBoard.js on user input paths. ie keepkey
                                    "script_type": "ethereum",
                                    "network": "ethereum",
                                    "type": "address",
                                    "created": new Date().getTime(),
                                    "tags": [
                                        wallet.name,
                                        "onboard",
                                        "sdk",
                                        wallet.name+":"+wallet.address
                                    ],
                                    "pubkey": wallet.address,
                                    "master": wallet.address,
                                    "address": wallet.address
                                }
                            ]
                        },
                        queryKey:this.queryKey,
                        auth:'lol',
                        provider:'lol'
                    }
                } else if (walletType === 'keepkey'){

                    //set SDK to HDwallet
                    this.HDWallet = wallet

                    //get pubkeys
                    let pubkeysResult = await this.getPubkeys()
                    log.debug(tag,"pubkeysResult: ",pubkeysResult)
                    this.context = pubkeysResult.context

                    //register
                    register = {
                        username:this.username,
                        blockchains:this.blockchains,
                        context:pubkeysResult.context,
                        walletDescription:{
                            context:pubkeysResult.context,
                            type:'keepkey'
                        },
                        data:{
                            pubkeys:pubkeysResult.pubkeys
                        },
                        queryKey:this.queryKey,
                        auth:'lol',
                        provider:'lol'
                    }
                } else if(walletType === 'native'){
                    log.debug(tag,"wallet: ",wallet)
                    log.debug(tag,"wallet: ",wallet)

                    //load wallet into local HDwallet
                    const nativeAdapterArgs: NativeAdapterArgs = {
                        mnemonic: wallet.mnemonic,
                        deviceId: 'test'
                    }
                    //
                    //set SDK to HDwallet
                    this.HDWallet = new NativeHDWallet(nativeAdapterArgs)
                    let resultInit = await this.HDWallet.initialize()
                    log.debug(tag,"resultInit: ",resultInit)
                    let isInitialized = this.HDWallet.isInitialized()
                    log.debug(tag,"isInitialized: ",isInitialized)
                    if(!isInitialized) throw Error("failed to initialize")

                    //get pubkeys
                    //get serailized wallet
                    let pubkeysResp = await this.getPubkeys()
                    let walletWatch = pubkeysResp.wallet
                    let pubkeys = pubkeysResp.pubkeys

                    this.context = walletWatch.WALLET_ID
                    log.debug(tag,"new context: ",this.context)

                    //register
                    register = {
                        username:this.username,
                        blockchains:this.blockchains,
                        context:this.context,
                        walletDescription:{
                            context:this.context,
                            type:'native'
                        },
                        data:{
                            pubkeys
                        },
                        queryKey:this.queryKey,
                        auth:'lol',
                        provider:'lol'
                    }
                }else{
                    throw Error("102: Unhandled format! "+walletType)
                }

                //for each blockchain/load chainadapter
                for(let i = 0; i < this.blockchains.length;i++){
                    let blockchain = this.blockchains[i]
                }


                log.debug(tag,"register payload: ",register)
                let result = await this.pioneerApi.Register(null, register)
                log.debug(tag,"register result: ",result)
                result = result.data

                //sub to key
                //sub to pairings
                this.events.subscribeToKey()

                //create code
                let pairingCode = await this.createPairingCode()
                log.debug(tag,"pairingCode: ",pairingCode)

                //now pair
                let resultPairing = await this.pioneerApi.Pair(null,{code:pairingCode.code})
                resultPairing = resultPairing.data
                log.debug(tag,"resultPairing: ",resultPairing.data)

                this.events.pair(this.username)

                //get user
                await this.updateContext()

                this.context = result.context
                this.pubkeys = result.pubkeys
                this.balances = result.balances

                return result
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        // @ts-ignore
        this.getNetwork = function () {
            let tag = TAG + " | getNetwork | "
            try {
                if(this.isTestnet){
                    return 'testnet'
                } else {
                    return 'mainnet'
                }
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getExplorerUrl = function (network:string) {
            let tag = TAG + " | getExplorerUrl | "
            try {
                return getExplorerUrl(network,'native',this.isTestnet)
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getExplorerAddressUrl = function (address:string,network:string) {
            let tag = TAG + " | getExplorerAddressUrl | "
            try {
                return getExplorerAddressUrl(address,network,'native',this.isTestnet)
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getExplorerTxUrl = function (tx:string,network:string) {
            let tag = TAG + " | getExplorerTxUrl | "
            try {
                return getExplorerTxUrl(tx,network,'native',this.isTestnet)
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getBlockHeight = async function (asset:string) {
            let tag = TAG + " | getBlockHeight | "
            try {
                //TODO move from asset to blockchain
                let result = await this.pioneerApi.BlockHeight({network:asset})
                return result.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getAddress = async function (asset:string, showOnDevice?:boolean) {
            let tag = TAG + " | getAddress | "
            try {
                let output = ""

                //filter by address
                let pubkey = this.pubkeys.filter((e:any) => e.symbol === asset)[0]

                // if(showOnDevice){
                //     //switch by asset
                //     let accountInfo = this.HDWallet.hdwallet.osmosisGetAccountPaths({ accountIdx: 0 })
                //     log.debug(tag,"accountInfo: ",accountInfo)
                //     let addressNList = accountInfo.addressNList
                //     let result = await this.HDWallet.hdwallet.osmosisGetAddress({
                //         addressNList,
                //         showDisplay: true,
                //     });
                //     log.debug(tag,"result: ",result)
                // }

                return pubkey.address
            } catch (e) {
                log.error(tag, "e: ", e)
                throw Error(e)
            }
        }
        // @ts-ignore
        this.validateAddress = function (address:string) {
            let tag = TAG + " | validateAddress | "
            try {
                //TODO



                return true
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getBalance = async function (address?: any, asset?: string, context?:string): Promise<any> {
            let tag = TAG + " | getBalance | "
            try {
                let output:any

                //if address get from api
                if(address) throw Error("Not supported")

                //if asset get all with symbol

                //if context filter by context

                //if multiple?

                //TODO if address
                //request to api
                //if no params
                //assume native on master
                // if(!address && !asset){
                //     let returnAssetAmount = ():number =>{
                //         //for pubkeys by symbol
                //         log.debug(tag,"info: ",this.info)
                //         let pubkey = this.info.pubkeys.filter((e:any) => e.symbol === asset)[0]
                //         log.debug(tag,"pubkey: ",pubkey)
                //         let balance = pubkey.balances.filter((e:any) => e.asset === asset)[0]
                //         return balance.balance
                //     }
                //
                //     let assetDescription: any = {
                //         // @ts-ignore
                //         chain:asset,
                //         symbol:asset,
                //         ticker:asset
                //     }
                //
                //     log.debug(tag,"returnAssetAmount",returnAssetAmount())
                //
                //     balances.push({
                //         asset: assetDescription,
                //         // @ts-ignore
                //         amount: assetToBase(assetAmount(returnAssetAmount(), getPrecision(asset))),
                //     })
                //
                // } else {
                //     throw Error("Not Supported yet")
                // }

                return output
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getTransactions = async function (address: string) {
            let tag = TAG + " | getTransactions | "
            try {
                //TODO
                //if xpub
                //if eth
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getTransactionData = async function (txid:string,asset:string) {
            let tag = TAG + " | getTransactionData | "
            try {
                if(!txid) throw Error("Txid is required!")
                log.debug("asset: ",asset)
                //TODO tech debt, send network instead of asset
                let output = await this.pioneerApi.GetTransaction({network:asset,txid,type:'thorchain'})
                return output.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getFees = async function (params?: any) {
            let tag = TAG + " | getFees | "
            try {
                let output = await this.pioneerApi.EstimateFeesWithGasPricesAndLimits(params)
                return output
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.createPairingCode = async function () {
            let tag = TAG + " | createPairingCode | "
            try {
                //
                let pairingBody:any = {
                    service:this.service,
                    url:this.url
                }
                //sub to pairings
                this.events.subscribeToKey()

                let result = await this.pioneerApi.CreatePairingCode(null, pairingBody)
                return result.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getUserInfo = async function () {
            let tag = TAG + " | getUserInfo | "
            try {
                let result = await this.updateContext()
                return result
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.setContext = async function (context:string) {
            let tag = TAG + " | setContext | "
            try {
                if(this.wallets && this.wallets.indexOf(context) >= 0){
                    this.context = context
                    let result = await this.pioneerApi.SetContext(null,{context:this.context})
                    return result.data
                }else{
                    return {success:false,error:"unknown context! context: "+context,options:this.wallets}
                }
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.setAssetContext = async function (asset:string) {
            let tag = TAG + " | setAssetContext | "
            try {
                if(asset && this.assetContext && this.assetContext !== asset){
                    this.assetContext = asset
                    let result = await this.pioneerApi.SetAssetContext(null,{asset:this.assetContext})
                    return result.data
                }else{
                    return {success:false,error:"already assetContext="+asset}
                }
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getInvocation = async function (invocationId:string) {
            let tag = TAG + " | getInvocations | "
            try {
                if(!invocationId) throw Error("invocationId required!")
                let result = await this.pioneerApi.Invocation(invocationId)
                //log.debug(tag,"result: ",result)
                return result.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getInvocations = async function () {
            let tag = TAG + " | getInvocations | "
            try {
                let result = await this.pioneerApi.Invocations()
                return result.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getWalletInfo = async function () {
            let tag = TAG + " | getWalletInfo | "
            try {
                let result = await this.pioneerApi.Info(this.context)
                return result.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.chart = async function (chart:any) {
            let tag = TAG + " | chart | "
            try {
                //
                let result = await this.pioneerApi.Chart(null,chart)
                return result.data

                return true
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        // this.replaceInvocation = async function (invocationId:string,fee:any) {
        //     let tag = TAG + " | replaceInvocation | "
        //     try {
        //         //
        //
        //         return true
        //     } catch (e) {
        //         log.error(tag, "e: ", e)
        //     }
        // }

        //SDK buildTx
        this.buildTx = async function (tx:any) {
            let tag = TAG + " | buildTx | "
            try {
                if(!tx.addressFrom) throw Error("invalid tx addressFrom required!")
                log.debug(tag,"tx: ",tx)

                //TODO use construction api

                //use txBuilder
                let unsginedTx = await this.txBuilder.buildTx(tx)
                return unsginedTx
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }


        this.signTx = async function (unsignedTx:any) {
            let tag = TAG + " | signTx | "
            try {
                if(!this.HDWallet) throw Error('Can not not sign if a HDWwallet is not paired!')
                log.info(tag,"unsignedTx: ",unsignedTx)
                if(!unsignedTx.HDwalletPayload) throw Error('Invalid payload! missing: HDwalletPayload')

                let context
                //TODO fix this crap, normalize unsginedTx object
                if(!unsignedTx.context && unsignedTx?.swap?.context){
                    context = unsignedTx.swap.context
                } else if(!unsignedTx.context && unsignedTx?.transaction.context){
                    context = unsignedTx.transaction.context
                }else if(unsignedTx.context){
                    context = unsignedTx.context
                }
                log.debug(tag,"context: ",context)
                if(!context) throw Error('Invalid payload! missing: context')
                log.debug(tag,"this.wallets: ",this.wallets)

                //TODO validate payload
                //TODO validate fee's
                //TODO load EV data
                //TODO validate recepiant from pioneer api

                let signedTx
                switch(unsignedTx.network) {
                    case 'ATOM':
                        signedTx = await this.HDWallet.hdwallet.cosmosSignTx(unsignedTx.HDwalletPayload)
                        log.debug(tag,"signedTx: ",signedTx)
                        break;
                    case 'OSMO':
                        log.debug(tag,"unsignedTx.HDwalletPayload: ",unsignedTx.HDwalletPayload)
                        signedTx = await this.HDWallet.osmosisSignTx(unsignedTx.HDwalletPayload)
                        log.debug(tag,"signedTx: ",signedTx)

                        let broadcastString = {
                            tx:signedTx,
                            type:"cosmos-sdk/StdTx",
                            mode:"sync"
                        }
                        const buffer = Buffer.from(JSON.stringify(broadcastString), 'base64');
                        //TODO
                        //let txid = cryptoTools.createHash('sha256').update(buffer).digest('hex').toUpperCase()

                        signedTx.serialized = JSON.stringify(broadcastString)
                        break;
                    case 'ETH':
                        signedTx = await this.HDWallet.ethSignTx(unsignedTx.HDwalletPayload)
                        log.info(tag,"signedTx: ",signedTx)

                        //TODO do txid hashing in HDwallet
                        const txid = keccak256(signedTx.serialized).toString('hex')
                        log.debug(tag,"txid: ",txid)
                        signedTx.txid = txid

                        break;
                    default:
                        throw Error("network not supported! "+unsignedTx.network)
                }



                return signedTx
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        /*
            All IBC coins have IBC functions
            cosmos osmosis
                soon? thorchain?

         */
        // this.ibcDeposit = async function (tx:IBCdeposit,asset:string) {
        //     let tag = TAG + " | ibcDeposit | "
        //     try {
        //         let coin = asset
        //
        //         if(!tx.fee) throw Error("103: fee required!")
        //
        //         //context
        //         log.debug(tag,"currentContext: ",this.context)
        //         log.debug(tag,"txContext: ",tx.context)
        //         if(tx.context){
        //             if(this.context !== tx.context){
        //                 //TODO validate context is valid
        //                 this.context = tx.context
        //             }
        //         } else {
        //             log.debug(tag,"using default context:",this.context)
        //             tx.context = this.context
        //         }
        //         if(!tx.context) throw Error("102: context is required on invocations!")
        //
        //         let timeout_height = tx.timeout_height
        //         let source_channel = tx.source_channel
        //         let source_port = tx.source_port
        //         let sender = tx.sender
        //         let receiver = tx.receiver
        //         let token = tx.token
        //
        //         if(!source_channel) throw Error("103: missing source_channel")
        //         if(!source_port) throw Error("104: missing source_port")
        //         if(!sender) throw Error("105: missing sender")
        //         if(!receiver) throw Error("106: missing receiver")
        //         if(!token) throw Error("107: missing token")
        //         if(!this.username) throw Error("108: missing username")
        //
        //         let memo = tx.memo || ''
        //         let invocation:Invocation = {
        //             type:'ibcdeposit',
        //             context:tx.context,
        //             username:this.username,
        //             coin,
        //             fee:tx.fee,
        //             network:coin,
        //             asset:coin,
        //             // @ts-ignore
        //             sender,
        //             receiver,
        //             token,
        //             timeout_height,
        //             source_channel,
        //             source_port,
        //             memo
        //         }
        //         if(tx.noBroadcast) invocation.noBroadcast = true
        //
        //         log.debug(tag,"invocation: ",invocation)
        //         let result = await this.invoke.invoke(invocation)
        //         if(!result) throw Error("Failed to create invocation!")
        //         log.debug("result: ",result)
        //
        //         return result.invocationId
        //     } catch (e) {
        //         log.error(tag, "e: ", e)
        //     }
        // }
        this.getValidators = async function () {
            let tag = TAG + " | getValidators | "
            try {
                let validators = await this.pioneerApi.GetValidators('osmosis')
                return validators.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        //get Delegation balance
        this.getDelegations = async function (validator:string,network:string,address:string) {
            let tag = TAG + " | getValidators | "
            try {
                let validators = await this.pioneerApi.GetDelegations({network,address,validator})
                return validators.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        //get Delegation balance
        this.getPool = async function (asset:string) {
            let tag = TAG + " | getPool | "
            try {
                let poolInfo = await this.pioneerApi.GetOsmosisPools()
                return poolInfo.data
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        //swap
        // this.swap = async function (tx:OsmosisSwap, asset:string) {
        //     let tag = TAG + " | delegate | "
        //     try {
        //         let coin = asset
        //
        //         if(!tx.fee) throw Error("103: fee required!")
        //
        //         //context
        //         log.debug(tag,"currentContext: ",this.context)
        //         log.debug(tag,"txContext: ",tx.context)
        //         if(tx.context){
        //             if(this.context !== tx.context){
        //                 //TODO validate context is valid
        //                 this.context = tx.context
        //             }
        //         } else {
        //             log.debug(tag,"using default context:",this.context)
        //             tx.context = this.context
        //         }
        //         if(!tx.context) throw Error("102: context is required on invocations!")
        //
        //         let routes = tx.routes
        //         let tokenIn = tx.tokenIn
        //         let tokenOutMinAmount = tx.tokenOutMinAmount
        //
        //         let memo = tx.memo || ''
        //
        //         if(!routes) throw Error("103: routes is required")
        //         if(!tokenIn) throw Error("104: tokenIn is required")
        //         if(!tokenOutMinAmount) throw Error("105: tokenOutMinAmount is required")
        //         if(!this.username) throw Error("106: username is required")
        //
        //         let invocation:Invocation = {
        //             type:'osmosisswap',
        //             context:tx.context,
        //             username:this.username,
        //             coin,
        //             fee:tx.fee,
        //             network:coin,
        //             asset:coin,
        //             // @ts-ignore
        //             routes,
        //             tokenIn,
        //             tokenOutMinAmount,
        //             memo
        //         }
        //         if(tx.noBroadcast) invocation.noBroadcast = true
        //
        //         log.debug(tag,"invocation: ",invocation)
        //         let result = await this.invoke.invoke(invocation)
        //         if(!result) throw Error("Failed to create invocation!")
        //         log.debug("result: ",result)
        //
        //         return result.invocationId
        //     } catch (e) {
        //         log.error(tag, "e: ", e)
        //     }
        // }
        //delegate
        this.delegate = async function (tx:any, asset:string) {
            let tag = TAG + " | delegate | "
            try {
                let coin = asset
                log.debug(tag,"tx: ",tx)
                log.debug(tag,"tx.amount: ",tx.amount)
                log.debug(tag,"tx.amount.amount(): ",tx.amount.amount())
                log.debug(tag,"tx.amount.amount().toFixed(): ",tx.amount.amount().toNumber())
                let amount = tx.amount.amount().toNumber()
                amount = nativeToBaseAmount(asset,amount)
                amount = amount.toString()

                log.debug(tag,"amount (final): ",amount)
                if(!amount) throw Error("Failed to get amount!")

                //TODO min transfer size 10$
                //TODO validate addresses
                //TODO validate midgard addresses not expired

                if(!tx.fee) throw Error("103: fee required!")

                //context
                log.debug(tag,"currentContext: ",this.context)
                log.debug(tag,"txContext: ",tx.context)
                if(tx.context){
                    if(this.context !== tx.context){
                        //TODO validate context is valid
                        this.context = tx.context
                    }
                } else {
                    log.debug(tag,"using default context:",this.context)
                    tx.context = this.context
                }
                if(!tx.context) throw Error("102: context is required on invocations!")
                if(!this.username) throw Error("103: username is required!")

                let validator = tx.validator
                let memo = tx.memo || ''
                let invocation:any = {
                    type:'delegate',
                    context:tx.context,
                    username:this.username,
                    coin,
                    fee:tx.fee,
                    network:coin,
                    asset:coin,
                    amount,
                    // @ts-ignore
                    validator,
                    memo
                }
                if(tx.noBroadcast) invocation.noBroadcast = true

                log.debug(tag,"invocation: ",invocation)
                let result = await this.invoke.invoke(invocation)
                if(!result) throw Error("Failed to create invocation!")
                log.debug("result: ",result)

                return result.invocationId
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        //redelegate
        this.redelegate = async function (tx:any, asset:string) {
            let tag = TAG + " | delegate | "
            try {
                let coin = asset
                log.debug(tag,"tx: ",tx)
                log.debug(tag,"tx.amount: ",tx.amount)
                log.debug(tag,"tx.amount.amount(): ",tx.amount.amount())
                log.debug(tag,"tx.amount.amount().toFixed(): ",tx.amount.amount().toNumber())
                let amount = tx.amount.amount().toNumber()
                amount = nativeToBaseAmount(asset,amount)
                amount = amount.toString()

                log.debug(tag,"amount (final): ",amount)
                if(!amount) throw Error("Failed to get amount!")

                //TODO min transfer size 10$
                //TODO validate addresses
                //TODO validate midgard addresses not expired

                if(!tx.fee) throw Error("103: fee required!")

                //context
                log.debug(tag,"currentContext: ",this.context)
                log.debug(tag,"txContext: ",tx.context)
                if(tx.context){
                    if(this.context !== tx.context){
                        //TODO validate context is valid
                        this.context = tx.context
                    }
                } else {
                    log.debug(tag,"using default context:",this.context)
                    tx.context = this.context
                }
                if(!tx.context) throw Error("102: context is required on invocations!")

                let validator = tx.validator
                let validatorOld = tx.validatorOld
                if(!validator) throw Error("validator required!")
                if(!validatorOld) throw Error("validatorOld required!")
                if(!this.username) throw Error("this.username required!")

                let memo = tx.memo || ''
                let invocation:any = {
                    type:'redelegate',
                    context:tx.context,
                    username:this.username,
                    coin,
                    fee:tx.fee,
                    network:coin,
                    asset:coin,
                    amount,
                    // @ts-ignore
                    validator,
                    // @ts-ignore
                    validatorOld,
                    memo
                }
                if(tx.noBroadcast) invocation.noBroadcast = true

                log.debug(tag,"invocation: ",invocation)
                let result = await this.invoke.invoke(invocation)
                if(!result) throw Error("Failed to create invocation!")
                log.debug("result: ",result)

                return result.invocationId
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        //redelegate
        this.joinPool = async function (tx:any, asset:string) {
            let tag = TAG + " | joinPool | "
            try {
                let coin = asset
                log.debug(tag,"tx: ",tx)


                //TODO min transfer size 10$
                //TODO validate addresses
                //TODO validate midgard addresses not expired

                if(!tx.fee) throw Error("103: fee required!")

                //context
                log.debug(tag,"currentContext: ",this.context)
                log.debug(tag,"txContext: ",tx.context)
                if(tx.context){
                    if(this.context !== tx.context){
                        //TODO validate context is valid
                        this.context = tx.context
                    }
                } else {
                    log.debug(tag,"using default context:",this.context)
                    tx.context = this.context
                }
                if(!tx.context) throw Error("102: context is required on invocations!")

                let poolId = tx.poolId
                let shareOutAmount = tx.shareOutAmount
                let tokenInMaxs = tx.tokenInMaxs
                if(!poolId) throw Error("poolId required!")
                if(!shareOutAmount) throw Error("shareOutAmount required!")
                if(!this.username) throw Error("username required!")

                let memo = tx.memo || ''
                let invocation:any = {
                    type:'osmosislpadd',
                    context:tx.context,
                    username:this.username,
                    coin,
                    fee:tx.fee,
                    network:coin,
                    asset:coin,
                    poolId,
                    shareOutAmount,
                    tokenInMaxs,
                    memo
                }
                if(tx.noBroadcast) invocation.noBroadcast = true

                log.debug(tag,"invocation: ",invocation)
                let result = await this.invoke.invoke(invocation)
                if(!result) throw Error("Failed to create invocation!")
                log.debug("result: ",result)

                return result.invocationId
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getFeeRates = async function () {
            let tag = TAG + " | getFeeRates | "
            try {

                let response = await this.pioneerApi.GetFeesWithMemo(null,{coin:'BTC',memo:''})
                response = response.data
                console.log("response: ",response)

                return response.rates
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        // @ts-ignore
        // this.getFeesWithMemo = async function (memo?:string) {
        //     let tag = TAG + " | getFeesWithMemo | "
        //     try {
        //         let params = {
        //             coin:'BTC',
        //             memo:"asdasdasdasdasda"
        //         }
        //         console.log("this.pioneerApi: ",this.pioneerApi)
        //         let response = await this.pioneerApi.GetFeesWithMemo(null,params)
        //         response = response.data
        //         console.log("response: ",response)
        //
        //         let output = {
        //             fees:{
        //                 type: 'byte',
        //                 average:{
        //                     amount:function(){
        //                         return new BigNumber(response.fees.average)
        //                     }
        //                 },
        //                 fast:{
        //                     amount:function(){
        //                         return new BigNumber(response.fees.fast)
        //                     }
        //                 },
        //                 fastest:{
        //                     amount:function(){
        //                         return new BigNumber(response.fees.fastest)
        //                     }
        //                 }
        //             }
        //         }
        //
        //         return output.fees
        //     } catch (e) {
        //         log.error(tag, "e: ", e)
        //     }
        // }
        this.getTxCount = async function (asset:string) {
            let tag = TAG + " | getTxCount | "
            try {

                //output
                let output = await this.pioneerApi.GetTxCount(this.getAddress(asset))
                return output.data

            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        // // @ts-ignore
        // this.estimateFeesWithGasPricesAndLimits = async function (params:any) {
        //     let tag = TAG + " | estimateFeesWithGasPricesAndLimits | "
        //     try {
        //         log.debug(tag,"params: ",params)
        //         let response = await this.pioneerApi.EstimateFeesWithGasPricesAndLimits(null,params)
        //         response = response.data
        //         let output = {
        //             gasPrices:response.gasPrices,
        //             fees:{
        //                 type: 'byte',
        //                 average:{
        //                     amount:function(){
        //                         return new BigNumber(response.fees.average)
        //                     }
        //                 },
        //                 fast:{
        //                     amount:function(){
        //                         return new BigNumber(response.fees.fast)
        //                     }
        //                 },
        //                 fastest:{
        //                     amount:function(){
        //                         return new BigNumber(response.fees.fastest)
        //                     }
        //                 }
        //             }
        //         }
        //
        //         return output
        //     } catch (e) {
        //         log.error(tag, "e: ", e)
        //     }
        // }
        this.approve = async function (asset:string,spender: string, sender: string, amount: string, noBroadcast?: boolean) {
            let tag = TAG + " | approve | "
            try {
                //
                let invocation:any = {
                    type:'approve',
                    username:this.username,
                    coin:asset,
                    contract:spender,
                    tokenAddress:sender,
                    amount:amount
                }
                if(noBroadcast) invocation.noBroadcast = true
                log.debug(tag,"invocation: ",invocation)
                let result = await this.invoke.invoke(invocation)
                console.log("result: ",result)


                return result.txid
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.replace = async function (invocationId:string,fee:any) {
            let tag = TAG + " | replace | "
            try {
                //
                if(!this.username) throw Error("not paired! this.username required!")
                let invocation:any = {
                    type:'replace',
                    invocationId,
                    context:this.context,
                    asset:'ETH',
                    network:'ETH',
                    username:this.username,
                    fee
                }
                let result = await this.invoke.invoke(invocation)
                log.debug("result: ",result)


                return result.invocationId
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        // @ts-ignore
        // this.estimateApproveFee = async function (contractAddress:string, asset: any) {
        //     let tag = TAG + " | getWallet | "
        //     try {
        //         //TODO figuremeout
        //         // const wallet = ethClient.getWallet();
        //         // const assetAddress = asset.symbol.slice(asset.ticker.length + 1);
        //         // const strip0x = (assetAddress.toUpperCase().indexOf('0X') === 0) ? assetAddress.substr(2) : assetAddress;
        //         // const checkSummedAddress = ethers.utils.getAddress(strip0x);
        //         // const contract = new ethers.Contract(checkSummedAddress, erc20ABI, wallet);
        //         // const estimateGas = await contract.estimateGas.approve(contractAddress, checkSummedAddress);
        //         // const prices = await ethClient.estimateGasPrices();
        //         // const minimumWeiCost = prices.average.amount().multipliedBy(estimateGas.toNumber());
        //
        //         //TODO actually estimate fee
        //         let response = 100000000
        //         return new BigNumber(response,18)
        //     } catch (e) {
        //         log.error(tag, "e: ", e)
        //     }
        // }
        // @ts-ignore
        // this.estimateFee = async function ({sourceAsset, ethClient, ethInbound, inputAmount, memo}: any) {
        //     let tag = TAG + " | estimateFee | "
        //     try {
        //
        //         let params = {
        //             coin:"ETH",
        //             network:"ETH",
        //             amount:assetToBase(assetAmount(inputAmount, 18)).amount().toFixed(),
        //             contract:"0x9d496De78837f5a2bA64Cb40E62c19FBcB67f55a",
        //             recipient:ethInbound.address,
        //             memo
        //         }
        //         let response = await this.pioneerApi.EstimateFeesWithGasPricesAndLimits(null,params)
        //         response = response.data
        //
        //         return new BigNumber(response,18)
        //     } catch (e) {
        //         log.error(tag, "e: ", e)
        //     }
        // }
        // @ts-ignore
        this.isApproved = async function (routerAddress:string,tokenAddress:string,amount:any) {
            let tag = TAG + " | isApproved | "
            try {
                amount = amount.amount().toNumber()
                if(amount === 0) throw Error("Failed to get a valid amount!")
                //
                let address = this.getAddress('ETH')
                let body = {
                    token:tokenAddress,
                    spender:routerAddress,
                    sender:address
                }

                let allowance = await this.pioneerApi.GetAllowance(null,body)
                allowance = allowance.data

                log.debug(tag,"allowance: ",allowance)
                log.debug(tag,"amount: ",amount)
                if(allowance > amount){
                    return true
                } else {
                    return false
                }
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.updateContext = async function () {
            let tag = TAG + " | updateContext | "
            try {
                //get info
                let userInfo = await this.pioneerApi.User()
                userInfo = userInfo.data
                log.debug(tag,"userInfo: ",userInfo)

                this.username = userInfo.username
                this.context = userInfo.context
                this.wallets = userInfo.wallets
                if(userInfo.balances)this.balances = userInfo.balances
                if(userInfo.pubkeys && this.pubkeys.length < userInfo.pubkeys.length)this.pubkeys = userInfo.pubkeys
                this.totalValueUsd = parseFloat(userInfo.totalValueUsd)
                this.invocationContext = userInfo.invocationContext
                this.assetContext = userInfo.assetContext
                this.assetBalanceNativeContext = userInfo.assetBalanceNativeContext
                this.assetBalanceUsdValueContext = userInfo.assetBalanceUsdValueContext

                return userInfo
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.updateInvocation = async function (updateBody:any) {
            let tag = TAG + " | updateInvocation | "
            try {
                let output = await this.pioneerApi.UpdateInvocation(null,updateBody)
                return output.data;
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.broadcastTransaction = async function (signedTx:any) {
            let tag = TAG + " | broadcastTransaction | "
            try {
                if(!signedTx.signedTx) throw Error("102: Unable to broadcast transaction! signedTx not found!")

                let invocation = await this.pioneerApi.Invocation(signedTx.invocationId)
                invocation = invocation.data
                log.debug(tag,"invocation: ",invocation)

                //context
                let context = this.context
                if(!context) {
                    throw Error("103: could not find context "+context)
                }

                //TODO fix this tech debt
                //normalize
                if(!invocation.network) invocation.network = invocation.invocation.network
                if(!invocation.invocation.invocationId) invocation.invocation.invocationId = invocation.invocation.invocationId
                if(!invocation.signedTx.network) invocation.signedTx.network = invocation.network
                if(!invocation.signedTx.invocationId) invocation.signedTx.invocationId = invocation.invocationId
                if(invocation.signedTx && invocation.noBroadcast) invocation.signedTx.noBroadcast = true
                if(invocation.signedTx && invocation.invocation.noBroadcast) invocation.signedTx.noBroadcast = true


                if(this.isTestnet && signedTx.network === 'BTC'){
                    signedTx.network = "TEST"
                }else{
                    signedTx.network = signedTx.network
                }
                log.debug(tag,"signedTx: ",signedTx)
                let resultBroadcast = await this.pioneerApi.Broadcast(null,invocation.signedTx)
                log.debug(tag,"resultBroadcast: ",resultBroadcast.data)
                return resultBroadcast.data;
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.invokeUnsigned = async function (tx:any,options:any,asset:string) {
            let tag = TAG + " | invokeUnsigned | "
            try {
                log.debug(tag,"deposit: ",tx)
                log.debug(tag,"options: ",options)
                if(!tx.unsignedTx) throw Error('unsigned Required!')
                //verbose
                let verbose
                let txidOnResp
                if(options){
                    verbose = options.verbose
                    txidOnResp = options.txidOnResp
                }

                let invocation:any = {
                    type:tx.type,
                    fee:tx.fee,
                    network:tx.network,
                    context:tx.context || this.context,
                    username:this.username,
                    unsignedTx:tx.unsignedTx,
                }

                log.debug(tag,"invocation: ",invocation)
                let result = await this.invoke.invoke(invocation)
                console.log("result: ",result)

                return result
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.deposit = async function (deposit:any,options:any,asset:string) {
            let tag = TAG + " | deposit | "
            try {
                log.debug(tag,"deposit: ",deposit)
                log.debug(tag,"options: ",options)

                //verbose
                let verbose
                let txidOnResp
                if(options){
                    verbose = options.verbose
                    txidOnResp = options.txidOnResp
                }

                //NOTE THIS IS ONLY Thorchain!
                let coin = asset

                //if native
                let amount = deposit.amount.toString()
                //amount = nativeToBaseAmount(asset,amount)
                log.debug(tag,"amount (final): ",amount)
                if(!amount) throw Error("Failed to get amount!")
                // if(typeof(amount) !== 'string')
                //TODO min transfer size 10$??
                //TODO validate addresses
                //TODO validate midgard addresses not expired

                let memo = deposit.memo || ''

                let invocation:any = {
                    type:'deposit',
                    context:this.context,
                    username:this.username,
                    inboundAddress:deposit.inboundAddress,
                    network:coin,
                    asset:coin,
                    coin,
                    amount,
                    memo
                }
                if(deposit.noBroadcast) invocation.noBroadcast = true

                log.debug(tag,"invocation: ",invocation)
                let result = await this.invoke.invoke('deposit',invocation)
                console.log("result: ",result.data)

                if(!verbose && !txidOnResp){
                    return result.data.invocationId
                } else if(!verbose && txidOnResp){
                    return result.data.txid
                }else if(verbose){
                    return result.data
                } else {
                    throw Error("102: Unhandled configs!")
                }

            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        // this.buildSwap = async function (swap:Swap,options:any, asset:string) {
        //     let tag = TAG + " | buildSwap | "
        //     try {
        //         if(!asset) throw Error("asset required!")
        //         if(!swap.addressFrom) throw Error("invalid swap input!")
        //
        //         log.debug(tag,"swap: ",swap)
        //         log.debug(tag,"options: ",options)
        //         //verbose
        //         let verbose
        //         let txidOnResp
        //         if(options){
        //             verbose = options.verbose
        //             txidOnResp = options.txidOnResp
        //         }
        //         let coin = asset
        //         log.debug(tag,"asset: ",asset)
        //         log.debug(tag,"swap: ",swap)
        //         log.debug(tag,"swap.amount: ",swap.amount)
        //         log.debug(tag,"tx.amount.amount(): ",swap.amount.amount())
        //         // log.debug(tag,"tx.amount.amount().toFixed(): ",swap.amount.amount().toNumber())
        //         let amount = swap.amount.amount()
        //         amount = nativeToBaseAmount(asset,amount)
        //         amount = amount.toString()
        //
        //         //if native
        //         // let amount = swap.amount.toString()
        //         //amount = nativeToBaseAmount(asset,amount)
        //         log.debug(tag,"amount (final): ",amount)
        //         if(!amount) throw Error("Failed to get amount!")
        //         if(!this.username) throw Error("Failed to get this.username!")
        //         // if(typeof(amount) !== 'string')
        //         //TODO min transfer size 10$??
        //         //TODO validate addresses
        //         //TODO validate midgard addresses not expired
        //
        //         let memo = swap.memo || ''
        //         if(!swap.addressFrom) throw Error("from address required!")
        //         let invocation:Invocation = {
        //             fee: {
        //                 priority:3
        //             },
        //             addressFrom:swap.addressFrom,
        //             context:this.context,
        //             type:'swap',
        //             username:this.username,
        //             inboundAddress:swap.inboundAddress,
        //             network:coin,
        //             asset:coin,
        //             coin,
        //             amount,
        //             memo
        //         }
        //         if(swap.noBroadcast) invocation.noBroadcast = true
        //
        //         log.debug(tag,"**** invocation: ",invocation)
        //         if(!invocation.addressFrom) throw Error("from address required!")
        //         let result = await this.invoke.invoke(invocation)
        //         log.debug(tag,"result: ",result)
        //
        //         if(!verbose && !txidOnResp){
        //             return result.invocationId
        //         } else if(!verbose && txidOnResp){
        //             return result.txid
        //         }else if(verbose){
        //             return result
        //         } else {
        //             throw Error("102: Unhandled configs!")
        //         }
        //
        //     } catch (e) {
        //         log.error(tag, "e: ", e)
        //     }
        // }
        this.transfer = async function (tx:any, options:any, asset:string) {
            let tag = TAG + " | transfer | "
            try {
                let verbose
                let txidOnResp
                if(options){
                    verbose = options.verbose
                    txidOnResp = options.txidOnResp
                }

                let coin = asset
                log.debug(tag,"asset: ",asset)
                log.debug(tag,"tx: ",tx)
                log.debug(tag,"tx.amount: ",tx.amount)
                log.debug(tag,"tx.amount.amount(): ",tx.amount.amount())
                log.debug(tag,"tx.amount.amount().toFixed(): ",tx.amount.amount().toNumber())
                let amount = tx.amount.amount().toNumber()
                log.debug(tag,"asset: ",asset)
                amount = nativeToBaseAmount(asset,amount)
                amount = amount.toString()

                log.debug(tag,"amount (final): ",amount)
                if(!amount) throw Error("Failed to get amount!")

                //TODO min transfer size 10$
                //TODO validate addresses
                //TODO validate midgard addresses not expired

                if(!tx.fee) throw Error("103: fee required!")

                //context
                log.debug(tag,"currentContext: ",this.context)
                log.debug(tag,"txContext: ",tx.context)
                if(tx.context){
                    if(this.context !== tx.context){
                        //TODO validate context is valid
                        this.context = tx.context
                    }
                } else {
                    log.debug(tag,"using default context:",this.context)
                    tx.context = this.context
                }
                if(!tx.context) throw Error("102: context is required on invocations!")

                let to = tx.recipient
                let memo = tx.memo || ''
                if(!to) throw Error("invalid TX missing recipient")
                if(!this.username) throw Error("this.username required")
                let invocation:any = {
                    type:'transfer',
                    context:tx.context,
                    username:this.username,
                    coin,
                    fee:tx.fee,
                    network:coin,
                    asset:coin,
                    amount,
                    address:to,
                    memo
                }
                if(tx.noBroadcast) invocation.noBroadcast = true

                log.debug(tag,"invocation: ",invocation)
                let result = await this.invoke.invoke(invocation)
                if(!result) throw Error("Failed to create invocation!")
                log.debug("result: ",result)

                if(!verbose && !txidOnResp){
                    return result.invocationId
                } else if(!verbose && txidOnResp){
                    return result.txid
                }else if(verbose){
                    return result
                } else {
                    throw Error("102: Unhandled configs!")
                }
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
    }
}

