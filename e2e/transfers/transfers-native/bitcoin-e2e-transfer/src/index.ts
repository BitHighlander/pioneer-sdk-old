/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | e2e-test | "
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
import {v4 as uuidv4} from 'uuid';
let SDK = require('@pioneer-sdk/sdk')
let wait = require('wait-promise');
let sleep = wait.sleep;

// import {
//     Transfer
// } from "@pioneer-sdk/types";

let {
    supportedBlockchains,
    baseAmountToNative,
    nativeToBaseAmount,
} = require("@pioneer-sdk/coins")

//lib
import { ChainTypes } from '@shapeshiftoss/types'

let BLOCKCHAIN = 'bitcoin'
let ASSET = 'BTC'
let MIN_BALANCE = process.env['MIN_BALANCE_BTC'] || "0.00001"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.000028"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let NO_BROADCAST = process.env['E2E_BROADCAST'] || true
let FAUCET_BTC_ADDRESS = process.env['FAUCET_BTC_ADDRESS']
if(!FAUCET_BTC_ADDRESS) throw Error("missing FAUCET_BTC_ADDRESS")
let WALLET_MASTER_BTC = process.env['WALLET_MASTER_BTC']
if(!WALLET_MASTER_BTC) throw Error("missing WALLET_MASTER_BTC")

let noBroadcast = true

console.log("spec: ",spec)
console.log("wss: ",wss)

const test_service = async function () {
    let tag = TAG + " | test_service | "
    try {
        // console.time('start2paired');
        // console.time('start2build');
        // console.time('start2broadcast');
        // console.time('start2end');

        const queryKey = "sdk:pair-keepkey:"+uuidv4();
        const username = "user:pair-keepkey:"+uuidv4();
        assert(queryKey)
        assert(username)

        const unchainedUrls = {
            [ChainTypes.Bitcoin]: {
                httpUrl: 'https://dev-api.bitcoin.shapeshift.com',
                wsUrl: 'wss://dev-api.bitcoin.shapeshift.com'
            },
            [ChainTypes.Ethereum]: {
                httpUrl: 'https://dev-api.ethereum.shapeshift.com',
                wsUrl: 'wss://dev-api.ethereum.shapeshift.com'
            },
            // [ChainTypes.Osmosis]: {
            //     // httpUrl: 'https://dev-api.osmosis.shapeshift.com',
            //     // wsUrl: 'wss://dev-api.osmosis.shapeshift.com'
            //     httpUrl: 'https://dev-api.ethereum.shapeshift.com',
            //     wsUrl: 'wss://dev-api.ethereum.shapeshift.com'
            // }
        }
        assert(unchainedUrls)
        log.info(tag,"unchainedUrls: ",unchainedUrls)

        let config = {
            queryKey,
            username,
            spec,
            wss,
            unchainedUrls
        }
        log.debug(tag,"config: ",config)
        let app = new SDK.SDK(spec,config)

        //TODO enforce unchaind for each asset
        let seedChains = ['ethereum','thorchain','bitcoin','osmosis','cosmos']
        let API = await app.init(seedChains)
        assert(API)

        let events = await app.startSocket()

        //pair
        let pairWalletNative:any = {
            type:'native',
            name:'native',
            format:'mnemonic',
            isWatch:false,
            mnemonic:process.env['WALLET_MAIN']
        }
        log.info(tag,"pairWalletKeepKey: ",pairWalletNative)
        let registerResult = await app.pairWallet(pairWalletNative)
        assert(registerResult)
        log.info(tag,"registerResult: ",registerResult)

        //TODO verify sdk state
        let masterAddress = await app.getAddress(ASSET)
        assert.equal(masterAddress,WALLET_MASTER_BTC)
        log.test(tag,"masterAddress: ",masterAddress)

        //test amount in native
        // let amountTestNative = baseAmountToNative(ASSET,TEST_AMOUNT)
        // assert(amountTestNative)
        //
        // let transfer:any = {
        //     type:'transfer',
        //     addressFrom:masterAddress,
        //     context:app.context,
        //     recipient: FAUCET_BTC_ADDRESS,
        //     asset: ASSET,
        //     network: ASSET,
        //     memo: '',
        //     amount:amountTestNative,
        //     fee:{
        //         priority:5, //1-5 5 = highest
        //     },
        //     noBroadcast
        // }
        // log.debug(tag,"transfer: ",transfer)
        //
        // let responseTx = await app.buildTx(transfer)
        // assert(responseTx)
        // assert(responseTx.HDwalletPayload)
        // log.info(tag,"responseTx: ",responseTx)
        // console.timeEnd('start2build');
        //
        // //invoke unsigned
        // let transaction:any = {
        //     type:'pioneer',
        //     fee:{
        //         priority:3
        //     },
        //     unsignedTx:responseTx,
        //     context:app.context,
        //     network:ASSET
        // }
        //
        // //invoke raw TX
        // let options:any = {
        //     verbose: true,
        //     txidOnResp: false, // txidOnResp is the output format
        // }
        //
        // //get invocation
        // log.info(tag,"transaction: ",transaction)
        // let responseInvoke = await app.invokeUnsigned(transaction,options,ASSET)
        // assert(responseInvoke)
        // log.info(tag,"responseInvoke: ",responseInvoke)
        // let invocationId = responseInvoke.invocationId
        // assert(invocationId)

        // //verify invoke success
        // //get invocation
        // let invocationView1 = await app.getInvocation(invocationId)
        // log.debug(tag,"invocationView1: (VIEW) ",invocationView1)
        // assert(invocationView1)
        // assert(invocationView1.state)
        //
        // //todo assert state
        // assert(invocationView1)
        // assert(invocationView1.state)
        // assert(invocationView1.invocation)
        // assert(invocationView1.invocation.unsignedTx)
        // assert(invocationView1.invocation.unsignedTx.HDwalletPayload)
        //
        // //TODO verify
        //
        // //sign transaction
        // let signedTx:any = await app.signTx(invocationView1.invocation.unsignedTx)
        // log.info(tag,"signedTx: ",signedTx)
        // log.info(tag,"signedTx: ",signedTx.serialized)
        // assert(signedTx)
        // // assert(signedTx.txid)
        //
        // //updateTx
        // let updateBody = {
        //     network:ASSET,
        //     invocationId,
        //     invocation:invocationView1,
        //     unsignedTx:responseTx,
        //     signedTx
        // }
        //
        // //update invocation remote
        // log.info(tag,"updateBody: ",JSON.stringify(updateBody))
        // let resultUpdate = await app.updateInvocation(updateBody)
        // assert(resultUpdate)
        // log.info(tag,"resultUpdate: ",resultUpdate)
        //
        // //get invocation verify signed
        // let invocationView2 = await app.getInvocation(invocationId)
        // assert(invocationView2)
        // assert(invocationView2.state)
        // assert.equal(invocationView2.state,'signedTx')
        // log.debug(tag,"invocationView2: (VIEW) ",invocationView2)
        //
        // //TODO broadcast transaction
        //
        log.notice("****** TEST PASS 2******")
        //process
        process.exit(0)
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
