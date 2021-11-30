/*

    Pioneer Wallet v2

    Class based wallet development

 */

const TAG = " | pioneer | "
const log = require("@pioneer-platform/loggerdog")()
const ripemd160 = require("crypto-js/ripemd160")
const CryptoJS = require("crypto-js")
const sha256 = require("crypto-js/sha256")
const bech32 = require(`bech32`)
const prettyjson = require('prettyjson');
const {
    getPaths,
    nativeToBaseAmount,
    baseAmountToNative,
    UTXO_COINS,
    COIN_MAP_KEEPKEY_LONG,
    COIN_MAP_LONG,
    getNativeAssetForBlockchain,
    addressNListToBIP32,
    bip32ToAddressNList,
    get_address_from_xpub
} = require('@pioneer-platform/pioneer-coins')

//support
import * as support from './support'

import { numberToHex } from 'web3-utils'
import {
    UnsignedTransaction,
    Transaction,
    SendToAddress,
    Config,
    BroadcastBody,
    Approval,
    Invocation,
    Balance,
    Deposit,
    HDWALLETS
} from "@pioneer-sdk/types";
//Pioneer follows OpenAPI spec
let pioneerApi = require("@pioneer-platform/pioneer-client")
import { FioActionParameters } from "fiosdk-offline";
//Highlander fork
const hdwallet = require("@bithighlander/hdwallet-core")

// SS public TODO catch up public repo
// const hdwallet = require("@shapeshiftoss/hdwallet-core")
// const pioneer = require("@shapeshiftoss/hdwallet-native")

//global
const keyring = new hdwallet.Keyring()

const HD_RUNE_KEYPATH="m/44'/931'/0'/0/0"
const RUNE_CHAIN="thorchain"
const RUNE_BASE=100000000
const HD_ATOM_KEYPATH="m/44'/118'/0'/0/0"
const ATOM_CHAIN="cosmoshub-4"
const ATOM_BASE=1000000
let GIG =  1000000000
const OSMO_CHAIN="osmosis-1"

function bech32ify(address:any, prefix:string) {
    const words = bech32.toWords(address)
    return bech32.encode(prefix, words)
}

function createBech32Address(publicKey:any,prefix:string) {
    const message = CryptoJS.enc.Hex.parse(publicKey.toString(`hex`))
    const hash = ripemd160(sha256(message)).toString()
    const address = Buffer.from(hash, `hex`)
    const cosmosAddress = bech32ify(address, prefix)
    return cosmosAddress
}

module.exports = class wallet {
    private queryKey: string | undefined;
    private username: string;
    private isTestnet: boolean | null;
    private spec: string;
    private buildSwap: (transaction: any) => Promise<string>;
    private blockchains: any;
    private init: () => Promise<void>;
    private pioneer: any;
    private buildTx: (transaction: any) => Promise<{}>;
    private buildTransfer: (transaction: Transaction) => Promise<any>;
    constructor(type:HDWALLETS,config:Config,isTestnet?:boolean) {
        this.isTestnet = false
        this.queryKey = config.queryKey
        this.username = config.username
        this.blockchains = config.blockchains
        this.spec = config.spec

        this.init = async function () {
            let tag = TAG + " | init_builder | "
            try{
                let pioneer = new pioneerApi(config.spec,config)
                this.pioneer = await pioneer.init()
            }catch(e){
                log.error(tag,e)
                throw e
            }
        }


        // @ts-ignore
        // this.addLiquidity = async function (addLiquidity:any) {
        //     let tag = TAG + " | addLiquidity | "
        //     try{
        //         let rawTx
        //
        //         let UTXOcoins = [
        //             'BTC',
        //             'BCH',
        //             'LTC'
        //         ]
        //
        //         //supported tokens
        //         //USDT SUSHI
        //
        //         if(addLiquidity.inboundAddress.chain === 'ETH'){
        //             //get tx inputs
        //             let addressFrom
        //             if(addLiquidity.addressFrom){
        //                 addressFrom = addLiquidity.addressFrom
        //             } else {
        //                 addressFrom = await this.getMaster('ETH')
        //             }
        //             if(!addressFrom) throw Error("102: unable to get master address! ")
        //
        //             let data = await this.pioneerClient.instance.GetThorchainMemoEncoded(null,addLiquidity)
        //             data = data.data
        //             log.debug(tag,"txData: ",data)
        //
        //             let nonceRemote = await this.pioneerClient.instance.GetNonce(addressFrom)
        //             nonceRemote = nonceRemote.data
        //             let nonce = addLiquidity.nonce || nonceRemote
        //             let gas_limit = 80000 //TODO dynamic gas limit?
        //             let gas_price = await this.pioneerClient.instance.GetGasPrice()
        //             gas_price = gas_price.data
        //             log.debug(tag,"gas_price: ",gas_price)
        //             gas_price = parseInt(gas_price)
        //             gas_price = gas_price + 1000000000
        //
        //             //sign
        //             //send FROM master
        //             let masterPathEth  = "m/44'/60'/0'/0/0" //TODO moveme to support
        //
        //             //if eth
        //             let amountNative = parseFloat(addLiquidity.amount) * support.getBase('ETH')
        //             amountNative = Number(parseInt(String(amountNative)))
        //             log.debug("amountNative: ",amountNative)
        //             log.debug("nonce: ",nonce)
        //
        //             //TODO if token
        //
        //             let ethTx = {
        //                 // addressNList: support.bip32ToAddressNList(masterPathEth),
        //                 "addressNList":[
        //                     2147483692,
        //                     2147483708,
        //                     2147483648,
        //                     0,
        //                     0
        //                 ],
        //                 nonce: numberToHex(nonce),
        //                 gasPrice: numberToHex(gas_price),
        //                 gasLimit: numberToHex(gas_limit),
        //                 value: numberToHex(amountNative),
        //                 to: addLiquidity.inboundAddress.router,
        //                 data,
        //                 // chainId: 1,//TODO testnet
        //             }
        //
        //             log.debug("unsignedTxETH: ",ethTx)
        //             //send to hdwallet
        //             rawTx = await this.WALLET.ethSignTx(ethTx)
        //             rawTx.params = ethTx
        //
        //             const txid = keccak256(rawTx.serialized).toString('hex')
        //             log.debug(tag,"txid: ",txid)
        //             rawTx.txid = txid
        //
        //         } else if(UTXOcoins.indexOf(addLiquidity.inboundAddress.chain) >= 0){
        //             if(!addLiquidity.memo) throw Error("Memo required for swaps!")
        //             //UTXO coins
        //             let coin = addLiquidity.inboundAddress.chain
        //             let addressFrom = await this.getMaster(coin) //TODO this silly in utxo
        //             //build transfer with memo
        //             let transfer:Transaction = {
        //                 coin:"BTC",
        //                 asset:"BTC",
        //                 network:"BTC",
        //                 addressTo:addLiquidity.inboundAddress.address,
        //                 addressFrom,
        //                 amount:addLiquidity.amount,
        //                 feeLevel:addLiquidity.feeLevel,
        //                 memo:addLiquidity.memo
        //             }
        //
        //             rawTx = await this.buildTransfer(transfer)
        //             console.log("rawTx: ",rawTx)
        //
        //         } else {
        //             throw Error("Chain not supported! "+addLiquidity.inboundAddress.chain)
        //         }
        //
        //         return rawTx
        //     }catch(e){
        //         log.error(e)
        //         throw e
        //     }
        // },
        // this.buildApproval = async function (approval:any) {
        //     let tag = TAG + " | buildApproval | "
        //     try{
        //         let rawTx
        //
        //         let addressFrom = await this.getMaster('ETH')
        //
        //         let nonceRemote = await this.pioneerClient.instance.GetNonce(addressFrom)
        //         nonceRemote = nonceRemote.data
        //         let nonce = approval.nonce || nonceRemote
        //         let gas_limit = 80000 //TODO dynamic gas limit?
        //         let gas_price = await this.pioneerClient.instance.GetGasPrice()
        //         gas_price = gas_price.data
        //         log.debug(tag,"gas_price: ",gas_price)
        //         gas_price = parseInt(gas_price)
        //         gas_price = gas_price + 1000000000
        //
        //         log.debug(tag,"approval.tokenAddress: ",approval.tokenAddress)
        //         log.debug(tag,"approval.amount: ",approval.amount)
        //
        //         let data =
        //             "0x" +
        //             "095ea7b3" + // ERC-20 contract approve function identifier
        //             (approval.contract).replace("0x", "").padStart(64, "0") +
        //             (approval.amount).toString(16).padStart(64, "0");
        //
        //         log.debug(tag,"data: ",data)
        //
        //         let ethTx = {
        //             // addressNList: support.bip32ToAddressNList(masterPathEth),
        //             "addressNList":[
        //                 2147483692,
        //                 2147483708,
        //                 2147483648,
        //                 0,
        //                 0
        //             ],
        //             nonce: numberToHex(nonce),
        //             gasPrice: numberToHex(gas_price),
        //             gasLimit: numberToHex(gas_limit),
        //             value: numberToHex(0),
        //             to: approval.tokenAddress,
        //             data,
        //             // chainId: 1,//TODO testnet
        //         }
        //         log.debug("unsignedTxETH: ",ethTx)
        //
        //         return ethTx
        //     }catch(e){
        //         log.error(e)
        //         throw e
        //     }
        // },
        // this.deposit = async function (deposit:Deposit) {
        //         let tag = TAG + " | deposit | "
        //         try{
        //             let rawTx
        //             log.debug(tag,"deposit: ",deposit)
        //
        //             if(deposit.network === 'RUNE') {
        //                 //use msgDeposit
        //                 //get amount native
        //                 let amountNative = RUNE_BASE * parseFloat(deposit.amount)
        //                 amountNative = parseInt(amountNative.toString())
        //
        //                 let addressFrom
        //                 if(deposit.addressFrom){
        //                     addressFrom = deposit.addressFrom
        //                 } else {
        //                     addressFrom = await this.getMaster('RUNE')
        //                 }
        //
        //                 //get account number
        //                 log.debug(tag,"addressFrom: ",addressFrom)
        //                 let masterInfo = await this.pioneerClient.instance.GetAccountInfo({network:'RUNE',address:addressFrom})
        //                 masterInfo = masterInfo.data
        //                 log.debug(tag,"masterInfo: ",masterInfo.data)
        //
        //                 let sequence = masterInfo.result.value.sequence || 0
        //                 let account_number = masterInfo.result.value.account_number
        //                 sequence = parseInt(sequence)
        //                 sequence = sequence.toString()
        //
        //                 let txType = "thorchain/MsgDeposit"
        //                 let gas = "250000"
        //                 let fee = "2000000"
        //                 if(!deposit.memo) throw Error("103: invalid swap! missing memo")
        //                 let memo = deposit.memo
        //
        //                 //sign tx
        //                 let unsigned = {
        //                     "fee": {
        //                         "amount": [
        //                             {
        //                                 "amount": fee,
        //                                 "denom": "rune"
        //                             }
        //                         ],
        //                         "gas": gas
        //                     },
        //                     "memo": memo,
        //                     "msg": [
        //                         {
        //                             "type": txType,
        //                             "value": {
        //                                 "amount": [
        //                                     {
        //                                         "amount": "50994000",
        //                                         "asset": "THOR.RUNE"
        //                                     }
        //                                 ],
        //                                 "memo": memo,
        //                                 "signer": addressFrom
        //                             }
        //                         }
        //                     ],
        //                     "signatures": null
        //                 }
        //
        //                 let	chain_id = RUNE_CHAIN
        //
        //                 if(!sequence) throw Error("112: Failed to get sequence")
        //                 if(!account_number) account_number = 0
        //
        //                 //TODO double check? this broke?
        //                 // //verify from address
        //                 // let fromAddress = await this.WALLET.thorchainGetAddress({
        //                 //     addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
        //                 //     showDisplay: false,
        //                 // });
        //                 // log.debug(tag,"fromAddressHDwallet: ",fromAddress)
        //                 // log.debug(tag,"fromAddress: ",addressFrom)
        //                 let fromAddress = addressFrom
        //
        //                 log.debug("res: ",prettyjson.render({
        //                     addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
        //                     chain_id,
        //                     account_number: account_number,
        //                     sequence:sequence,
        //                     tx: unsigned,
        //                 }))
        //
        //                 if(fromAddress !== addressFrom) {
        //                     log.error(tag,"fromAddress context WALLET: ",fromAddress)
        //                     log.error(tag,"fromAddress DEPOSIT: ",addressFrom)
        //                     throw Error("Can not sign, address mismatch")
        //                 }
        //
        //                 log.debug(tag,"******* signTx: ",JSON.stringify({
        //                     addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
        //                     chain_id,
        //                     account_number: account_number,
        //                     sequence:sequence,
        //                     tx: unsigned,
        //                 }))
        //
        //                 let runeTx = {
        //                     addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
        //                     chain_id,
        //                     account_number: account_number,
        //                     sequence:sequence,
        //                     tx: unsigned,
        //                 }
        //
        //                 //
        //                 let unsignedTx:UnsignedTransaction = {
        //                     invocationId:deposit.invocationId,
        //                     network:deposit.network,
        //                     deposit,
        //                     HDwalletPayload:runeTx,
        //                     verbal:"Thorchain transaction"
        //                 }
        //
        //                 rawTx = unsignedTx
        //
        //             } else {
        //                 throw Error("Chain not supported! "+deposit.inboundAddress.chain)
        //             }
        //
        //             return rawTx
        //         }catch(e){
        //             log.error(e)
        //             throw e
        //         }
        //     },
        //@ts-ignore

        /*
        let swap = {
            inboundAddress: {
                chain: 'ETH',
                pub_key: 'tthorpub1addwnpepqvuy8vh6yj4h28xp6gfpjsztpj6p46y2rs0763t6uw9f6lkky0ly5uvwla6',
                address: '0x36286e570c412531aad366154eea9867b0e71755',
                router: '0x9d496De78837f5a2bA64Cb40E62c19FBcB67f55a',
                halted: false
            },
            asset: {
                chain: 'ETH',
                symbol: 'ETH',
                ticker: 'ETH',
                iconPath: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/ETH-1C9/logo.png'
            },
            memo: '=:THOR.RUNE:tthor1veu9u5h4mtdq34fjgu982s8pympp6w87ag58nh',
            amount: "0.1"
        }
        */
        //TODO type
        // @ts-ignore
        this.buildSwap = async function (swap:any) {
            let tag = TAG + " | buildSwap | "
            try{
                let rawTx
                log.debug(tag,"swap: ",swap)

                let UTXOcoins = [
                    'BTC',
                    'BCH',
                    'LTC'
                ]

                if(swap.inboundAddress.chain === 'ETH'){
                    //get tx inputs
                    let addressFrom
                    if(swap.addressFrom){
                        addressFrom = swap.addressFrom
                    }
                    if(!addressFrom) throw Error("102: unable to get master address! ")

                    let data = await this.pioneer.instance.GetThorchainMemoEncoded(null,swap)
                    data = data.data
                    log.debug(tag,"txData: ",data)

                    let nonceRemote = await this.pioneer.instance.GetNonce(addressFrom)
                    nonceRemote = nonceRemote.data
                    let nonce = swap.nonce || nonceRemote
                    let gas_limit = 80000 //TODO dynamic gas limit?
                    let gas_price = await this.pioneer.instance.GetGasPrice()
                    gas_price = gas_price.data
                    log.debug(tag,"gas_price: ",gas_price)
                    gas_price = parseInt(gas_price)
                    gas_price = gas_price + 1000000000

                    //if eth
                    let amountNative = parseFloat(swap.amount) * support.getBase('ETH')
                    amountNative = Number(parseInt(String(amountNative)))
                    log.debug("amountNative: ",amountNative)
                    log.debug("nonce: ",nonce)

                    //TODO if token
                    let ethTx = {
                        // addressNList: support.bip32ToAddressNList(masterPathEth),
                        "addressNList":[
                            2147483692,
                            2147483708,
                            2147483648,
                            0,
                            0
                        ],
                        nonce: numberToHex(nonce),
                        gasPrice: numberToHex(gas_price),
                        gasLimit: numberToHex(gas_limit),
                        value: numberToHex(amountNative),
                        to: swap.inboundAddress.router,
                        data,
                        chainId: 1
                    }
                    log.debug("unsignedTxETH: ",ethTx)
                    rawTx = {
                        network:'ETH',
                        asset:'ETH',
                        swap,
                        HDwalletPayload:ethTx,
                        verbal:"Ethereum transaction"
                    }

                } else if(swap.inboundAddress.chain === 'RUNE') {
                    //use msgDeposit
                    //get amount native
                    // let amountNative = RUNE_BASE * parseFloat(swap.amount)
                    // amountNative = parseInt(amountNative.toString())
                    //
                    // let addressFrom
                    // if(swap.addressFrom){
                    //     addressFrom = swap.addressFrom
                    // } else {
                    //     addressFrom = await this.getMaster('ETH')
                    // }
                    //
                    // //get account number
                    // log.debug(tag,"addressFrom: ",addressFrom)
                    // let masterInfo = await this.pioneerClient.instance.GetAccountInfo({network:'RUNE',address:addressFrom})
                    // masterInfo = masterInfo.data
                    // log.debug(tag,"masterInfo: ",masterInfo.data)
                    //
                    // let sequence = masterInfo.result.value.sequence || 0
                    // let account_number = masterInfo.result.value.account_number
                    // sequence = parseInt(sequence)
                    // sequence = sequence.toString()
                    //
                    // let txType = "thorchain/MsgSend"
                    // let gas = "250000"
                    // let fee = "2000000"
                    // if(!swap.memo) throw Error("103: invalid swap! missing memo")
                    // let memo = swap.memo
                    //
                    // if(!swap.inboundAddress.address) throw Error("104: invalid inboundAddress on swap")
                    // //sign tx
                    // let unsigned = {
                    //     "fee": {
                    //         "amount": [
                    //             {
                    //                 "amount": fee,
                    //                 "denom": "rune"
                    //             }
                    //         ],
                    //         "gas": gas
                    //     },
                    //     "memo": memo,
                    //     "msg": [
                    //         {
                    //             "type": txType,
                    //             "value": {
                    //                 "amount": [
                    //                     {
                    //                         "amount": amountNative.toString(),
                    //                         "denom": "rune"
                    //                     }
                    //                 ],
                    //                 "from_address": addressFrom,
                    //                 "to_address": swap.inboundAddress.address
                    //             }
                    //         }
                    //     ],
                    //     "signatures": null
                    // }
                    //
                    // let	chain_id = RUNE_CHAIN
                    //
                    // if(!sequence) throw Error("112: Failed to get sequence")
                    // if(!account_number) account_number = 0
                    //
                    // //verify from address
                    // let fromAddress = await this.WALLET.thorchainGetAddress({
                    //     addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
                    //     showDisplay: false,
                    // });
                    // log.debug(tag,"fromAddressHDwallet: ",fromAddress)
                    // log.debug(tag,"fromAddress: ",addressFrom)
                    //
                    // log.debug("res: ",prettyjson.render({
                    //     addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
                    //     chain_id,
                    //     account_number: account_number,
                    //     sequence:sequence,
                    //     tx: unsigned,
                    // }))
                    //
                    // if(fromAddress !== addressFrom) {
                    //     log.error(tag,"fromAddress: ",fromAddress)
                    //     log.error(tag,"addressFrom: ",addressFrom)
                    //     throw Error("Can not sign, address mismatch")
                    // }
                    //
                    // log.debug(tag,"******* signTx: ",JSON.stringify({
                    //     addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
                    //     chain_id,
                    //     account_number: account_number,
                    //     sequence:sequence,
                    //     tx: unsigned,
                    // }))
                    //
                    // let runeTx = {
                    //     addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
                    //     chain_id,
                    //     account_number: account_number,
                    //     sequence:sequence,
                    //     tx: unsigned,
                    // }
                    //
                    // //
                    // let unsignedTx = {
                    //     network:'ETH',
                    //     asset:'ETH',
                    //     swap,
                    //     HDwalletPayload:runeTx,
                    //     verbal:"Thorchain transaction"
                    // }
                    //
                    // rawTx = unsignedTx

                }else if(UTXOcoins.indexOf(swap.inboundAddress.chain) >= 0){
                    throw Error("NOT SUPPORTED! Use transfer with memo!")

                } else {
                    throw Error("Chain not supported! "+swap.inboundAddress.chain)
                }

                return rawTx
            }catch(e){
                log.error(e)
                throw e
            }
        }
        /*
                CatchAll for custom Tx's
         */
        this.buildTx = async function (transaction:any) {
            let tag = TAG + " | buildTx | "
            try{
                let rawTx = {}

                switch(transaction.type) {
                    case 'ibcdeposit':
                        log.info(tag,"creating an ibcdeposit! ")
                        if(!transaction.network) throw Error("103: network required!")
                        if(!transaction.asset) throw Error("104: asset required!")
                        //TODO dont assume cosmos dumbass
                        let amountNative = ATOM_BASE * parseFloat(transaction.amount)
                        amountNative = parseInt(amountNative.toString())
                        log.debug(tag,"amountNative: ",amountNative)

                        //get account number
                        let addressFrom
                        if(transaction.addressFrom){
                            addressFrom = transaction.addressFrom
                        }
                        if(!addressFrom) throw Error("From address required!")

                        let masterInfo = await this.pioneer.instance.GetAccountInfo({network:'ATOM',address:addressFrom})
                        log.info(tag,"masterInfo: ",masterInfo)
                        masterInfo = masterInfo.data
                        log.info(tag,"masterInfo: ",masterInfo)
                        log.info(tag,"masterInfo: ",masterInfo.result)
                        log.info(tag,"masterInfo: ",masterInfo.result.value)
                        log.info(tag,"masterInfo: ",masterInfo.result.value.sequence)
                        log.info(tag,"masterInfo: ",masterInfo.result.value.account_number)
                        let sequence = masterInfo.result.value.sequence
                        if(!sequence) sequence = 0
                        let account_number = masterInfo.result.value.account_number
                        if(!account_number) throw Error("can not build a transaction without an account_number (account never held funds!)")
                        sequence = parseInt(sequence)
                        sequence = sequence.toString()
                        let	chain_id = ATOM_CHAIN

                        let msg:any
                        switch(transaction.type) {
                            case "ibcdeposit":
                                if(!transaction.source_port) throw Error("Missing source_port !")
                                if(!transaction.source_channel) throw Error("Missing source_channel!")
                                if(!transaction.token) throw Error("Missing token!")
                                if(!transaction.timeout_height) throw Error("Missing timeout_height!")

                                msg = {
                                    "type":"cosmos-sdk/MsgTransfer",
                                    "value":{
                                        "sender":transaction.sender,
                                        "receiver":transaction.receiver,
                                        "source_port":transaction.source_port,
                                        "source_channel":transaction.source_channel,
                                        "token":transaction.token,
                                        "timeout_height":transaction.timeout_height,
                                    }
                                }

                                break;
                            default:
                                throw Error("unsupported IBC tx type: "+transaction.type)
                            //code block
                        }
                        let txType = "cosmos-sdk/MsgSend"
                        let gas = "100000"
                        let fee = "1000"
                        let memo = transaction.memo || ""

                        if(!msg) throw Error('failed to make tx msg')

                        let unsigned = {
                            "fee": {
                                "amount": [
                                    {
                                        "amount": fee,
                                        "denom": "uatom"
                                    }
                                ],
                                "gas": gas
                            },
                            "memo": memo,
                            "msg": [
                                msg
                            ],
                            "signatures": null
                        }

                        if(!sequence) throw Error("112: Failed to get sequence")
                        if(!account_number) throw Error("113: Failed to get account_number")

                        log.debug(tag,"fromAddress: ",addressFrom)

                        log.debug("res: ",prettyjson.render({
                            addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
                            chain_id,
                            account_number: account_number,
                            sequence:sequence,
                            tx: unsigned,
                        }))

                        //if(fromAddress !== addressFrom) throw Error("Can not sign, address mismatch")
                        let atomTx = {
                            addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
                            chain_id:ATOM_CHAIN,
                            account_number: account_number,
                            sequence:sequence,
                            tx: unsigned,
                        }

                        let unsignedTx = {
                            network:transaction.network,
                            asset:transaction.asset,
                            transaction,
                            HDwalletPayload:atomTx,
                            verbal:"ibc transaction"
                        }

                        rawTx = unsignedTx
                        break;
                    case 'transfer':
                        rawTx = this.buildTransfer(transaction)
                        break;
                    default:
                        throw Error("unHandled Tx type!")
                    // code block
                }

                //if ibc
                //TODO flag of ibc?
        //         if(transaction.type === 'ibcdeposit'){
        //             log.info(tag,"creating an ibcdeposit! ")
        //             if(!transaction.network) throw Error("103: network required!")
        //             if(!transaction.asset) throw Error("104: asset required!")
        //             //TODO dont assume cosmos dumbass
        //             let amountNative = ATOM_BASE * parseFloat(transaction.amount)
        //             amountNative = parseInt(amountNative.toString())
        //             log.debug(tag,"amountNative: ",amountNative)
        //
        //             //get account number
        //             let addressFrom
        //             if(transaction.addressFrom){
        //                 addressFrom = transaction.addressFrom
        //             }
        //             if(!addressFrom) throw Error("From address required!")
        //
        //             let masterInfo = await this.pioneer.instance.GetAccountInfo({network:'ATOM',address:addressFrom})
        //             log.info(tag,"masterInfo: ",masterInfo)
        //             masterInfo = masterInfo.data
        //             log.info(tag,"masterInfo: ",masterInfo)
        //             log.info(tag,"masterInfo: ",masterInfo.result)
        //             log.info(tag,"masterInfo: ",masterInfo.result.value)
        //             log.info(tag,"masterInfo: ",masterInfo.result.value.sequence)
        //             log.info(tag,"masterInfo: ",masterInfo.result.value.account_number)
        //             let sequence = masterInfo.result.value.sequence
        //             if(!sequence) sequence = 0
        //             let account_number = masterInfo.result.value.account_number
        //             if(!account_number) throw Error("can not build a transaction without an account_number (account never held funds!)")
        //             sequence = parseInt(sequence)
        //             sequence = sequence.toString()
        //             let	chain_id = ATOM_CHAIN
        //
        //             let msg:any
        //             switch(transaction.type) {
        //                 case "ibcdeposit":
        //                     if(!transaction.source_port) throw Error("Missing source_port !")
        //                     if(!transaction.source_channel) throw Error("Missing source_channel!")
        //                     if(!transaction.token) throw Error("Missing token!")
        //                     if(!transaction.timeout_height) throw Error("Missing timeout_height!")
        //
        //                     msg = {
        //                         "type":"cosmos-sdk/MsgTransfer",
        //                         "value":{
        //                             "sender":transaction.sender,
        //                             "receiver":transaction.receiver,
        //                             "source_port":transaction.source_port,
        //                             "source_channel":transaction.source_channel,
        //                             "token":transaction.token,
        //                             "timeout_height":transaction.timeout_height,
        //                         }
        //                     }
        //
        //                     break;
        //                 default:
        //                     throw Error("unsupported IBC tx type: "+transaction.type)
        //                 //code block
        //             }
        //             let txType = "cosmos-sdk/MsgSend"
        //             let gas = "100000"
        //             let fee = "1000"
        //             let memo = transaction.memo || ""
        //
        //             if(!msg) throw Error('failed to make tx msg')
        //
        //             let unsigned = {
        //                 "fee": {
        //                     "amount": [
        //                         {
        //                             "amount": fee,
        //                             "denom": "uatom"
        //                         }
        //                     ],
        //                     "gas": gas
        //                 },
        //                 "memo": memo,
        //                 "msg": [
        //                     msg
        //                 ],
        //                 "signatures": null
        //             }
        //
        //             if(!sequence) throw Error("112: Failed to get sequence")
        //             if(!account_number) throw Error("113: Failed to get account_number")
        //
        //             log.debug(tag,"fromAddress: ",addressFrom)
        //
        //             log.debug("res: ",prettyjson.render({
        //                 addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
        //                 chain_id,
        //                 account_number: account_number,
        //                 sequence:sequence,
        //                 tx: unsigned,
        //             }))
        //
        //             //if(fromAddress !== addressFrom) throw Error("Can not sign, address mismatch")
        //             let atomTx = {
        //                 addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
        //                 chain_id:ATOM_CHAIN,
        //                 account_number: account_number,
        //                 sequence:sequence,
        //                 tx: unsigned,
        //             }
        //
        //             let unsignedTx = {
        //                 network:transaction.network,
        //                 asset:transaction.asset,
        //                 transaction,
        //                 HDwalletPayload:atomTx,
        //                 verbal:"ibc transaction"
        //             }
        //
        //             rawTx = unsignedTx
        //
        //         }else if(transaction.network === 'FIO'){
        //
        //             //types
        //             let tx:any
        //             let signTx:any
        //             let res:any
        //             // switch(transaction.type) {
        //             //     case "fioSignAddPubAddressTx":
        //             //         tx = transaction.tx
        //             //         signTx = {
        //             //             addressNList: bip32ToAddressNList("m/44'/235'/0'/0/0"),
        //             //             actions: [
        //             //                 {
        //             //                     account: FioActionParameters.FioAddPubAddressActionAccount,
        //             //                     name: FioActionParameters.FioAddPubAddressActionName,
        //             //                     data:tx,
        //             //                 },
        //             //             ],
        //             //         }
        //             //         log.debug(tag,"signTx: ",JSON.stringify(signTx))
        //             //         res = await this.WALLET.fioSignTx(signTx);
        //             //         res.coin = "FIO"
        //             //         res.type = transaction.type
        //             //         rawTx = res
        //             //         // code block
        //             //         break;
        //             //     case "fioSignRegisterDomainTx":
        //             //         // code block
        //             //         break;
        //             //     case "fioSignRegisterFioAddressTx":
        //             //         // code block
        //             //         break;
        //             //     case "fioSignNewFundsRequestTx":
        //             //         tx = transaction.tx
        //             //         signTx = {
        //             //             addressNList: bip32ToAddressNList("m/44'/235'/0'/0/0"),
        //             //             actions: [
        //             //                 {
        //             //                     account: FioActionParameters.FioNewFundsRequestActionAccount,
        //             //                     name: FioActionParameters.FioNewFundsRequestActionName,
        //             //                     data:tx,
        //             //                 },
        //             //             ],
        //             //         }
        //             //         log.debug(tag,"signTx: ",JSON.stringify(signTx))
        //             //         res = await this.WALLET.fioSignTx(signTx);
        //             //         res.coin = "FIO"
        //             //         res.type = transaction.type
        //             //         rawTx = res
        //             //         break;
        //             //     default:
        //             //     //code block
        //             // }
        //
        //
        //         } else if(transaction.network === 'osmosis' || transaction.network === 'OSMO'){
        //             log.debug(tag,"transaction: ",transaction)
        //
        //             //types
        //             let tx:any
        //             let signTx:any
        //             let res:any
        //
        //             //common
        //             //get amount native
        //
        //             let amountNative = ATOM_BASE * parseFloat(transaction.amount)
        //             amountNative = parseInt(amountNative.toString())
        //             log.debug(tag,"amountNative: ",amountNative)
        //
        //             //get account number
        //             let addressFrom
        //             if(transaction.addressFrom){
        //                 addressFrom = transaction.addressFrom
        //             }
        //             let masterInfo = await this.pioneer.instance.GetAccountInfo({network:'OSMO',address:addressFrom})
        //             masterInfo = masterInfo.data
        //             log.debug(tag,"masterInfo: ",masterInfo.data)
        //
        //             let sequence = masterInfo.result.value.sequence
        //             let account_number = masterInfo.result.value.account_number
        //             sequence = parseInt(sequence)
        //             if(!sequence || isNaN(sequence)) sequence = 0
        //             sequence = sequence.toString()
        //             let	chain_id = OSMO_CHAIN
        //
        //             let msg:any
        //             switch(transaction.type) {
        //                 case "delegate":
        //                     if(!transaction.validator) throw Error("Missing validator address!")
        //
        //                     msg = {
        //                         "type":"cosmos-sdk/MsgDelegate",
        //                         "value":{
        //                             "delegator_address":addressFrom,
        //                             "validator_address":transaction.validator,
        //                             "amount":
        //                                 {
        //                                     "denom":"uosmo",
        //                                     "amount":amountNative.toString()
        //                                 }
        //
        //                         }
        //                     }
        //
        //                     break;
        //                 case "redelegate":
        //                     if(!transaction.validatorOld) throw Error("102: Missing validatorOld!")
        //                     if(!transaction.validator) throw Error("103: Missing validator!")
        //
        //                     msg = {
        //                         "type":"cosmos-sdk/MsgBeginRedelegate",
        //                         "value":{
        //                             "delegator_address":addressFrom,
        //                             "validator_src_address":transaction.validatorOld,
        //                             "validator_dst_address":transaction.validator,
        //                             "amount":
        //                                 {
        //                                     "denom":"uosmo",
        //                                     "amount":amountNative.toString()
        //                                 }
        //                         }
        //                     }
        //
        //                     break;
        //                 case "osmosislpadd":
        //                     if(!transaction.poolId) throw Error("102: Missing poolId!")
        //                     if(!transaction.shareOutAmount) throw Error("103: Missing shareOutAmount!")
        //                     if(!transaction.tokenInMaxs) throw Error("104: Missing tokenInMaxs!")
        //
        //                     msg = {
        //                         "type":"osmosis/gamm/join-pool",
        //                         "value":{
        //                             "sender":addressFrom,
        //                             "poolId":transaction.poolId,
        //                             "shareOutAmount":transaction.shareOutAmount,
        //                             "tokenInMaxs":transaction.tokenInMaxs
        //                         }
        //                     }
        //
        //                     break;
        //                 case "osmosisswap":
        //                     if(!transaction.routes) throw Error("102: Missing routes!")
        //                     if(!transaction.tokenIn) throw Error("103: Missing tokenIn!")
        //                     if(!transaction.tokenOutMinAmount) throw Error("104: Missing tokenOutMinAmount!")
        //
        //                     msg = {
        //                         "type":"osmosis/gamm/swap-exact-amount-in",
        //                         "value":{
        //                             "sender":addressFrom,
        //                             "routes":transaction.routes,
        //                             "tokenIn":transaction.tokenIn,
        //                             "tokenOutMinAmount":transaction.tokenOutMinAmount.toString()
        //                         }
        //                     }
        //
        //                     break;
        //                case "ibcWithdrawal":
        //                     //TODO
        //                     throw Error("TODO")
        //                     break;
        //                 case "ibcWithdrawal":
        //                     //TODO
        //                     throw Error("TODO")
        //                     break;
        //                 default:
        //                     throw Error("unsupported osmosis tx type: "+transaction.type)
        //                     //code block
        //             }
        //             let txType = "cosmos-sdk/MsgSend"
        //
        //             //Osmosis is cheap, > 0 = max everything
        //             let gas = "350000"
        //             let fee = "2800"
        //
        //             if(transaction.priority === 0){
        //                 gas = "0"
        //                 fee = "0"
        //             }
        //
        //             let memo = transaction.memo || ""
        //
        //             if(!msg) throw Error('failed to make tx msg')
        //
        //             let unsigned = {
        //                 "fee": {
        //                     "amount": [
        //                         {
        //                             "amount": fee,
        //                             "denom": "uosmo"
        //                         }
        //                     ],
        //                     "gas": gas
        //                 },
        //                 "memo": memo,
        //                 "msg": [
        //                     msg
        //                 ],
        //                 "signatures": null
        //             }
        //
        //             if(!sequence) throw Error("112: Failed to get sequence")
        //             if(isNaN(sequence)) throw Error("113: Failed to get valid sequence")
        //             if(!account_number) throw Error("114: Failed to get account_number")
        //
        //             //verify from address
        //             // let fromAddress = await this.WALLET.osmosisGetAddress({
        //             //     addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
        //             //     showDisplay: false,
        //             // });
        //             // log.debug(tag,"fromAddressHDwallet: ",fromAddress)
        //             // log.debug(tag,"fromAddress: ",addressFrom)
        //
        //             log.debug("res: ",prettyjson.render({
        //                 addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
        //                 chain_id,
        //                 account_number: account_number,
        //                 sequence:sequence,
        //                 tx: unsigned,
        //             }))
        //
        //             //if(fromAddress !== addressFrom) throw Error("Can not sign, address mismatch")
        //             let atomTx = {
        //                 addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
        //                 chain_id:'osmosis-1',
        //                 account_number: account_number,
        //                 sequence:sequence,
        //                 tx: unsigned,
        //             }
        //
        //             let unsignedTx = {
        //                 network:transaction.network,
        //                 asset:transaction.asset,
        //                 transaction,
        //                 HDwalletPayload:atomTx,
        //                 verbal:"osmosis transaction"
        //             }
        //
        //             rawTx = unsignedTx
        //
        //         } else {
        //             log.error(tag,"network not supported! ",transaction.network)
        //         }
        //
        //
                //TODO above

                return rawTx
            }catch(e){
                log.error(e)
                throw e
            }
        }

        //TODO above

        // // this.encrypt = function (msg:FioActionParameters.FioRequestContent,payerPubkey:string) {
        // //     return encrypt_message(msg,payerPubkey);
        // // }
        // this.sendApproval = async function (intent:Approval) {
        //     let tag = TAG+" | sendApproval | "
        //     try{
        //         let invocationId
        //         if(!intent.invocationId) {
        //             invocationId = "notset"
        //         } else {
        //             invocationId = intent.invocationId
        //         }
        //         if(intent.coin && intent.coin !== 'ETH') throw Error("approvals are ETH only!")
        //         intent.coin = "ETH"
        //
        //         if(!intent.contract) throw Error("102: contract required!")
        //         if(!intent.tokenAddress) throw Error("103: tokenAddress required!")
        //         if(!intent.amount) throw Error("104: amount required!")
        //         //TODO max approval
        //         //if(!intent.amount) intent.amount = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
        //
        //         let approval = {
        //             contract:intent.contract,
        //             tokenAddress:intent.tokenAddress,
        //             amount:intent.amount
        //         }
        //
        //         let signedTx = await this.buildApproval(approval)
        //         log.debug(tag,"signedTx: ",signedTx)
        //
        //         if(invocationId) signedTx.invocationId = invocationId
        //         log.debug(tag,"invocationId: ",invocationId)
        //
        //         signedTx.broadcasted = false
        //         let broadcast_hook = async () =>{
        //             try{
        //                 log.debug(tag,"signedTx: ",signedTx)
        //                 //TODO flag for async broadcast
        //                 let broadcastResult = await this.broadcastTransaction('ETH',signedTx)
        //                 log.debug(tag,"broadcastResult: ",broadcastResult)
        //
        //                 //push to invoke api
        //             }catch(e){
        //                 log.error(tag,"Failed to broadcast transaction!")
        //             }
        //         }
        //         //broadcast hook
        //         if(!intent.noBroadcast){
        //             signedTx.broadcasted = true
        //         } else {
        //             signedTx.noBroadcast = true
        //         }
        //         //if noBroadcast we MUST still release the inovation
        //         //notice we pass noBroadcast to the broadcast post request
        //         //also Notice NO asyc here! tx lifecycle hooks bro!
        //         broadcast_hook()
        //
        //         signedTx.invocationId = invocationId
        //         //
        //         if(!signedTx.txid) throw Error("103: Pre-broadcast txid hash not implemented!")
        //         return signedTx
        //     }catch(e){
        //         log.error(tag,e)
        //         throw Error(e)
        //     }
        // }
        this.buildTransfer = async function (transaction:any) {
            let tag = TAG + " | build_transfer | "
            try {
                log.info(tag,"transaction: ",transaction)
                let network = transaction.network.toUpperCase()
                let asset = transaction.asset.toUpperCase()
                let address = transaction.address || transaction.recipient
                if(!address) address = transaction.addressTo
                let amount = transaction.amount
                let fee = transaction.fee

                //get paths
                let paths = getPaths()
                log.debug(tag,"paths: ",paths)
                if(!paths) throw Error("101: unable to get paths!")
                if(!network) throw Error("102: Invalid transaction missing network!")
                if(!address) throw Error("103: Invalid transaction missing address!")
                if(!amount) throw Error("104: Invalid transaction missing amount!")
                if(!fee) throw Error("105: Invalid transaction missing fee!")
                let memo = transaction.memo
                let addressFrom = transaction.addressFrom
                if(!addressFrom) throw Error("102: unable to get master address! ")
                log.debug(tag,"addressFrom: ",addressFrom)
                let rawTx

                if(UTXO_COINS.indexOf(network) >= 0){
                    log.debug(tag,"Build UTXO tx! ",network)

                    // //list unspent
                    // log.debug(tag,"network: ",network)
                    // log.debug(tag,"xpub: ",this.PUBLIC_WALLET[network].xpub)
                    // log.debug(tag,"zpub: ",this.PUBLIC_WALLET[network].zpub)
                    // log.debug(tag,"pubkey: ",this.PUBLIC_WALLET[network].pubkey)
                    // let pubkeyInfo = this.PUBLIC_WALLET[network]
                    // let input = {network,xpub:this.PUBLIC_WALLET[network].pubkey}
                    // log.debug(tag,"input: ",input)
                    //
                    // let unspentInputs = await this.pioneer.instance.ListUnspent({network,xpub:input.xpub})
                    // unspentInputs = unspentInputs.data
                    // log.debug(tag,"unspentInputs: ",unspentInputs)
                    //
                    // let utxos = []
                    // for(let i = 0; i < unspentInputs.length; i++){
                    //     let input = unspentInputs[i]
                    //     let utxo = {
                    //         txId:input.txid,
                    //         vout:input.vout,
                    //         value:parseInt(input.value),
                    //         nonWitnessUtxo: Buffer.from(input.hex, 'hex'),
                    //         hex: input.hex,
                    //         tx: input.tx,
                    //         path:input.path
                    //         //TODO if segwit
                    //         // witnessUtxo: {
                    //         //     script: Buffer.from(input.hex, 'hex'),
                    //         //     value: 10000 // 0.0001 BTC and is the exact same as the value above
                    //         // }
                    //     }
                    //     utxos.push(utxo)
                    // }
                    //
                    // //if no utxo's
                    // if (utxos.length === 0){
                    //     throw Error("101 YOUR BROKE! no UTXO's found! ")
                    // }
                    //
                    // //TODO get fee level in sat/byte
                    // // let feeRate = 1
                    // let feeRateInfo = await this.pioneer.instance.GetFeeInfo({coin:network})
                    // feeRateInfo = feeRateInfo.data
                    // log.debug(tag,"feeRateInfo: ",feeRateInfo)
                    // let feeRate
                    // //TODO dynamic all the things
                    // if(network === 'BTC'){
                    //     feeRate = feeRateInfo
                    // }else if(network === 'BCH'){
                    //     feeRate = 2
                    // } else if(network === 'LTC'){
                    //     feeRate = 4
                    // } else {
                    //     throw Error("Fee's not configured for network:"+network)
                    // }
                    //
                    // log.debug(tag,"feeRate: ",feeRate)
                    // if(!feeRate) throw Error("Can not build TX without fee Rate!")
                    // //buildTx
                    //
                    // //TODO input selection
                    //
                    // //use coinselect to select inputs
                    // let amountSat = parseFloat(amount) * 100000000
                    // amountSat = parseInt(amountSat.toString())
                    // log.debug(tag,"amount satoshi: ",amountSat)
                    // let targets = [
                    //     {
                    //         address,
                    //         value: amountSat
                    //     }
                    // ]
                    // // if(memo){
                    // //     targets.push({ address: memo, value: 0 })
                    // // }
                    //
                    // //Value of all inputs
                    // let totalInSatoshi = 0
                    // for(let i = 0; i < utxos.length; i++){
                    //     let amountInSat = utxos[i].value
                    //     totalInSatoshi = totalInSatoshi + amountInSat
                    // }
                    // log.debug(tag,"totalInSatoshi: ",totalInSatoshi)
                    // log.debug(tag,"totalInBase: ",nativeToBaseAmount(network,totalInSatoshi))
                    // let valueIn = await coincap.getValue(network,nativeToBaseAmount(network,totalInSatoshi))
                    // log.debug(tag,"totalInValue: ",valueIn)
                    //
                    // //amount out
                    // log.debug(tag,"amountOutSat: ",amountSat)
                    // log.debug(tag,"amountOutBase: ",amount)
                    // let valueOut = await coincap.getValue(network,nativeToBaseAmount(network,amountSat))
                    // log.debug(tag,"valueOut: ",valueOut)
                    //
                    // if(valueOut < 1){
                    //     if(network === 'BCH'){
                    //         log.debug(tag," God bless you sir's :BCH:")
                    //     } else {
                    //         log.debug("ALERT DUST! sending less that 1usd. (hope you know what you are doing)")
                    //     }
                    //     //Expensive networks
                    //     if(["BTC","ETH","RUNE"].indexOf(network) >= 0){
                    //         throw Error("You dont want to do this! sending < 1usd on expensive network")
                    //     }
                    // }
                    //
                    // if(nativeToBaseAmount(network,totalInSatoshi) < amount){
                    //     throw Error("Sum of input less than output! YOUR BROKE! ")
                    // }
                    //
                    // log.debug(tag,"inputs coinselect algo: ",{ utxos, targets, feeRate })
                    // let selectedResults = coinSelect(utxos, targets, feeRate)
                    // log.debug(tag,"result coinselect algo: ",selectedResults)
                    //
                    // //value of all outputs
                    //
                    // //amount fee in USD
                    //
                    // //if
                    // if(!selectedResults.inputs){
                    //     throw Error("Fee exceeded total available inputs!")
                    // }
                    //
                    // //TODO get long name for coin
                    //
                    // let inputs = []
                    // let outputs = []
                    // for(let i = 0; i < selectedResults.inputs.length; i++){
                    //     //get input info
                    //     let inputInfo = selectedResults.inputs[i]
                    //     log.debug(tag,"inputInfo: ",inputInfo)
                    //     let input = {
                    //         addressNList:support.bip32ToAddressNList(inputInfo.path),
                    //         scriptType:pubkeyInfo.script_type,
                    //         amount:String(inputInfo.value),
                    //         vout:inputInfo.vout,
                    //         txid:inputInfo.txId,
                    //         segwit:false,
                    //         hex:inputInfo.hex,
                    //         tx:inputInfo.tx
                    //     }
                    //     inputs.push(input)
                    // }
                    //
                    //
                    // log.debug(tag,"pubkeyInfo: change: ",pubkeyInfo)
                    // //getNewChange
                    // let changeAddressIndex = await this.pioneer.instance.GetChangeAddress({network,xpub:input.xpub})
                    // changeAddressIndex = changeAddressIndex.data.changeIndex
                    // let xpub = input.xpub
                    // let scriptType = pubkeyInfo.script_type
                    // let coin = network
                    // let account = 0 //TODO adjustable by pubkey data?
                    // let index = changeAddressIndex
                    // let isTestnet = false
                    // log.debug(tag,"input: ",{xpub,scriptType,coin,account,index,isChange:true,isTestnet})
                    // let changeAddress = await get_address_from_xpub(xpub,scriptType,coin,account,index,true,isTestnet)
                    // log.debug(tag,"changeAddress: ",changeAddress)
                    // if(!changeAddress) throw Error("103 Failed to get new change address!")
                    //
                    // //if bch convert format
                    // if(network === 'BCH'){
                    //     //if cashaddr convert to legacy
                    //     let type = bchaddr.detectAddressFormat(changeAddress)
                    //     log.debug(tag,"type: ",type)
                    //     if(type === 'cashaddr'){
                    //         changeAddress = bchaddr.toLegacyAddress(changeAddress)
                    //     }
                    // }
                    //
                    // for(let i = 0; i < selectedResults.outputs.length; i++){
                    //     let outputInfo = selectedResults.outputs[i]
                    //     if(outputInfo.address){
                    //         //not change
                    //         let output = {
                    //             address,
                    //             addressType:"spend",
                    //             scriptType:pubkeyInfo.stript_type,//TODO more types
                    //             amount:String(outputInfo.value),
                    //             isChange: false,
                    //         }
                    //         outputs.push(output)
                    //     } else {
                    //         //change
                    //         let output = {
                    //             address:changeAddress,
                    //             addressType:"spend",
                    //             scriptType:pubkeyInfo.stript_type,//TODO more types
                    //             amount:String(outputInfo.value),
                    //             isChange: true,
                    //         }
                    //         outputs.push(output)
                    //     }
                    // }
                    // let longName
                    // if(network === 'BCH'){
                    //     longName = 'BitcoinCash'
                    // }else if(network === 'LTC'){
                    //     longName = 'Litecoin'
                    //     if(isTestnet){
                    //         longName = 'Testnet'
                    //     }
                    // }else if(network === 'BTC'){
                    //     longName = 'Bitcoin'
                    //     if(isTestnet){
                    //         longName = 'Testnet'
                    //     }
                    // }else {
                    //     throw Error("UTXO coin: "+network+" Not supported yet! ")
                    // }
                    //
                    // //hdwallet input
                    // //TODO type this
                    // let hdwalletTxDescription = {
                    //     opReturnData:memo,
                    //     coin: longName,
                    //     inputs,
                    //     outputs,
                    //     version: 1,
                    //     locktime: 0,
                    // }
                    //
                    // let unsignedTx = {
                    //     network,
                    //     asset:network,
                    //     transaction,
                    //     HDwalletPayload:hdwalletTxDescription,
                    //     verbal:"UTXO transaction"
                    // }
                    //
                    // rawTx = unsignedTx

                    throw Error("TODO")

                }else if(network === 'ETH'){


                    let nonceRemote = await this.pioneer.instance.GetNonce(addressFrom)
                    nonceRemote = nonceRemote.data
                    let nonce = transaction.nonce || nonceRemote
                    log.debug(tag,"nonce: ",nonce)

                    let gas_limit = 80000
                    let gas_price

                    //overrides
                    log.debug(tag,"transaction.fee: ",transaction.fee)
                    if(transaction.fee){
                        if(transaction.fee.priority){
                            log.debug(tag,"Selecting fee based on priority")
                            //get gas recomendations
                            gas_price = await this.pioneer.instance.GetGasPrice()
                            gas_price = gas_price.data

                            log.debug(tag,"gas_price: ",gas_price)
                            if(transaction.fee.priority === 2){
                                log.debug(tag,"setting priority 2 ")
                                gas_price = gas_price * 0.5
                                gas_price = parseInt(String(gas_price))
                                log.debug(tag,"gas_price: ",gas_price)
                            }
                        } else {
                            log.debug(tag,"Selecting fee based on hard coded value")
                            //TODO other units?
                            if(transaction.fee.value && transaction.fee.units === 'gwei'){
                                log.debug(tag,"setting fee value: ",transaction.fee.value)
                                gas_price = transaction.fee.value * GIG
                            }
                            if(transaction.fee.gasLimit){
                                gas_limit = transaction.fee.gasLimit
                            }
                        }
                    }
                    if(!gas_price) {
                        log.debug(tag,"Getting Fee Level from remote!")
                        gas_price = await this.pioneer.instance.GetGasPrice()
                        gas_price = gas_price.data
                    }

                    log.debug(tag,"gas_price: ",gas_price)
                    gas_price = parseInt(String(gas_price))

                    let txParams
                    if(asset === "ETH"){
                        let amountNative = parseFloat(amount) * support.getBase('ETH')
                        amountNative = Number(parseInt(String(amountNative)))
                        txParams = {
                            nonce: nonce,
                            to: address,
                            gasPrice: gas_price,
                            gasLimit : gas_limit,
                            value: amountNative,
                            data:memo
                        }
                        log.debug(tag,"txParams: ",txParams)
                    } else {
                        throw Error("103: tokens incomplete!")
                        //TODO tokens
                    }
                    if(!txParams) throw Error("tokens not supported")

                    //send FROM master
                    let ethPathInfo = paths.filter((e:any) => e.network === 'ETH')
                    log.debug(tag,"ethPathInfo: ",ethPathInfo)
                    if(!ethPathInfo[0]) throw Error("103: unable to get eth path info! ")
                    let masterPathEth = addressNListToBIP32(ethPathInfo[0].addressNListMaster)
                    log.debug(tag,"masterPathEth: ",masterPathEth)
                    log.debug(tag,"masterPathEth: ","m/44'/60'/0'/0/0")
                    log.debug(tag,"txParams: ",txParams)

                    let chainId = 1
                    if(this.isTestnet){
                        chainId = 3 //ropsten
                    }

                    let ethTx = {
                        addressNList: bip32ToAddressNList(masterPathEth),
                        nonce: numberToHex(txParams.nonce),
                        gasPrice: numberToHex(txParams.gasPrice),
                        gasLimit: numberToHex(txParams.gasLimit),
                        value: numberToHex(txParams.value || 0),
                        to: txParams.to,
                        data:txParams.data,
                        chainId
                    }
                    log.debug("TX: ",JSON.stringify(ethTx))

                    let unsignedTx = {
                        network:network,
                        asset:network,
                        transaction,
                        HDwalletPayload:ethTx,
                        verbal:"Ethereum transaction"
                    }

                    rawTx = unsignedTx

                } else if(network === 'RUNE'){
                    //get amount native
                    let amountNative = RUNE_BASE * parseFloat(amount)
                    amountNative = parseInt(amountNative.toString())

                    //get account number
                    log.debug(tag,"addressFrom: ",addressFrom)
                    let masterInfo = await this.pioneer.instance.GetAccountInfo({network:'RUNE',address:addressFrom})
                    masterInfo = masterInfo.data
                    log.debug(tag,"masterInfo: ",masterInfo.data)

                    let sequence = masterInfo.result.value.sequence || 0
                    let account_number = masterInfo.result.value.account_number
                    sequence = parseInt(sequence)
                    sequence = sequence.toString()

                    let txType = "thorchain/MsgSend"
                    let gas = "650000"
                    let fee = "0"
                    let memo = transaction.memo || ""

                    //sign tx
                    let unsigned = {
                        "fee": {
                            "amount": [
                                {
                                    "amount": fee,
                                    "denom": "rune"
                                }
                            ],
                            "gas": gas
                        },
                        "memo": memo,
                        "msg": [
                            {
                                "type": txType,
                                "value": {
                                    "amount": [
                                        {
                                            "amount": amountNative.toString(),
                                            "denom": "rune"
                                        }
                                    ],
                                    "from_address": addressFrom,
                                    "to_address": address
                                }
                            }
                        ],
                        "signatures": null
                    }

                    let	chain_id = RUNE_CHAIN

                    if(!sequence) throw Error("112: Failed to get sequence")
                    if(!account_number) account_number = 0

                    let runeTx = {
                            addressNList: bip32ToAddressNList(HD_RUNE_KEYPATH),
                            chain_id,
                            account_number: account_number,
                            sequence:sequence,
                            tx: unsigned,
                    }

                    //
                    let unsignedTx = {
                        network:network,
                        asset:network,
                        transaction,
                        HDwalletPayload:runeTx,
                        verbal:"Thorchain transaction"
                    }

                    rawTx = unsignedTx

                }else if(network === 'ATOM'){
                    //get amount native
                    let amountNative = ATOM_BASE * parseFloat(amount)
                    amountNative = parseInt(amountNative.toString())

                    //get account number
                    log.debug(tag,"addressFrom: ",addressFrom)
                    let masterInfo = await this.pioneer.instance.GetAccountInfo({network:'ATOM',address:addressFrom})
                    masterInfo = masterInfo.data
                    log.debug(tag,"masterInfo: ",masterInfo.data)

                    let sequence = masterInfo.result.value.sequence
                    let account_number = masterInfo.result.value.account_number
                    sequence = parseInt(sequence)
                    sequence = sequence.toString()

                    let txType = "cosmos-sdk/MsgSend"
                    let gas = "100000"
                    let fee = "1000"
                    let memo = transaction.memo || ""

                    //sign tx
                    let unsigned = {
                        "fee": {
                            "amount": [
                                {
                                    "amount": fee,
                                    "denom": "uatom"
                                }
                            ],
                            "gas": gas
                        },
                        "memo": memo,
                        "msg": [
                            {
                                "type": txType,
                                "value": {
                                    "amount": [
                                        {
                                            "amount": amountNative.toString(),
                                            "denom": "uatom"
                                        }
                                    ],
                                    "from_address": addressFrom,
                                    "to_address": address
                                }
                            }
                        ],
                        "signatures": null
                    }

                    let	chain_id = ATOM_CHAIN

                    if(!sequence) throw Error("112: Failed to get sequence")
                    if(!account_number) throw Error("113: Failed to get account_number")

                    //if(fromAddress !== addressFrom) throw Error("Can not sign, address mismatch")
                    let atomTx = {
                        addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
                        chain_id,
                        account_number: account_number,
                        sequence:sequence,
                        tx: unsigned,
                    }

                    let unsignedTx = {
                        network:network,
                        asset:network,
                        transaction,
                        HDwalletPayload:atomTx,
                        verbal:"Thorchain transaction"
                    }

                    rawTx = unsignedTx

                }else if(network === 'OSMO'){
                    //get amount native
                    let amountNative = ATOM_BASE * parseFloat(amount)
                    amountNative = parseInt(amountNative.toString())

                    //get account number
                    log.info(tag,"addressFrom: ",addressFrom)
                    let masterInfo = await this.pioneer.instance.GetAccountInfo({network:'OSMO',address:addressFrom})
                    masterInfo = masterInfo.data
                    // log.info(tag,"masterInfo: ",masterInfo)
                    log.info(tag,"masterInfo: ",masterInfo.result)
                    log.info(tag,"masterInfo: ",masterInfo.result.value)

                    let sequence = masterInfo.result.value.sequence
                    if(!sequence)sequence = 0
                    let account_number = masterInfo.result.value.account_number
                    if(!account_number) throw Error("Asset as never received OSMO! unable to send! no account_number assigned")
                    sequence = parseInt(sequence)
                    if(!sequence || isNaN(sequence)) sequence = 0
                    sequence = sequence.toString()
                    let txType = "cosmos-sdk/MsgSend"
                    let gas = "80000"
                    let fee = "2800"
                    let memo = transaction.memo || ""

                    //sign tx
                    let unsigned = {
                        "fee": {
                            "amount": [
                                {
                                    "amount": fee,
                                    "denom": "uosmo"
                                }
                            ],
                            "gas": gas
                        },
                        "memo": memo,
                        "msg": [
                            {
                                "type": txType,
                                "value": {
                                    "amount": [
                                        {
                                            "amount": amountNative.toString(),
                                            "denom": "uosmo"
                                        }
                                    ],
                                    "from_address": addressFrom,
                                    "to_address": address
                                }
                            }
                        ],
                        "signatures": null
                    }

                    let	chain_id = OSMO_CHAIN

                    if(!sequence) throw Error("112: Failed to get sequence")
                    if(!account_number) throw Error("113: Failed to get account_number")

                    //if(fromAddress !== addressFrom) throw Error("Can not sign, address mismatch")
                    let atomTx = {
                        addressNList: bip32ToAddressNList(HD_ATOM_KEYPATH),
                        chain_id:'osmosis-1',
                        account_number: account_number,
                        sequence:sequence,
                        tx: unsigned,
                    }

                    let unsignedTx = {
                        network:network,
                        asset:network,
                        transaction,
                        HDwalletPayload:atomTx,
                        verbal:"osmosis transaction"
                    }

                    rawTx = unsignedTx

                }else if(network === "BNB"){
                    throw Error("TODO")
                    // //TODO move to tx builder module
                    // //get account info
                    // log.debug("addressFrom: ",addressFrom)
                    // let accountInfo = await this.pioneer.instance.GetAccountInfo({network,address:addressFrom})
                    // accountInfo = accountInfo.data
                    // log.debug("accountInfo: ",prettyjson.render(accountInfo))
                    // let sequence
                    // let account_number
                    // let pubkey
                    // if(!accountInfo.result){
                    //     //assume new account
                    //     sequence = "0"
                    //     account_number = "0"
                    //     pubkey = null
                    // } else {
                    //     sequence = transaction.nonce || accountInfo.result.sequence
                    //     account_number = accountInfo.result.account_number
                    //     pubkey = accountInfo.result.public_key
                    // }
                    //
                    // if(!address) throw Error("Missing TO address! ")
                    // //simple transfer
                    // //build tx
                    // //TODO type from this from hdwallet
                    // let bnbTx = {
                    //     "account_number": account_number,
                    //     "chain_id": "Binance-Chain-Nile",
                    //     "data": null,
                    //     "memo": transaction.memo,
                    //     "msgs": [
                    //         {
                    //             "inputs": [
                    //                 {
                    //                     "address": addressFrom,
                    //                     "coins": [
                    //                         {
                    //                             "amount": amount,
                    //                             "denom": "BNB"
                    //                         }
                    //                     ]
                    //                 }
                    //             ],
                    //             "outputs": [
                    //                 {
                    //                     "address": address,
                    //                     "coins": [
                    //                         {
                    //                             "amount": amount,
                    //                             "denom": "BNB"
                    //                         }
                    //                     ]
                    //                 }
                    //             ]
                    //         }
                    //     ],
                    //     "sequence": sequence,
                    //     "source": "1"
                    // }
                    //
                    // log.debug(tag,"bnbTx: ",prettyjson.render(bnbTx))
                    // // log.debug(tag,"bnbTx: ",JSON.stringify(bnbTx))
                    // //bip32ToAddressNList(`m/44'/714'/0'/0/0`)
                    //
                    // let binanceTx = {
                    //     addressNList: bip32ToAddressNList(`m/44'/714'/0'/0/0`),
                    //     chain_id: "Binance-Chain-Nile",
                    //     account_number: account_number,
                    //     sequence: sequence,
                    //     tx: bnbTx,
                    //  }
                    //
                    // let unsignedTx = {
                    //     network:network,
                    //     asset:network,
                    //     transaction,
                    //     HDwalletPayload:binanceTx,
                    //     verbal:"Thorchain transaction"
                    // }
                    //
                    // rawTx = unsignedTx

                    //TODO verify addressFrom path
                    // const signedTxResponse = await this.WALLET.binanceSignTx({
                    //     addressNList: bip32ToAddressNList(`m/44'/714'/0'/0/0`),
                    //     chain_id: "Binance-Chain-Nile",
                    //     account_number: account_number,
                    //     sequence: sequence,
                    //     tx: bnbTx,
                    // })
                    // log.debug(tag,"**** signedTxResponse: ",signedTxResponse)
                    // log.debug(tag,"**** signedTxResponse: ",JSON.stringify(signedTxResponse))
                    //
                    // // this is undefined at first tx
                    // // let pubkeyHex = pubkey.toString('hex')
                    // // log.debug(tag,"pubkeyHex: ",pubkeyHex)
                    //
                    // let pubkeySigHex = signedTxResponse.signatures.pub_key.toString('hex')
                    // log.debug(tag,"pubkeySigHex: ",pubkeySigHex)
                    //
                    // const buffer = Buffer.from(signedTxResponse.serialized, 'base64');
                    // let hash = cryptoTools.createHash('sha256').update(buffer).digest('hex').toUpperCase()
                    //
                    // rawTx = {
                    //     txid:hash,
                    //     serialized:signedTxResponse.serialized
                    // }
                }else if(network === "EOS"){
                    throw Error ("666: EOS not supported yet!")
                    // amount = getEosAmount(amount)
                    // //EOS transfer
                    // let unsigned_main = {
                    //     expiration: "2020-04-30T22:00:00.000",
                    //     ref_block_num: 54661,
                    //     ref_block_prefix: 2118672142,
                    //     max_net_usage_words: 0,
                    //     max_cpu_usage_ms: 0,
                    //     delay_sec: 0,
                    //     context_free_actions: [],
                    //     actions: [
                    //         {
                    //             account: "eosio.token",
                    //             name: "transfer",
                    //             authorization: [
                    //                 {
                    //                     actor: addressFrom,
                    //                     permission: "active",
                    //                 },
                    //             ],
                    //             data: {
                    //                 from: addressFrom,
                    //                 to: address,
                    //                 quantity: amount+" EOS",
                    //                 memo: memo,
                    //             },
                    //         },
                    //     ],
                    // };
                    //
                    // log.debug(tag,"unsigned_main: ",JSON.stringify(unsigned_main))
                    //
                    // let chainid_main =
                    //     "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906";
                    // let res = await this.WALLET.eosSignTx({
                    //     addressNList:[ 0x80000000 + 44, 0x80000000 + 194, 0x80000000 + 0 , 0, 0 ],
                    //     chain_id: chainid_main,
                    //     tx: unsigned_main,
                    // });
                    //
                    // log.debug(tag,"**** res: ",res)
                    //
                    // // let broadcastForm = {
                    // //     serializedTransaction:Uint8Array.from(Buffer.from(res.serialized, 'hex')),
                    // //     signatures: [res.eosFormSig]
                    // // }
                    //
                    // let broadcastForm = {
                    //     serializedTransaction:res.serialized,
                    //     signatures: res.eosFormSig
                    // }
                    //
                    // // output.serializedTransaction =  Uint8Array.from(Buffer.from(res.serialized, 'hex'));
                    // // output.signatures = [res.eosFormSig]
                    // // log.debug(tag,"res: ",res)
                    // rawTx = {
                    //     txid:"",
                    //     serialized:res.serialized,
                    //     broadcastBody:broadcastForm
                    // }
                    // log.debug(tag,"rawTx: ",rawTx)
                }else if(network === "FIO"){
                    throw Error ("666: FIO not supported yet!")
                    // //if name
                    // if(address.indexOf("@") >= 0){
                    //     address = await network.getFioPubkeyFromUsername(address)
                    // }
                    //
                    // //
                    // log.debug(tag,"address: ",address)
                    //
                    // let amountNative = parseFloat(amount) * 100000000
                    // amountNative = parseInt(String(amountNative))
                    // //
                    // log.debug(tag,"fiotx: ",transaction)
                    // const data: FioActionParameters.FioTransferTokensPubKeyActionData = {
                    //     payee_public_key: address,
                    //     amount: String(amountNative),
                    //     max_fee: 2000000000,
                    //     tpid: "",
                    // };
                    //
                    // const res = await WALLET.fioSignTx({
                    //     addressNList: bip32ToAddressNList("m/44'/235'/0'/0/0"),
                    //     actions: [
                    //         {
                    //             account: FioActionParameters.FioTransferTokensPubKeyActionAccount,
                    //             name: FioActionParameters.FioTransferTokensPubKeyActionName,
                    //             data,
                    //         },
                    //     ],
                    // });
                    // log.debug(tag,"res: ",res)
                    //
                    // rawTx = res
                }else  {
                    throw Error("109: network not yet implemented! network: "+network)
                }



                return rawTx
            } catch (e) {
                log.error(tag, "e: ", e)
                throw e
            }
        }
    }
}

