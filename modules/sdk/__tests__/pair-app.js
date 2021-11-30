require("dotenv").config({path:'./../../.env'})
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})
require("dotenv").config({path:'../../../../../.env'})

const prettyjson = require('prettyjson');
let SDK = require('../lib/index.js')

// let urlSpec = "http://127.0.0.1:9001/spec/swagger.json"
let urlSpec = process.env['URL_PIONEER_SPEC']


let wss = process.env['URL_PIONEER_SOCKET'] || 'ws://127.0.0.1:9001'
let spec = process.env['URL_PIONEER_SPEC'] || 'http://127.0.0.1:9001/spec/swagger.json'

//let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
// let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'

let username = process.env['TEST_USERNAME_2'] || 'test-user-2'

//let queryKey = process.env['TEST_QUERY_KEY_2'] || 'fobarbrasdfsdfsadoaasdasdasdsa'
let queryKey = 'fobarbrasdfsdfsadoaasdasdasdsaasdasasdasd'

let run_test = async function(){
    try{
        console.log("*** Running test module ***")

        let config = {
            queryKey,
            // username,
            spec,
            wss,
            service:'asgardxasdas',
            url:'swaps.pro'
        }

        console.log(config)
        let app = new SDK.SDK(spec,config,true)
        //console.log(app)
        let seedChains = ['bitcoin','ethereum','thorchain','litecoin','bitcoincash','osmosis']
        await app.init(seedChains)

        //init
        // let app = new SDK(urlSpec,config)
        // await app.init()
        //
        //console.log("app: ",app)

        // let code = await app.createPairingCode()
        // console.log("code: ",code)

        console.log("app: ",app.context)

        //is paired?
        let info = await app.getUserInfo()
        console.log("info: ",info)

        if(!info || info.error){
            console.log("Not paired! ")

            //create pairing code

            //start socket
            let events = await app.startSocket()
            console.log("events: ",events)
            events.on('message', async (request) => {
                console.log("**** message: ", request)
                //
                if(request.type === 'pairing'){
                    //when paired, start

                    // //get user wallets
                    // let wallets = await app.wallets
                    // console.log("wallets: ",wallets)
                    //
                    // //get current context
                    // let context = app.context
                    // console.log("context: ",context)
                    //
                    // //start socket
                    // let events = await app.startSocket()
                    // console.log("events: ",events)
                    // events.on('message', async (request) => {
                    //     console.log("**** message: ", request)
                    // })
                    //
                    // //get user
                    // let user = await app.getUserParams()
                    // console.log("user: ",user)
                    // if(!user.clients) throw Error("Failed to create user!")
                    //
                    // //intergration test asgard-exchange
                    // let blockchains = Object.keys(user.clients)
                    // console.log("blockchains: ",blockchains)
                    //
                    // for(let i = 0; i < blockchains.length; i++){
                    //     let blockchain = blockchains[i]
                    //     let client = user.clients[blockchain]
                    //
                    //     let balance = await client.getBalance()
                    //     //console.log(blockchain+ " balance: ",balance)
                    //     console.log(blockchain+ " balance: ",balance[0].amount.amount().toString())
                    // }
                }
            })

            let code = await app.createPairingCode()
            console.log("code: ",code)
        } else {
            console.log(" ALREADY PAIRED! MAKE NEW KEY!")

        }



    }catch(e){
        console.error(e)
    }
}

run_test()
