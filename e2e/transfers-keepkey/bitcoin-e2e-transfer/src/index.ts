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


//connect to keepkey
let getDevice = async function(keyring:any) {
    let tag = TAG + " | getDevice | "
    try {
        const keepkeyAdapter = NodeWebUSBKeepKeyAdapter.useKeyring(keyring);
        let wallet = await keepkeyAdapter.pairDevice(undefined, true);
        if (wallet) {
            log.debug(tag,"Device found!")
            log.debug(tag,"wallet: ",wallet)
        }
        return wallet;
    } catch (e) {
        //log.error(tag,"*** e: ",e.toString())
        log.error("failed to get device: ",e)
        //@ts-ignore
        if(e.message.indexOf("no devices found") >= 0){
            return {
                error:true,
                errorCode: 1,
                errorMessage:"No devices"
            }
            //@ts-ignore
        } else if(e.message.indexOf("claimInterface")>= 0){
            return {
                error:true,
                errorCode: -1,
                errorMessage:"Unable to claim!"
            }
        } else {
            return {
                error:true,
                errorMessage:e
            }
        }
    }
}

const test_service = async function () {
    let tag = TAG + " | test_service | "
    try {
        // console.time('start2paired');
        // console.time('start2build');
        // console.time('start2broadcast');
        // console.time('start2end');

        //start app and get wallet
        log.debug(tag,"CHECKPOINT 1")
        //connect to keepkey
        const keyring = new core.Keyring();
        log.debug(tag,"CHECKPOINT 2")

        let wallet:any = await getDevice(keyring);
        log.debug(tag,"wallet: ",wallet)
        log.debug(tag,"CHECKPOINT 3")

        let keepkeySdk
        let pubkeys
        let walletWatch
        if(!wallet?.error){
            log.debug(tag,"KKSDK: ",KKSDK)
            keepkeySdk = new KKSDK(wallet,blockchains)
            let pubkeysResp = await keepkeySdk.getPubkeys()
            walletWatch = pubkeysResp.wallet
            pubkeys = pubkeysResp.pubkeys
            log.debug(tag,'pubkeys: ',JSON.stringify(pubkeys))
        } else {
            log.error(" Device error: ",wallet)
            throw Error('wallet error!')
        }

        //

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
        let API = await app.init(blockchains)
        assert(API)

        let events = await app.startSocket()

        //get seed

        // //get serailized wallet
        // let walletWatch = {}
        // //get pubkeys
        // let pubkeys = {}

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
        let masterAddress = await app.getAddress(ASSET)
        assert(masterAddress)
        log.test(tag,"masterAddress: ",masterAddress)

        //test amount in native
        let amountTestNative = baseAmountToNative(ASSET,TEST_AMOUNT)
        assert(amountTestNative)

        let transfer:any = {
            type:'transfer',
            addressFrom:masterAddress,
            context:app.context,
            recipient: FAUCET_OSMO_ADDRESS,
            asset: ASSET,
            network: ASSET,
            memo: '',
            "amount":amountTestNative,
            fee:{
                priority:5, //1-5 5 = highest
            },
            noBroadcast
        }
        log.debug(tag,"transfer: ",transfer)

        let responseTx = await app.buildTx(transfer)
        assert(responseTx)
        assert(responseTx.HDwalletPayload)
        log.info(tag,"responseTx: ",responseTx)
        console.timeEnd('start2build');
        //invoke unsigned
        let transaction:any = {
            type:'pioneer',
            fee:{
                priority:3
            },
            unsignedTx:responseTx,
            context:app.context,
            network:ASSET
        }

        //invoke raw TX
        let options:any = {
            verbose: true,
            txidOnResp: false, // txidOnResp is the output format
        }

        //get invocation
        log.info(tag,"transaction: ",transaction)
        let responseInvoke = await app.invokeUnsigned(transaction,options,ASSET)
        assert(responseInvoke)
        log.info(tag,"responseInvoke: ",responseInvoke)
        let invocationId = responseInvoke.invocationId
        assert(invocationId)

        //verify invoke success
        //get invocation
        let invocationView1 = await app.getInvocation(invocationId)
        log.debug(tag,"invocationView1: (VIEW) ",invocationView1)
        assert(invocationView1)
        assert(invocationView1.state)

        //todo assert state
        assert(invocationView1)
        assert(invocationView1.state)
        assert(invocationView1.invocation)
        assert(invocationView1.invocation.unsignedTx)
        assert(invocationView1.invocation.unsignedTx.HDwalletPayload)

        //TODO verify

        //sign transaction
        let signedTx:any = await app.signTx(invocationView1.invocation.unsignedTx)
        log.info(tag,"signedTx: ",signedTx)
        log.info(tag,"signedTx: ",signedTx.serialized)
        assert(signedTx)
        // assert(signedTx.txid)

        //updateTx
        let updateBody = {
            network:ASSET,
            invocationId,
            invocation:invocationView1,
            unsignedTx:responseTx,
            signedTx
        }

        //update invocation remote
        log.info(tag,"updateBody: ",JSON.stringify(updateBody))
        let resultUpdate = await app.updateInvocation(updateBody)
        assert(resultUpdate)
        log.info(tag,"resultUpdate: ",resultUpdate)

        //get invocation verify signed
        let invocationView2 = await app.getInvocation(invocationId)
        assert(invocationView2)
        assert(invocationView2.state)
        assert.equal(invocationView2.state,'signedTx')
        log.debug(tag,"invocationView2: (VIEW) ",invocationView2)

        //TODO broadcast transaction


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
