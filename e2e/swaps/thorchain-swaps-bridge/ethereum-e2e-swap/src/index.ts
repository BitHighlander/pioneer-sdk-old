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

let BLOCKCHAIN = 'osmosis'
let ASSET = 'OSMO'
let MIN_BALANCE = process.env['MIN_BALANCE_OSMO'] || "0.04"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.0001"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let NO_BROADCAST = process.env['E2E_BROADCAST'] || true
let FAUCET_OSMO_ADDRESS = process.env['FAUCET_OSMO_ADDRESS']
if(!FAUCET_OSMO_ADDRESS) throw Error("Need Faucet Address!")

let noBroadcast = true

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
        log.info(tag,"unchainedUrls: ",unchainedUrls)

        let config = {
            queryKey,
            spec,
            wss,
            unchainedUrls
        }
        log.debug(tag,"config: ",config)
        let app = new SDK.SDK(spec,config)

        //TODO enforce unchaind for each asset
        let API = await app.init(blockchains)
        assert(API)

        let events = await app.startSocket()

        //get bridge status
        let status = await app.checkBridge()
        assert(status)
        log.info("status: ",status)

        //send pairing code to bridge
        let pairResp = await app.pairBridge()
        assert(pairResp)
        assert(pairResp.success)
        log.info("pairResp: ",pairResp)

        //get user
        //getUserInfo
        // let userInfo = await app.getUserInfo()
        // log.info("userInfo: ",userInfo)
        // assert(pairResp)
        //
        //verify username
        log.debug("app: ",app.username)
        let username = app.username
        assert(username)

        //verify balances
        log.info("app pubkeys: ",app.pubkeys)
        log.info("app balances: ",app.balances)
        log.info("app balances: ",JSON.stringify(app.balances))
        log.info("app context: ",app.context)

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
