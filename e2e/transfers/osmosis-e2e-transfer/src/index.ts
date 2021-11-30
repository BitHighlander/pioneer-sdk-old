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
let SDK = require('@pioneer-platform/sdk')
let wait = require('wait-promise');
let sleep = wait.sleep;

import {
    Transfer
} from "@pioneer-sdk/types";

let {
    supportedBlockchains,
    baseAmountToNative,
    nativeToBaseAmount,
} = require("@pioneer-sdk/coins")

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

        let config = {
            queryKey,
            username,
            spec,
            wss
        }
        log.debug(tag,"config: ",config)
        let app = new SDK.SDK(spec,config)
        let seedChains = ['ethereum','thorchain','bitcoin','osmosis','cosmos']
        let API = await app.init(seedChains)
        assert(API)

        let events = await app.startSocket()


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
