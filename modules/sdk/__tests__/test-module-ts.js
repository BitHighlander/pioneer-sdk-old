require("dotenv").config({path:'./../../.env'})
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})
require("dotenv").config({path:'../../../../../.env'})

import { SDK } from "../lib"


let urlSpec = process.env['URL_PIONEER_SPEC']

let spec = process.env['URL_PIONEER_SPEC']
let username = process.env['TEST_USERNAME_2']
let queryKey = process.env['TEST_QUERY_KEY_2']

let run_test = async function(){
    try{
        console.log("*** Running test module ***")

        let config = {
            queryKey,
            username,
            spec
        }

        console.log("spec: ",spec)
        console.log("SDK: ",config)

        let app = new SDK("http://127.0.0.1:9001/spec/swagger.json",config,true)
        console.log("app: ",app)


        //
        // //init
        // let app = new SDK(urlSpec,config)

    }catch(e){
        console.error(e)
    }
}

run_test()
