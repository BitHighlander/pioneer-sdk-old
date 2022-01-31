/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */

import {v4 as uuidv4} from "uuid";

const TAG = " | MOCK_APP | "
const log = require("@pioneer-platform/loggerdog")()

const { NodeWebUSBKeepKeyAdapter } = require('@shapeshiftoss/hdwallet-keepkey-nodewebusb')
const core = require('@shapeshiftoss/hdwallet-core');
const pioneerApi = require('@pioneer-platform/pioneer-client')

let SDK = require('@pioneer-sdk/sdk')

const KK = require('@shapeshiftoss/hdwallet-keepkey-nodewebusb')
// eslint-disable-next-line react-hooks/rules-of-hooks
const adapter = KK.NodeWebUSBKeepKeyAdapter.useKeyring(new core.Keyring())
let wait = require('wait-promise');
import * as keepkeyTcp from '@shapeshiftoss/hdwallet-keepkey-tcp'
import path from "path";

const swaggerUi = require('swagger-ui-express');
//path.join(__dirname, 'assets')
const swaggerDocument = require(path.join(__dirname, '../api/dist/swagger.json'))

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const appExpress = express()
appExpress.use(cors())
appExpress.use(bodyParser.urlencoded({ extended: false }))
appExpress.use(bodyParser.json())



let STATUS = 'preInit'
let server = {}
let tray = {}
let USERNAME:any
let PIONEER_API:any
let STATE = 0
let isQuitting = false
let eventIPC = {}
let ACCEPTED_INVOCATIONS:any = []

export class APP {
    private init: () => Promise<void>;
    private spec: string;
    private wss: any;
    private blockchains: any;
    private queryKey: any;
    private username: any;
    private runBridge: () => Promise<void>;
    runRenderer: () => Promise<void>;
    constructor(spec:string,config:any) {
        this.spec = config.spec
        this.wss = config.wss
        this.blockchains = config.blockchains
        this.queryKey = config.queryKey
        this.username = config.username
        this.init = async function () {
            let tag = TAG + " | init | "
            try {
                if(!this.blockchains) throw Error("Failed to init, no blockchains")
                //get keepkey device
                //start app and get wallet
                log.debug(tag,"CHECKPOINT 1")
                //connect to keepkey
                const keyring = new core.Keyring();
                log.debug(tag,"CHECKPOINT 2")
                //pair
                let config = {
                    queryKey:this.queryKey,
                    username:this.username,
                    spec:this.spec,
                    wss:this.wss,
                    blockchains:this.blockchains
                }

                //start api
                if (!config.queryKey) throw Error('Failed to init querKey!')
                if (!config.spec) throw Error('Failed to init spec!')
                USERNAME = config.username

                let pioneer = new pioneerApi(config.spec, config)
                PIONEER_API = await pioneer.init(config.blockchains)
                let status = await PIONEER_API.instance.Status()
                log.debug(tag, 'status: ', status.data)

                return status
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.runBridge = async function () {
            let tag = TAG + " | runBridge | "
            try {
                if(!this.blockchains) throw Error("Failed to init, no blockchains")
                //get keepkey device
                //start app and get wallet
                log.debug(tag,"CHECKPOINT 1")
                //connect to keepkey
                const keyring = new core.Keyring();
                log.debug(tag,"CHECKPOINT 2")

                let device = await adapter.getDevice()
                log.debug(tag,"device: ",device)
                log.debug(tag,"CHECKPOINT 3")

                //pair
                let config = {
                    queryKey:this.queryKey,
                    username:this.username,
                    spec:this.spec,
                    wss:this.wss,
                    blockchains:this.blockchains
                }

                //start api
                if (!config.queryKey) throw Error('Failed to init querKey!')
                if (!config.spec) throw Error('Failed to init spec!')
                USERNAME = config.username

                let pioneer = new pioneerApi(config.spec, config)
                PIONEER_API = await pioneer.init(config.blockchains)
                let status = await PIONEER_API.instance.Status()
                log.debug(tag, 'status: ', status.data)

                //start bridge
                if (device) {
                    let transport = await adapter.getTransportDelegate(device)
                    await transport.connect?.()
                    STATE = 2
                    STATUS = 'keepkey connected'

                    let API_PORT = process.env['API_PORT_BRIDGE'] || '1646'

                    //docs
                    appExpress.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

                    //swagger.json
                    appExpress.use('/spec', express.static('api/dist'));

                    //bridge
                    // @ts-ignore
                    appExpress.all('/exchange/device', async function (req, res, next) {
                        try {
                            if (req.method === 'GET') {
                                let resp = await transport.readChunk()
                                let output = {
                                    data: Buffer.from(resp).toString('hex')
                                }
                                log.debug('output: ', output)
                                if (res.status) res.status(200).json(output)
                            } else if (req.method === 'POST') {
                                let body = req.body
                                let msg = Buffer.from(body.data, 'hex')
                                transport.writeChunk(msg)
                                res.status(200).json({})
                            } else {
                                throw Error('unhandled')
                            }
                            next()
                        } catch (e) {
                            throw e
                        }
                    })

                    //pair pioneer
                    // @ts-ignore
                    appExpress.all('/pair/:code', async function (req, res, next) {
                        try {
                            if (req.method === 'GET') {
                                let code = req.params.code
                                let host = req.headers.host
                                //TODO hold till approval
                                let respPair = await PIONEER_API.instance.Pair(null, { code })
                                log.debug('respPair: ', respPair.data)
                                if (res.status)
                                    res.status(200).json({
                                        success: true,
                                        username: USERNAME,
                                        code
                                    })
                            }
                            next()
                        } catch (e) {
                            throw e
                        }
                    })

                    //status
                    // @ts-ignore
                    appExpress.all('/status', async function (req, res, next) {
                        try {
                            if (req.method === 'GET') {
                                res.status(200).json({
                                    success: true,
                                    username: USERNAME,
                                    status: STATUS,
                                    state: STATE
                                })
                            }
                            next()
                        } catch (e) {
                            throw e
                        }
                    })

                    //userInfo
                    // @ts-ignore
                    appExpress.all('/user', async function (req, res, next) {
                        try {
                            if (req.method === 'GET') {
                                let userInfo = await PIONEER_API.instance.User()
                                res.status(200).json(userInfo.data)
                            }
                            next()
                        } catch (e) {
                            throw e
                        }
                    })

                    //catchall
                    //@ts-ignore
                    appExpress.use((err, req, res) => {
                        const { status = 500, message = 'something went wrong. ', data = {} } = err
                        //log.debug(req.body, { status: status, message: message, data: data })
                        try {
                            res.status(status).json({ message, data })
                        } catch (e) {}
                    })

                    //port
                    try {
                        server = appExpress.listen(API_PORT, () => {
                            log.debug(`server started at http://localhost:${API_PORT}`)
                            STATE = 3
                            STATUS = 'bridge online'
                        })
                    } catch (e) {
                        STATE = -1
                        STATUS = 'bridge error'
                        log.debug('e: ', e)
                    }
                } else {
                    log.error('Can not start! waiting for device connect')
                }

            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.runRenderer = async function () {
            let tag = TAG + " | runRenderer | "
            try {
                if(!this.blockchains) throw Error("Failed to init, no blockchains")
                //init sdk
                log.debug(tag,"config: ",config)
                let app = new SDK.SDK(config.spec,config)
                let events = await app.startSocket()
                events.on('message', (event:any) => {
                    //log.info(tag,'message event! ',event);
                });
                events.on('invocations', async (event:any) => {
                    log.info(tag,'** message invocations! ',event);
                    //get invocation
                    if(event.type == 'signRequest' && event.invocationId){
                        let invocationInfo = await app.getInvocation(event.invocationId)
                        let unsignedTx = invocationInfo.unsignedTx
                        log.info(tag,'unsignedTx: ',unsignedTx);

                        //
                        if(ACCEPTED_INVOCATIONS.indexOf(event.invocationId) === -1){
                            ACCEPTED_INVOCATIONS.push(event.invocationId)
                            let signedTx = await app.signTx(unsignedTx)
                            log.info(tag,'signedTx: ',signedTx);

                            //
                            let updateBody = {
                                network:event.network,
                                invocationId:event.invocationId,
                                invocation:invocationInfo,
                                unsignedTx,
                                signedTx
                            }
                            //update invocation remote
                            let resultUpdate = await app.updateInvocation(updateBody)
                            log.info(tag,"resultUpdate: ",resultUpdate)

                            updateBody.signedTx.network = event.network
                            updateBody.signedTx.invocationId = event.invocationId
                            let broadcastResult = await app.broadcastTransaction(updateBody.signedTx)
                            log.info('broadcastResult: ', broadcastResult)

                        } else {
                            log.error("Already accepted invocation!")
                        }
                    }
                });


                await app.init(this.blockchains)

                log.debug("CHECKPOINT BRIDGE 2")
                await wait.sleep(2000)

                //connect to bridge
                let keyring = new core.Keyring()
                let bridgeAdapter = keepkeyTcp.TCPKeepKeyAdapter.useKeyring(keyring)
                // @ts-ignore
                let HDWallet = await bridgeAdapter.pairDevice('http://localhost:1646')

                log.debug("CHECKPOINT BRIDGE 3")
                await wait.sleep(2000)

                keyring.on(['KeepKey', '*', '*'],function(resp:any){
                    console.log("event: ",resp)
                })

                //pair wallet
                console.log('Checkpoint: pairWallet!')
                let resultPair = await app.pairWallet('keepkey', HDWallet)
                //console.log('resultPair: ', resultPair)

                log.debug("CHECKPOINT BRIDGE 4")
                await wait.sleep(2000)

                return resultPair
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
    }
}

