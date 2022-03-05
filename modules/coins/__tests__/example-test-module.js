

require("dotenv").config({path:'../../../../.env'})
let coins = require("../dist")


let spec = 'http://localhost:1646/spec/swagger.json'

let run_test = async function(){
    try{

        let thing = coins.bip32ToAddressNList("m/44'/118'/0'/0/0")
        console.log(thing)

    }catch(e){
        console.error(e)
    }
}

run_test()