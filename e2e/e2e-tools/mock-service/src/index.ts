/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */

const TAG = " | MOCK_SERVICE | "
const log = require("@pioneer-platform/loggerdog")()

//Pioneer follows OpenAPI spec
const Pioneer = require('openapi-client-axios').default;
const Events = require("@pioneer-platform/pioneer-events")

export class SERVICE {
    private init: () => Promise<void>;
    private getPairingCode: () => Promise<void>;
    constructor(spec:string,config:any) {
        this.init = async function () {
            let tag = TAG + " | init | "
            try {
                //create api key

                //register key

                //sub to key

            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.getPairingCode = async function () {
            let tag = TAG + " | service MOCK | "
            try {
                //create pairing code

            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
    }
}

