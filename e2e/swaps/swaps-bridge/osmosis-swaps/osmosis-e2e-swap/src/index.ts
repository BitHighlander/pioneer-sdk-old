/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})
require("dotenv").config({path:'../../../../../.env'})

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

const { NodeWebUSBKeepKeyAdapter } = require('@shapeshiftoss/hdwallet-keepkey-nodewebusb')
const core = require('@shapeshiftoss/hdwallet-core');
let KKSDK = require("@keepkey/keepkey-sdk")

let {
    supportedBlockchains,
    baseAmountToNative,
    nativeToBaseAmount,
} = require("@pioneer-sdk/coins")

//lib
import { ChainTypes } from '@shapeshiftoss/types'

let BLOCKCHAIN = 'osmosis'
let ASSET = 'OSMO'
let MIN_BALANCE = process.env['MIN_BALANCE_OSMO'] || "0.0004"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.0001"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let NO_BROADCAST = process.env['E2E_BROADCAST'] || true

let noBroadcast = true

let TRADE_PAIR  = "OSMO_ATOM"
let INPUT_ASSET = ASSET
let OUTPUT_ASSET = "ATOM"

console.log("spec: ",spec)
console.log("wss: ",wss)

let blockchains = [
    'bitcoin','ethereum','thorchain','bitcoincash','litecoin','binance','cosmos','dogecoin','osmosis'
]

let txid:string
let invocationId:string
let username = "test-e2e-osmosis-swap"

const test_service = async function () {
    let tag = TAG + " | test_service | "
    try {
        console.time('start2paired');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');

        const queryKey = "sdk:pair-keepkey:"+uuidv4();
        assert(queryKey)
        let config:any = {
            queryKey,
            username,
            spec,
            service:"e2e-test-pioneer-sdk",
            serviceImageUrl:"https://pioneers.dev/img/greenCompas.93ffdaf9.png",
            wss
        }
        let app = new SDK.SDK(spec,config)

        let API = await app.init(blockchains)
        let events = await app.startSocket()
        assert(API)
        assert(events)
        let status = await app.checkBridge()
        log.info("status: (Bridge) ",status)
        assert(status)
        assert(status.online)
        // assert(status.username)

        let resultPair = await app.pairWallet('keepkey')
        log.info("resultPair: ",resultPair)

        let userInfo = await app.getUserInfo()
        log.debug("userInfo: ",userInfo)
        // assert(pairResp)
        //force update TODO removeme? @performance
        await app.updateContext()

        //verify user
        log.debug("app: ",app.username)
        assert(username)
        assert(app.context)
        assert(app.pubkeys)
        assert(app.balances)
        assert(app.wallets)
        log.debug("app wallets: ",app.wallets.length)
        log.debug("app pubkeys: ",app.pubkeys.length)
        log.debug("app balances: ",app.balances.length)
        log.debug("app context: ",app.context)

        let pubkeysIn = app.pubkeys.filter((e:any) => e.symbol === ASSET)
        assert(pubkeysIn.length > 0)
        //assert pubkey on context
        log.debug(tag,"pubkeysOut: ",pubkeysIn.length)
        log.debug(tag,"app.context: ",app.context)
        log.debug(tag,"pubkeysOut[0]: ",pubkeysIn[0])
        log.debug(tag,"pubkeysOut[0]: ",JSON.stringify(pubkeysIn[0]))
        log.debug(tag,"pubkeysOut[0]: ",pubkeysIn[0].context)
        //note this assumes only 1 pubkey on 0
        //TODO if multi get @preferences
        let pubkeyIn = pubkeysIn.filter((e:any) => e.context === app.context)[0]
        log.debug(tag,"pubkeyIn: ",pubkeyIn)
        assert(pubkeyIn)
        assert(pubkeyIn.master)
        log.test("address from Swap: ",pubkeyIn.master)


        //pubkey of output
        let pubkeysOut = app.pubkeys.filter((e:any) => e.symbol === OUTPUT_ASSET)
        assert(pubkeysOut.length > 0)
        //assert pubkey on context
        log.debug(tag,"pubkeysOut: ",pubkeysOut.length)
        log.debug(tag,"app.context: ",app.context)
        log.debug(tag,"pubkeysOut[0]: ",pubkeysOut[0].context)
        //note this assumes only 1 pubkey on 0
        //TODO if multi get @preferences
        let pubkeyOut = pubkeysOut.filter((e:any) => e.context === app.context)[0]
        log.debug(tag,"pubkeyOut: ",pubkeyOut)
        assert(pubkeyOut)
        assert(pubkeyOut.master)
        log.test("address Receive Swap: ",pubkeyOut.master)

        //verify context
        log.info(tag,"app.context",app.context)
        assert(app.context)

        //balance of input
        log.debug(tag,"app.balances: ",app.balances)
        let balances = app.balances.filter((e:any) => e.symbol === ASSET)
        log.debug(tag,"balances: ",balances)
        assert(balances.length > 0)
        //TODO multiple osmo on same context??? and one is 0? filter?
        let balanceContext = balances.filter((e:any) => e.context === app.context)[1]
        log.test(tag,"balanceContext: ",balanceContext)
        assert(balanceContext)
        assert(balanceContext.balance)
        assert(balanceContext.balance > 0)

        if(balanceContext.balance < MIN_BALANCE){
            log.error(tag," Test wallet low! amount: "+balanceContext.balance+" target: "+MIN_BALANCE+" Send moneies to "+ASSET+": "+pubkeyOut.master)
            throw Error("101: Low funds!")
        } else {
            log.test(tag," Attempting e2e test "+ASSET+" balance: ",balanceContext.balance)
        }

        //get midgard info
        assert(app.markets)
        log.info(tag,"app.markets: ",app.markets)
        log.info(tag,"app.markets: ",app.markets.exchanges.osmosis.markets)

        // //get market for pair on thorchain
        let marketInfo = app.markets.exchanges.osmosis.markets.filter((e:any) => e.pair === TRADE_PAIR)[0]
        assert(marketInfo)
        log.info(tag,"marketInfo",marketInfo)
        log.test(tag,"marketInfo",marketInfo.rate)
        //get rate
        assert(marketInfo.rate)

        // //TODO
        // //estimate fee in
        // //estimate fee out
        // //get fee's in dollars
        // //get fee's in percentage of balance
        // //get preferences on empty account
        // //verify feeIn remainder balance > empty account pref
        //
        // //build tx
        // let swap:any = {
        //     type:'swap',
        //     context:app.context,
        //     inboundAddress: poolInfo,
        //     addressFrom:pubkeyIn.master,
        //     coin: "ETH",
        //     asset: "ETH",
        //     memo: '=:'+OUTPUT_ASSET+'.'+OUTPUT_ASSET+':'+FAUCET_ADDRESS,
        //     amount:TEST_AMOUNT,
        // }
        // if(noBroadcast) swap.noBroadcast = true
        // log.debug(tag,"swap: ",swap)
        //
        // //options
        // let options:any = {
        //     verbose: true,
        //     txidOnResp: false, // txidOnResp is the output format
        // }
        //
        // //build swap
        // let responseSwap = await app.buildTx(swap,options,ASSET)
        // assert(responseSwap)
        // log.debug(tag,"responseSwap: ",responseSwap)
        // assert(responseSwap.HDwalletPayload)
        // console.timeEnd('start2build');
        //
        // //invoke unsigned
        // let transaction:any = {
        //     type:'keepkey-sdk',
        //     fee:{
        //         priority:3
        //     },
        //     unsignedTx:responseSwap,
        //     context:app.context,
        //     network:ASSET
        // }
        //
        // //get invocation
        // log.debug(tag,"transaction: ",transaction)
        // log.test(tag,"invocationId: ",invocationId)
        //
        // let responseInvoke = await app.invokeUnsigned(transaction,options,ASSET)
        // assert(responseInvoke)
        // if(!responseInvoke.success){
        //     assert(responseInvoke.invocationId)
        //     log.error()
        // }
        // log.debug(tag,"responseInvoke: ",responseInvoke)
        //
        // invocationId = responseInvoke.invocationId
        // transaction.invocationId = invocationId
        //
        // //get invocation
        // let invocationView1 = await app.getInvocation(invocationId)
        // log.debug(tag,"invocationView1: (VIEW) ",invocationView1)
        // assert(invocationView1)
        // assert(invocationView1.state)
        // assert(invocationView1.invocation)
        // assert(invocationView1.invocation.unsignedTx)
        // assert(invocationView1.invocation.unsignedTx.HDwalletPayload)
        // //assert.equal(invocationView1.state,'builtTx')
        //
        // //TODO validate payload
        //
        // //sign transaction
        // log.notice("************* SIGN ON KEEPKEY! LOOK DOWN BRO ***************")
        // // let signedTx = await app.signTx(invocationView1.invocation.unsignedTx)
        // // assert(signedTx.txid)
        //
        // // //updateTx
        // // let updateBody = {
        // //     network:ASSET,
        // //     invocationId,
        // //     invocation:invocationView1,
        // //     unsignedTx:responseSwap,
        // //     signedTx
        // // }
        // //
        // // //update invocation remote
        // // let resultUpdate = await app.updateInvocation(updateBody)
        // // assert(resultUpdate)
        // // log.debug(tag,"resultUpdate: ",resultUpdate)
        // //
        // // // //get invocation
        // // let invocationView2 = await app.getInvocation(invocationId)
        // // log.debug(tag,"invocationView2: (VIEW) ",invocationView2)
        // // assert(invocationView2.state)
        // // assert.equal(invocationView2.state,'signedTx')
        // // log.debug(tag,"invocationView2: (VIEW) ",invocationView2)
        // //
        // // //broadcast transaction
        // // let broadcastResult = await app.broadcastTransaction(updateBody)
        // // log.debug(tag,"broadcastResult: ",broadcastResult)
        //
        // //verify broadcasted
        // // let invocationView3 = await app.getInvocation(invocationId)
        // // log.debug(tag,"invocationView3: (VIEW) ",invocationView3)
        // // assert(invocationView3.state)
        // // assert.equal(invocationView3.state,'broadcasted')
        //
        // //get invocation info EToC
        // console.timeEnd('start2broadcast');
        //
        // //wait for confirmation
        // console.time('timeToConfirmed')
        // if(!noBroadcast){
        //     log.test(tag,"Broadcasting!")
        //
        //     let invocationView4 = await app.getInvocation(invocationId)
        //     log.debug(tag,"invocationView4: (VIEW) ",invocationView4)
        //     assert(invocationView4)
        //     assert(invocationView4.state)
        //     // assert.equal(invocationView3.state,'broadcasted')
        //
        //     /*
        //         Status codes
        //         -1: errored
        //          0: unknown
        //          1: built
        //          2: broadcasted
        //          3: confirmed
        //          4: fullfilled (swap completed)
        //      */
        //
        //
        //     //monitor tx lifecycle
        //     let isConfirmed = false
        //     let isFullfilled = false
        //     let fullfillmentTxid = false
        //     let currentStatus
        //     let statusCode = 0
        //
        //     while(!isConfirmed){
        //         //get invocationInfo
        //         await sleep(6000)
        //         let invocationInfo = await app.getInvocation(invocationId)
        //         log.test(tag,"invocationInfo: ",invocationInfo.state)
        //
        //         if(invocationInfo.state === 'builtTx'){
        //             //rebroadcast
        //         }
        //
        //
        //         if(invocationInfo && invocationInfo.isConfirmed){
        //             log.test(tag,"Confirmed!")
        //             statusCode = 3
        //             isConfirmed = true
        //             console.timeEnd('timeToConfirmed')
        //             console.time('confirm2fullfillment')
        //         } else {
        //             log.test(tag,"Not Confirmed!")
        //         }
        //
        //     }
        //
        //     while(!isFullfilled){
        //         //get invocationInfo
        //         await sleep(6000)
        //         let invocationInfo = await app.getInvocation(invocationId)
        //         log.test(tag,"invocationInfo: ",invocationInfo.state)
        //
        //         if(invocationInfo && invocationInfo.isConfirmed && invocationInfo.isFullfilled) {
        //             log.test(tag,"is fullfilled!")
        //             fullfillmentTxid = invocationInfo.fullfillmentTxid
        //             isFullfilled = true
        //             console.timeEnd('confirm2fullfillment')
        //             //get tx gas price
        //         } else {
        //             log.test(tag,"unfullfilled!")
        //         }
        //     }
        //     log.notice("****** TEST Report: "+fullfillmentTxid+" ******")
        // }
        // let result = await app.stopSocket()
        // log.debug(tag,"result: ",result)



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
