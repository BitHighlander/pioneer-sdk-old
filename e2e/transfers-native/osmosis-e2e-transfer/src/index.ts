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

let BLOCKCHAIN = 'osmosis'
let ASSET = 'OSMO'
let MIN_BALANCE = process.env['MIN_BALANCE_OSMO'] || "0.04"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.0001"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let NO_BROADCAST = process.env['E2E_BROADCAST'] || true
let FAUCET_OSMO_ADDRESS = process.env['FAUCET_OSMO_ADDRESS'] || 'osmo1ayn76qwdd5l2d66nu64cs0f60ga7px8zmvng6k'

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
            [ChainTypes.Osmosis]: {
                // httpUrl: 'https://dev-api.osmosis.shapeshift.com',
                // wsUrl: 'wss://dev-api.osmosis.shapeshift.com'
                httpUrl: 'https://dev-api.ethereum.shapeshift.com',
                wsUrl: 'wss://dev-api.ethereum.shapeshift.com'
            }
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

        //get seed

        //get serailized wallet
        let walletWatch = {}
        //get pubkeys
        let pubkeys = {}

        //pair
        let pairWalletNative:any = {
            type:'native',
            name:'native',
            format:'mnemonic',
            isWatch:false,
            mnemonic:"TODO",
            serialized:walletWatch,
            pubkeys:pubkeys,
        }
        log.info(tag,"pairWalletKeepKey: ",pairWalletNative)
        let registerResult = await app.pairWallet(pairWalletNative)
        assert(registerResult)
        log.info(tag,"registerResult: ",registerResult)

        //TODO verify sdk state
        // let masterAddress = await app.getAddress(ASSET)
        // assert(masterAddress)
        // log.test(tag,"masterAddress: ",masterAddress)

        //build tx
        // let options:any = {
        //     verbose: true,
        //     txidOnResp: false, // txidOnResp is the output format
        // }
        //
        // let transfer:any = {
        //     type:'transfer',
        //     addressFrom:masterAddress,
        //     context:app.context,
        //     recipient: FAUCET_OSMO_ADDRESS,
        //     asset: ASSET,
        //     network: ASSET,
        //     memo: '',
        //     "amount":amountTestNative,
        //     fee:{
        //         priority:5, //1-5 5 = highest
        //     },
        //     noBroadcast
        // }
        // log.debug(tag,"transfer: ",transfer)
        //
        // let responseTx = await app.buildTx(transfer,options,ASSET)
        // assert(responseTx)
        // assert(responseTx.HDwalletPayload)
        // log.info(tag,"responseTx: ",responseTx)
        // console.timeEnd('start2build');
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
