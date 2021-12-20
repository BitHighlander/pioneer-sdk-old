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
let FAUCET_OSMO_ADDRESS = process.env['FAUCET_OSMO_ADDRESS']
if(!FAUCET_OSMO_ADDRESS) throw Error("Need Faucet Address!")

let noBroadcast = true

let TRADE_PAIR  = "ETH_BCH"
let INPUT_ASSET = ASSET
let OUTPUT_ASSET = "BCH"

console.log("spec: ",spec)
console.log("wss: ",wss)

let blockchains = [
    'bitcoin','ethereum','thorchain','bitcoincash','litecoin','binance','cosmos','dogecoin','osmosis'
]


const test_service = async function () {
    let tag = TAG + " | test_service | "
    try {
        // console.time('start2paired');
        // console.time('start2build');
        // console.time('start2broadcast');
        // console.time('start2end');

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
        log.info("status: ",status)

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
        log.info("pairResp: ",pairResp)
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
        log.info("app wallets: ",app.wallets.length)
        log.info("app pubkeys: ",app.pubkeys.length)
        log.info("app balances: ",app.balances.length)
        log.info("app context: ",app.context)
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

        //pubkey of output
        let pubkeysOut = app.pubkeys.filter((e:any) => e.symbol === OUTPUT_ASSET)
        assert(pubkeysOut.length > 0)
        //assert pubkey on context
        log.info(tag,"pubkeysOut: ",pubkeysOut.length)
        log.info(tag,"app.context: ",app.context)
        log.info(tag,"pubkeysOut[0]: ",pubkeysOut[0].context)
        //note this assumes only 1 pubkey on 0
        //TODO if multi get @preferences
        let pubkeyOut = pubkeysOut.filter((e:any) => e.context === app.context)[0]
        log.info(tag,"pubkeyOut: ",pubkeyOut)
        assert(pubkeyOut)
        assert(pubkeyOut.master)
        log.test("address Receive Swap: ",pubkeyOut.master)

        //balance of input
        log.info(tag,"app.balances: ",app.balances)
        let balances = app.balances.filter((e:any) => e.symbol === ASSET)
        log.info(tag,"balances: ",balances)
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
        log.info(tag,"app.markets: ",app.markets)

        //TODO
        //get market for pair on thorchain
        //get rate
        //estimate fee in
        //estimate fee out
        //get fee's in dollars
        //get fee's in percentage of balance
        //get preferences on empty account
        //verify feeIn remainder balance > empty account pref
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
