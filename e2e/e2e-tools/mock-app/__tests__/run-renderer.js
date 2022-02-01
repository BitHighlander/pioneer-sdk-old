require("dotenv").config({path:'./../../.env'})
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})
require("dotenv").config({path:'../../../../../.env'})

const prettyjson = require('prettyjson');
let APP = require('../dist/index.js')

// let urlSpec = "http://127.0.0.1:9001/spec/swagger.json"
let urlSpec = process.env['URL_PIONEER_SPEC']


let wss = process.env['URL_PIONEER_SOCKET'] || 'ws://127.0.0.1:9001'
let spec = process.env['URL_PIONEER_SPEC'] || 'http://127.0.0.1:9001/spec/swagger.json'

//let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
// let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'

let username = process.env['TEST_USERNAME_2'] || 'user:0612bc0a'
let queryKey = process.env['TEST_QUERY_KEY_2'] || 'fobarbrasdfsdfsadoaasdasdasdsa'

let blockchains = [
    'bitcoin','ethereum','thorchain','bitcoincash','litecoin','binance','cosmos','dogecoin','osmosis'
]

let run_test = async function(){
    try{
        console.log("*** Running test module ***")
        let config = {
            username,
            queryKey,
            spec,
            wss,
            blockchains
        }
        //TODO software/hardware
        let app = new APP.APP(config.spec,config)

        await app.init(config.blockchains)

        await app.runRenderer()

        console.log("(renderer) system ready....")
    }catch(e){
        console.error(e)
    }
}

run_test()
