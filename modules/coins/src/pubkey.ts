
/*
    classifyPubkey
 */
const bitcoinRegex     = require('bitcoin-regex');
const ethereumRegex    = require('ethereum-regex');
const litecoinRegex    = require('litecoin-regex');
const dogecoinRegex    = require('dogecoin-regex');
const bitcoincashRegex = require('bitcoincash-regex');
const dashRegex        = require('dash-regex');
const moneroRegex      = require('monero-regex');
const rippleRegex      = require('ripple-regex');
const neoRegex         = require('neo-regex');

export function classifyPubkey(address:string) {
    if (bitcoinRegex({exact: true}).test(address)) return 'BTC';
    else if (ethereumRegex({exact: true}).test(address)) return 'ETH';
    else if (litecoinRegex({exact: true}).test(address)) return 'LTC';
    else if (dogecoinRegex({exact: true}).test(address)) return 'DOGE';
    else if (dashRegex({exact: true}).test(address)) return 'DASH';
    else if (moneroRegex({exact: true}).test(address)) return 'XMR';
    else if (rippleRegex({exact: true}).test(address)) return 'XRP';
    else if (bitcoincashRegex.format('cashaddr', {exact: true}).test(address)) return 'BCH';
    else if (neoRegex({exact: true}).test(address)) return 'NEO'

    //Hacky, hard coded
    switch(address[0]) {
        //Dash multi-sig p2sh
        case "S":
            return 'DASH'
            break;
        //Doge multi-sig p2sh
        case "A":
            return 'DOGE'
            break;
        //Doge multi-sig p2sh
        case "9":
            return 'DOGE'
            break;
    }

    return 'Cryptocurrency could not be detected'
}
