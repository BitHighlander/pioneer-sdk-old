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
let queryKey = 'fobarbrasdfsdfsadoaasdasdasdsa'

let run_test = async function(){
    try{
        console.log("*** Running test module ***")

        let config = {
            // queryKey:"key:31ce8537-12f0-4c52-9e68-49ea2783f338aa",
            queryKey,
            // username,
            spec,
            wss,
            service:'pioneers.dev',
            url:'swaps.pro'
        }

        console.log(config)
        let app = new SDK.SDK(spec,config,true)
        //console.log(app)
        let seedChains = ['bitcoin','ethereum','thorchain','litecoin','bitcoincash']
        await app.init(seedChains)

        //
        let invocationId = "pioneer:invocation:v0.01:BCH:3dj828UpYcPY4SD1s4gLHc"

        //TODO sub to invocationId

        //get invocation
        // let invocation =  await app.getInvocation(invocationId)
        // console.log(invocation)

        let user = await app.getUserParams()
        console.log("user: ",user.username)
        console.log("availableContexts: ",user.availableContexts)

        // let info = await app.clients.bitcoin.info()
        // console.log(info)

    }catch(e){
        console.error(e)
    }
}

run_test()
