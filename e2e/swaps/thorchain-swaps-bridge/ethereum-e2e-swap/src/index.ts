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

let BLOCKCHAIN = 'ethereum'
let ASSET = 'ETH'
let MIN_BALANCE = process.env['MIN_BALANCE_ETH'] || "0.04"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.0001"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let NO_BROADCAST = process.env['E2E_BROADCAST'] || true
let FAUCET_BCH_ADDRESS = process.env['FAUCET_BCH_ADDRESS']
if(!FAUCET_BCH_ADDRESS) throw Error("Need Faucet Address!")

let noBroadcast = true

let TRADE_PAIR  = "ETH_BCH"
let INPUT_ASSET = ASSET
let OUTPUT_ASSET = "BCH"

console.log("spec: ",spec)
console.log("wss: ",wss)

let blockchains = [
    'bitcoin','ethereum','thorchain','bitcoincash','litecoin','binance','cosmos','dogecoin','osmosis'
]

let txid:string
let invocationId:string

const test_service = async function () {
    let tag = TAG + " | test_service | "
    try {
        console.time('start2paired');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');

        const queryKey = "sdk:pair-keepkey:"+uuidv4();
        assert(queryKey)
        const unchainedUrls = {
            [ChainTypes.Bitcoin]: {
                httpUrl: 'https://dev-api.bitcoin.shapeshift.com',
                wsUrl: 'wss://dev-api.bitcoin.shapeshift.com'
            },
            [ChainTypes.Ethereum]: {
                httpUrl: 'https://dev-api.ethereum.shapeshift.com',
                wsUrl: 'wss://dev-api.ethereum.shapeshift.com'
            }
        }
        assert(unchainedUrls)
        let config:any = {
            queryKey,
            spec,
            wss,
            unchainedUrls
        }
        let app = new SDK.SDK(spec,config)
        let status = await app.checkBridge()
        assert(status)
        assert(status.username)
        log.debug("status: ",status)
        //use username from bridge
        // config.username = status.username

        //get bridge userInfo
        let userInfoBridge = await app.getBridgeUser()
        log.info("userInfoBridge: ",userInfoBridge)
        //verify bridge userInfo has asset + balance
        assert(userInfoBridge)
        assert(userInfoBridge.pubkeys)
        assert(userInfoBridge.balances)
        let bridgeAssetBalance = userInfoBridge.balances.filter((e:any) => e.symbol === ASSET)[0]
        assert(bridgeAssetBalance)
        assert(bridgeAssetBalance.balance)

        let API = await app.init(blockchains)
        let events = await app.startSocket()
        assert(API)
        assert(events)

        //send pairing code to bridge
        let pairResp = await app.pairBridge()
        assert(pairResp)
        assert(pairResp.success)
        log.debug("pairResp: ",pairResp)
        let userInfo = await app.getUserInfo()
        log.debug("userInfo: ",userInfo)
        assert(pairResp)
        //force update TODO removeme? @performance
        await app.updateContext()

        //verify user
        log.debug("app: ",app.username)
        let username = app.username
        assert(username)
        assert(app.context)
        assert(app.pubkeys)
        assert(app.balances)
        assert(app.wallets)
        log.debug("app wallets: ",app.wallets.length)
        log.debug("app pubkeys: ",app.pubkeys.length)
        log.debug("app balances: ",app.balances.length)
        log.debug("app context: ",app.context)
        //TODO enfore sanity rules
        //rules 1 pubkey per blockchain min
        //rules 1 balance per pubkey min? I think we show 0 balance? right
        //verify all balances are good
        for(let i = 0; i < app.balances.length; i++){
            let balance = app.balances[i]
            log.debug("balance: ",balance)
            if(balance.symbol === 'undefined') throw Error('invalid pubkey! undefined!')
            //image
            if(!balance.image){
                log.error("Invalid image!: ",balance)
            }
            assert(balance.image)
            assert(balance.pubkey)
            assert(balance.path)
            assert(balance.symbol)
            //TODO rule, if asset, balance > 0
        }
        //pubkey of input
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

        //balance of input
        log.debug(tag,"app.balances: ",app.balances)
        let balances = app.balances.filter((e:any) => e.symbol === ASSET)
        log.debug(tag,"balances: ",balances)
        assert(balances.length > 0)
        let balanceContext = balances.filter((e:any) => e.context === app.context)[0]
        assert(balanceContext)
        assert(balanceContext.balance)
        assert(balanceContext.balance > 0)
        log.test(tag,"balanceContext: ",balanceContext.balance)
        if(balanceContext.balance < MIN_BALANCE){
            log.error(tag," Test wallet low! amount: "+balanceContext.balance+" target: "+MIN_BALANCE+" Send moneies to "+ASSET+": "+pubkeyOut.master)
            throw Error("101: Low funds!")
        } else {
            log.test(tag," Attempting e2e test "+ASSET+" balance: ",balanceContext.balance)
        }

        //get midgard info
        assert(app.markets)
        log.debug(tag,"app.markets: ",app.markets)
        log.debug(tag,"app.markets: ",app.markets.exchanges.thorchain.markets)
        log.debug(tag,"app.pools: ",app.markets.exchanges.thorchain.pools)

        //TODO

        //get pool info on thorchain
        let poolInfo = app.markets.exchanges.thorchain.pools.filter((e:any) => e.chain === ASSET)[0]
        log.debug(tag,"poolInfo: ",poolInfo)
        assert(poolInfo)
        assert(poolInfo.address)

        //get market for pair on thorchain
        let marketInfo = app.markets.exchanges.thorchain.markets.filter((e:any) => e.pair === TRADE_PAIR)[0]
        assert(marketInfo)
        log.debug(tag,"marketInfo",marketInfo)
        //get rate
        assert(marketInfo.rate)
        //TODO
        //estimate fee in
        //estimate fee out
        //get fee's in dollars
        //get fee's in percentage of balance
        //get preferences on empty account
        //verify feeIn remainder balance > empty account pref

        //build tx
        let swap:any = {
            type:'swap',
            context:app.context,
            inboundAddress: poolInfo,
            addressFrom:pubkeyIn.master,
            coin: "ETH",
            asset: "ETH",
            memo: '=:'+OUTPUT_ASSET+'.'+OUTPUT_ASSET+':'+FAUCET_BCH_ADDRESS,
            amount:TEST_AMOUNT,
        }
        if(noBroadcast) swap.noBroadcast = true
        log.debug(tag,"swap: ",swap)

        //options
        let options:any = {
            verbose: true,
            txidOnResp: false, // txidOnResp is the output format
        }

        //build swap
        let responseSwap = await app.buildTx(swap,options,ASSET)
        assert(responseSwap)
        log.debug(tag,"responseSwap: ",responseSwap)
        assert(responseSwap.HDwalletPayload)
        console.timeEnd('start2build');

        //invoke unsigned
        let transaction:any = {
            type:'keepkey-sdk',
            fee:{
                priority:3
            },
            unsignedTx:responseSwap,
            context:app.context,
            network:ASSET
        }

        //get invocation
        log.debug(tag,"transaction: ",transaction)
        log.test(tag,"invocationId: ",invocationId)

        let responseInvoke = await app.invokeUnsigned(transaction,options,ASSET)
        assert(responseInvoke)
        if(!responseInvoke.success){
            assert(responseInvoke.invocationId)
            log.error()
        }
        log.debug(tag,"responseInvoke: ",responseInvoke)

        invocationId = responseInvoke.invocationId
        transaction.invocationId = invocationId

        //get invocation
        let invocationView1 = await app.getInvocation(invocationId)
        log.debug(tag,"invocationView1: (VIEW) ",invocationView1)
        assert(invocationView1)
        assert(invocationView1.state)
        assert(invocationView1.invocation)
        assert(invocationView1.invocation.unsignedTx)
        assert(invocationView1.invocation.unsignedTx.HDwalletPayload)
        //assert.equal(invocationView1.state,'builtTx')

        //TODO validate payload

        //sign transaction
        log.notice("************* SIGN ON KEEPKEY! LOOK DOWN BRO ***************")
        // let signedTx = await app.signTx(invocationView1.invocation.unsignedTx)
        // assert(signedTx.txid)

        // //updateTx
        // let updateBody = {
        //     network:ASSET,
        //     invocationId,
        //     invocation:invocationView1,
        //     unsignedTx:responseSwap,
        //     signedTx
        // }
        //
        // //update invocation remote
        // let resultUpdate = await app.updateInvocation(updateBody)
        // assert(resultUpdate)
        // log.debug(tag,"resultUpdate: ",resultUpdate)
        //
        // // //get invocation
        // let invocationView2 = await app.getInvocation(invocationId)
        // log.debug(tag,"invocationView2: (VIEW) ",invocationView2)
        // assert(invocationView2.state)
        // assert.equal(invocationView2.state,'signedTx')
        // log.debug(tag,"invocationView2: (VIEW) ",invocationView2)
        //
        // //broadcast transaction
        // let broadcastResult = await app.broadcastTransaction(updateBody)
        // log.debug(tag,"broadcastResult: ",broadcastResult)

        //verify broadcasted
        // let invocationView3 = await app.getInvocation(invocationId)
        // log.debug(tag,"invocationView3: (VIEW) ",invocationView3)
        // assert(invocationView3.state)
        // assert.equal(invocationView3.state,'broadcasted')

        //get invocation info EToC
        console.timeEnd('start2broadcast');

        //wait for confirmation
        console.time('timeToConfirmed')
        if(!noBroadcast){
            log.test(tag,"Broadcasting!")

            let invocationView4 = await app.getInvocation(invocationId)
            log.debug(tag,"invocationView4: (VIEW) ",invocationView4)
            assert(invocationView4)
            assert(invocationView4.state)
            // assert.equal(invocationView3.state,'broadcasted')

            /*
                Status codes
                -1: errored
                 0: unknown
                 1: built
                 2: broadcasted
                 3: confirmed
                 4: fullfilled (swap completed)
             */


            //monitor tx lifecycle
            let isConfirmed = false
            let isFullfilled = false
            let fullfillmentTxid = false
            let currentStatus
            let statusCode = 0

            while(!isConfirmed){
                //get invocationInfo
                await sleep(6000)
                let invocationInfo = await app.getInvocation(invocationId)
                log.test(tag,"invocationInfo: ",invocationInfo.state)

                if(invocationInfo.state === 'builtTx'){
                    //rebroadcast
                }


                if(invocationInfo && invocationInfo.isConfirmed){
                    log.test(tag,"Confirmed!")
                    statusCode = 3
                    isConfirmed = true
                    console.timeEnd('timeToConfirmed')
                    console.time('confirm2fullfillment')
                } else {
                    log.test(tag,"Not Confirmed!")
                }

            }

            while(!isFullfilled){
                //get invocationInfo
                await sleep(6000)
                let invocationInfo = await app.getInvocation(invocationId)
                log.test(tag,"invocationInfo: ",invocationInfo.state)

                if(invocationInfo && invocationInfo.isConfirmed && invocationInfo.isFullfilled) {
                    log.test(tag,"is fullfilled!")
                    fullfillmentTxid = invocationInfo.fullfillmentTxid
                    isFullfilled = true
                    console.timeEnd('confirm2fullfillment')
                    //get tx gas price
                } else {
                    log.test(tag,"unfullfilled!")
                }
            }
            log.notice("****** TEST Report: "+fullfillmentTxid+" ******")
        }
        let result = await app.stopSocket()
        log.debug(tag,"result: ",result)



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
