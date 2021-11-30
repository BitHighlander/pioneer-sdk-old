
const TAG = " | coin tools | "
const log = require("@pioneer-platform/loggerdog")()
const bitcoin = require("bitcoinjs-lib");
const ethUtils = require('ethereumjs-util');
const ripemd160 = require("crypto-js/ripemd160")
const CryptoJS = require("crypto-js")
const sha256 = require("crypto-js/sha256")
const bech32 = require(`bech32`)
//import BigNumber from 'bignumber.js'
const b58 = require('bs58check');
const BIP84 = require('bip84')
import { getNetwork } from "./networks";
let {
    getPaths,
} = require('./paths')

/*
    Swap protocals

 */

export const getSwapProtocals = function(asset:string, network:string){
    try{
        let output = []
        if(network === 'ETH'){
            output.push('0x')
        }
        let thorchainAssets = [ 'BCH', 'BNB', 'BTC', 'ETH', 'LTC' ]
        if(thorchainAssets.indexOf(asset) >= 0){
            output.push('thorchain')
        }
        let osmoAssets = [ 'OSMO', 'ATOM' ]
        if(osmoAssets.indexOf(asset) >= 0){
            output.push('osmosis')
        }
        return output
    }catch(e){
        log.error(e)
    }
}


/*
    TODO SS caip decoder

 */


/*
    Thorchain string parser

 */

export const parseThorchainAssetString = function(input:string){
    try{
        let parts = input.split(".")
        let network = parts[0]
        let asset
        let symbol
        let contract
        if(parts[1].indexOf("-") >= 0){
            //is Token
            let parts2 = parts[1].split("-")
            contract = parts2[1]
            asset = parts2[0]
            symbol = parts2[0]
        }else{
            //is Native asset
            asset = parts[0]
            symbol = parts[0]
        }
        return {
            asset,
            symbol,
            network,
            contract
        }
    }catch(e){
        log.error(e)
    }
}

export enum HDWALLETS {
    'pioneer',
    'trezor',
    'keepkey',
    'ledger'
}

/*


*/

export const UTXO_COINS = [
    'BTC',
    'BCH',
    'DOGE',
    'LTC',
    'TEST'
]

/*
    Name maps
 */
export const COIN_MAP = {
    bitcoin: "BTC",
    cosmos: "ATOM",
    osmosis: "OSMO",
    testnet: "TEST",
    bitcoincash: "BCH",
    litecoin: "LTC",
    dash: "DASH",
    digibyte: "DGB",
    dogecoin: "DOGE",
    ethereum: "ETH",
    cardano: "ADA",
    binance: "BNB",
    thorchain: "RUNE",
    eos: "EOS",
    fio: "FIO",
};

export const COIN_MAP_LONG:any = {
    BTC: "bitcoin",
    ATOM: "cosmos",
    OSMO: "osmosis",
    BTCT: "testnet",
    BCH: "bitcoincash",
    LTC: "litecoin",
    DASH: "dash",
    DGB: "digiByte",
    DOGE: "dogecoin",
    RUNE: "thorchain",
    ETH: "ethereum",
    ADA: "cardano",
    BNB: "binance",
    EOS: "eos",
    FIO: "fio",
};

export const COIN_MAP_LONG_XCHAIN:any = {
    BTC: "bitcoin",
    ATOM: "cosmos",
    OSMO: "osmosis",
    BTCT: "testnet",
    BCH: "bitcoinCash",
    LTC: "litecoin",
    DASH: "dash",
    DGB: "digiByte",
    DOGE: "dogecoin",
    RUNE: "thorchain",
    ETH: "ethereum",
    ADA: "cardano",
    BNB: "binance",
    EOS: "eos",
    FIO: "fio",
};

export const COIN_MAP_KEEPKEY_LONG:any = {
    BTC: "Bitcoin",
    ATOM: "cosmos",
    OSMO: "osmosis",
    BTCT: "testnet",
    BCH: "BitcoinCash",
    LTC: "Litecoin",
    DASH: "Dash",
    DGB: "DigiByte",
    DOGE: "Dogecoin",
    RUNE: "Thorchain",
    ETH: "Ethereum",
    ADA: "Cardano",
    BNB: "Binance",
    EOS: "Eos",
    FIO: "Fio",
};

export const SLIP_44_BY_LONG:any = {
    bitcoin: 0,
    testnet: 1,
    bitcoincash: 145,
    bitcoingold: 156,
    litecoin: 2,
    dash: 5,
    digibyte: 20,
    dogecoin: 3,
    bitcoinsv: 236,
    ethereum: 60,
    cosmos: 118,
    osmosis: 118,
    binance: 714,
    ripple: 144,
    eos: 194,
    fio: 235,
    thorchain: 931,
    cardano: 1815,
    secret: 529,
    terra: 931,
    kava: 459,
};

export const GET_NETWORK_NAME = function(network:string){
    let networkName
    switch (network) {
        case "1":
            networkName = "Main";
            break;
        case "2":
            networkName = "Morden";
            break;
        case "3":
            networkName = "Ropsten";
            break;
        case "4":
            networkName = "Rinkeby";
            break;
        case "42":
            networkName = "Kovan";
            break;
        default:
            networkName = "Unknown";
    }
    return networkName
}

const HARDENED = 0x80000000;
export function bip32Like(path: string): boolean {
    if (path == "m/") return true;
    return /^m(((\/[0-9]+h)+|(\/[0-9]+H)+|(\/[0-9]+')*)((\/[0-9]+)*))$/.test(path);
}

export function bip32ToAddressNList(path: string): number[] {
    if (!bip32Like(path)) {
        throw new Error(`Not a bip32 path: '${path}'`);
    }
    if (/^m\//i.test(path)) {
        path = path.slice(2);
    }
    const segments = path.split("/");
    if (segments.length === 1 && segments[0] === "") return [];
    const ret = new Array(segments.length);
    for (let i = 0; i < segments.length; i++) {
        const tmp = /(\d+)([hH\']?)/.exec(segments[i]);
        if (tmp === null) {
            throw new Error("Invalid input");
        }
        ret[i] = parseInt(tmp[1], 10);
        if (ret[i] >= HARDENED) {
            throw new Error("Invalid child index");
        }
        if (tmp[2] === "h" || tmp[2] === "H" || tmp[2] === "'") {
            ret[i] += HARDENED;
        } else if (tmp[2].length !== 0) {
            throw new Error("Invalid modifier");
        }
    }
    return ret;
}

export function addressNListToBIP32(address: number[]): string {
    return `m/${address.map((num) => (num >= HARDENED ? `${num - HARDENED}'` : num)).join("/")}`;
}

export function getNativeAssetForBlockchain(blockchain:string){
    // @ts-ignore
    if(COIN_MAP[blockchain.toLowerCase()]){
        // @ts-ignore
        return COIN_MAP[blockchain.toLowerCase()]
    } else {
        throw Error(" Unknown blockchain! "+blockchain)
    }
}


export const supportedBlockchains:any = [];
export const supportedAssets:any = [];

if(process.env['FEATURE_BITCOIN_BLOCKCHAIN']) {
    supportedBlockchains.push("Bitcoin")
    supportedAssets.push("BTC")
}

if(process.env['FEATURE_ETHEREUM_BLOCKCHAIN']) {
    supportedBlockchains.push("Ethereum")
    supportedAssets.push("ETH")
    //TODO get token list from npm
    //add all supported
}

if(process.env['FEATURE_THORCHAIN_BLOCKCHAIN']) {
    supportedBlockchains.push("Thorchain")
    supportedAssets.push("RUNE")
}

if(process.env['FEATURE_SECRET_BLOCKCHAIN']){
    supportedBlockchains.push("Secret")
    supportedAssets.push("SCRT")
}

if(process.env['FEATURE_KAVA_BLOCKCHAIN']){
    supportedBlockchains.push("Kava")
    supportedAssets.push("KAVA")
}

if(process.env['FEATURE_TERRA_BLOCKCHAIN']){
    supportedBlockchains.push("Terra")
    supportedAssets.push("LUNA")
}

if(process.env['FEATURE_BSC_BLOCKCHAIN']){
    supportedBlockchains.push("BinanceSmartChain")
    supportedAssets.push("BNB")
}

if(process.env['FEATURE_CARDANO_BLOCKCHAIN']){
    supportedBlockchains.push("Cardano")
    supportedAssets.push("ADA")
}

if(process.env['FEATURE_BNB_BLOCKCHAIN']){
    supportedBlockchains.push("Thorchain")
    supportedAssets.push("RUNE")
}

if(process.env['FEATURE_EOS_BLOCKCHAIN']){
    supportedBlockchains.push("Eos")
    supportedAssets.push("EOS")
}

if(process.env['FEATURE_FIO_BLOCKCHAIN']){
    supportedBlockchains.push("Fio")
    supportedAssets.push("FIO")
}

if(process.env['FEATURE_COSMOS_BLOCKCHAIN']){
    supportedBlockchains.push("Cosmos")
    supportedAssets.push("ATOM")
}

if(process.env['FEATURE_OSMOSIS_BLOCKCHAIN']){
    supportedBlockchains.push("Osmosis")
    supportedAssets.push("OSMO")
}

if(process.env['FEATURE_BINANCE_BLOCKCHAIN']){
    supportedBlockchains.push("Binance")
    supportedAssets.push("BNB")
}

if(process.env['FEATURE_BITCOINCASH_BLOCKCHAIN']){
    supportedBlockchains.push("BitcoinCash")
    supportedAssets.push("BCH")
}

if(process.env['FEATURE_LITECOIN_BLOCKCHAIN']){
    supportedBlockchains.push("Litecoin")
    supportedAssets.push("LTC")
}

// (only 1 native assets for each enabled blockchain)
export const COIN_ICONS_BY_SYMBOL = {
    BTC:"https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579",
    ETH:"https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
    LTC:"https://assets.coingecko.com/coins/images/16724/thumb/ltc.png",
    BNB:"https://assets.coingecko.com/coins/images/825/thumb/binance-coin-logo.png?1547034615",
    BCH:"https://assets.coingecko.com/coins/images/780/thumb/bitcoin-cash-circle.png?1594689492",
    OSMO:"https://assets.coingecko.com/coins/images/16724/thumb/osmo.png",
    ATOM:"https://assets.coingecko.com/coins/images/16724/thumb/atom.png",
    FIO:"https://assets.coingecko.com/coins/images/16724/thumb/fio.png",
    EOS:"https://assets.coingecko.com/coins/images/16724/thumb/eos.png",
    RUNE:"https://assets.coingecko.com/coins/images/6595/thumb/RUNE.png",
    ADA:"https://assets.coingecko.com/coins/images/16724/thumb/ada.png",
    LUNA:"https://assets.coingecko.com/coins/images/8284/thumb/luna1557227471663.png?1567147072",
    KAVA:"https://assets.coingecko.com/coins/images/16724/thumb/kava.png",
    SCRT:"https://assets.coingecko.com/coins/images/16724/thumb/scrt.png",
}

//TODO add more flags by networks
const NETWORKS:any = {
    btc: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80
    },
    bch: {
        messagePrefix: '\x18Bitcoin Cash Signed Message:\n',
        bip32: {
            public: 0x0488B21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80
    },
    test: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef
    },
    ltc: {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bip32: {
            public: 0x019da462,
            private: 0x019d9cfe
        },
        pubKeyHash: 0x30,
        scriptHash: 0x32,
        wif: 0xb0
    },
    doge: {
        messagePrefix: '\x19Dogecoin Signed Message:\n',
        bip32: {
            public: 0x02FD3929,
            private: 0x02FD3955
        },
        pubKeyHash: 0x1e,
        scriptHash: 0x16,
        wif: 0x9e
    },
    dash: {
        messagePrefix: 'unused',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0x4c,
        scriptHash: 0x10,
        wif: 0xcc
    },
    dgb: {
        messagePrefix: '\x18DigiByte Signed Message:\n',
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4,
        },
        pubKeyHash: 0x1e,
        scriptHash: 0x3f,
        wif: 0x80,
    },
    rdd: {
        messagePrefix: '\x18Reddcoin Signed Message:\n',
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4,
        },
        pubKeyHash: 0x3d,
        scriptHash: 0x05,
        wif: 0xbd,
    },
    testnet: {
        base: {
            messagePrefix: "\x18Bitcoin Signed Message:\n",
            bech32: "tb",
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
        },
        p2sh: {
            bip32: {
                public: 0x043587cf,
                private: 0x04358394,
            },
        },
        p2pkh: {
            bip32: {
                public: 0x043587cf,
                private: 0x04358394,
            },
        },
        "p2sh-p2wpkh": {
            bip32: {
                public: 0x044a5262,
                private: 0x044a4e28,
            },
        },
        p2wpkh: {
            bip32: {
                public: 0x045f1cf6,
                private: 0x045f18bc,
            },
        },
    },
}

export enum PoSchains {
    'eos',
    'cosmos',
    'osmosis',
    'binance',
    'fio',
    'terra',
    'kava',
    'secret'
}

export const CURRENCY_DECIMALS:any = {
    'btc': 8,
    'rune': 8,
    'dash': 8,
    'atom': 6,
    'osmo': 6,
    'ltc': 8,
    'bch': 8,
    'doge': 8,
    'eth': 18,
    'gnt': 18,
    'usdt': 6,
    'trx': 6,
    'bnb': 8,
    'poly': 18,
    'gno': 18,
    'sngls': 0,
    'icn': 18,
    'dgd': 9,
    'mln': 18,
    'rep': 18,
    'swt': 18,
    'wings': 18,
    'trst': 6,
    'rlc': 9,
    'gup': 3,
    'ant': 18,
    'bat': 18,
    'bnt': 18,
    'snt': 18,
    'nmr': 18,
    'edg': 0,
    'eos': 18,
    'cvc': 8,
    'link': 18,
    'knc': 18,
    'mtl': 8,
    'pay': 18,
    'fun': 8,
    'dnt': 18,
    'zrx': 18,
    '1st': 18,
    'omg': 18,
    'salt': 8,
    'rcn': 18,
    'storj': 8,
    'zil': 12,
    'mana': 18,
    'tusd': 18,
    'ae': 18,
    'dai': 18,
    'mkr': 18
}

export function getPrecision(asset:string){
    if(CURRENCY_DECIMALS[asset.toLowerCase()]){
        return CURRENCY_DECIMALS[asset.toLowerCase()]
    } else {
        throw Error(" Unknown asset! "+asset)
    }
}

export function nativeToBaseAmount(asset:string,amount:number){
    if(!CURRENCY_DECIMALS[asset.toLowerCase()]) throw Error("Unknown asset!")
    let output:any = amount / Math.pow(10, CURRENCY_DECIMALS[asset.toLowerCase()]);
    return output
}

export function baseAmountToNative(asset:string,amount:number){
    if(!CURRENCY_DECIMALS[asset.toLowerCase()]) throw Error("Unknown asset!")
    let output:any = amount * Math.pow(10, CURRENCY_DECIMALS[asset.toLowerCase()]);
    output = parseInt(output)
    return output
}

export const stakingCoins = ["EOS", "ATOM"];

export const segwitCoins = ["Bitcoin", "Testnet", "BitcoinGold", "Litecoin"];

export function getExplorerUrl(network:string,token:string, testnet:boolean){
    if(testnet){
        let href
        switch (network) {
            case 'bitcoin':
                href = 'https://blockstream.info/testnet'
                break
            case 'ethereum':
                href = 'https://ropsten.etherscan.io/'
                break
        }
        return href
    }else{
        let href
        switch (network) {
            case 'bitcoin':
                href = 'https://www.blockchain.com/'
                break
            case 'ethereum':
                href = 'https://etherscan.io'
                break
            case 'bitcoinCash':
                href = 'https://blockchair.com/bitcoin-cash'
                break
            case 'binance':
                href = 'https://explorer.binance.org'
                break
            case 'cosmos':
                href = 'https://www.mintscan.io'
                break
            case 'osmosis':
                href = 'https://www.mintscan.io'
                break
            case 'dash':
                return `https://chainz.cryptoid.info/dash`
            case 'doge':
                return `https://dogechain.info`
        }
        return href
    }
}

export function getExplorerAddressUrl(address:string,network:string,token:string, testnet:boolean){
    if(testnet){
        let href
        switch (network) {
            case 'bitcoin':
                href = 'https://blockstream.info/testnet/address/'+address
                break
            case 'ethereum':
                href = 'https://ropsten.etherscan.io/address/'+address
                break
        }
        return href
    }else{
        let href
        switch (network) {
            //TODO
            // case 'bitcoin':
            //     href = 'https://www.blockchain.com/'
            //     break
            // case 'ethereum':
            //     href = 'https://etherscan.io'
            //     break
            // case 'bitcoinCash':
            //     href = 'https://blockchair.com/bitcoin-cash'
            //     break
            // case 'binance':
            //     href = 'https://explorer.binance.org'
            //     break
            // case 'cosmos':
            //     href = 'https://www.mintscan.io'
            //     break
            // case 'dash':
            //     return `https://chainz.cryptoid.info/dash`
            // case 'doge':
            //     return `https://dogechain.info`
        }
        return href
    }
}

export function getExplorerTxUrl(tx:string,network:string,token:string, testnet:boolean){
    if(testnet){
        let href
        switch (network) {
            case 'bitcoin':
                href = 'https://blockstream.info/testnet/tx/'+tx
                break
            case 'ethereum':
                href = 'https://ropsten.etherscan.io/tx/'+tx
                break
        }
        return href
    }else{
        let href
        switch (network) {
            //TODO
            // case 'bitcoin':
            //     href = 'https://www.blockchain.com/'
            //     break
            // case 'ethereum':
            //     href = 'https://etherscan.io'
            //     break
            // case 'bitcoinCash':
            //     href = 'https://blockchair.com/bitcoin-cash'
            //     break
            // case 'binance':
            //     href = 'https://explorer.binance.org'
            //     break
            // case 'cosmos':
            //     href = 'https://www.mintscan.io'
            //     break
            // case 'dash':
            //     return `https://chainz.cryptoid.info/dash`
            // case 'doge':
            //     return `https://dogechain.info`
        }
        return href
    }
}


function bech32ify(address:any, prefix:string) {
    const words = bech32.toWords(address)
    return bech32.encode(prefix, words)
}

// NOTE: this only works with a compressed public key (33 bytes)
function createBech32Address(publicKey:any,prefix:string) {
    const message = CryptoJS.enc.Hex.parse(publicKey.toString(`hex`))
    const hash = ripemd160(sha256(message)).toString()
    const address = Buffer.from(hash, `hex`)
    const cosmosAddress = bech32ify(address, prefix)
    return cosmosAddress
}

// All known xpub formats
const prefixes:any = new Map(
    [
        ['xpub', '0488b21e'],
        ['ypub', '049d7cb2'],
        ['Ypub', '0295b43f'],
        ['zpub', '04b24746'],
        ['Zpub', '02aa7ed3'],
        ['tpub', '043587cf'],
        ['upub', '044a5262'],
        ['Upub', '024289ef'],
        ['vpub', '045f1cf6'],
        ['Vpub', '02575483'],
        ['Ltub', '02575483'],
    ]
);

enum AddressTypes {
    "bech32",
    "legacy"
}

export function xpubConvert(xpub:string,target:string){
    if (!prefixes.has(target)) {
        return "Invalid target version";
    }

    // trim whitespace
    xpub = xpub.trim();

    var data = b58.decode(xpub);
    data = data.slice(4);
    data = Buffer.concat([Buffer.from(prefixes.get(target),'hex'), data]);
    return b58.encode(data);
}

export async function normalize_pubkeys(format:string,pubkeys:any,pathsIn:any, isTestnet?:boolean) {
    let tag = TAG + " | normalize_pubkeys | "
    try {
        log.debug(tag,"input: ",{format,pubkeys,pathsIn,isTestnet})
        if(!isTestnet) isTestnet = false

        if(pathsIn.length !== pubkeys.length){
            log.error(tag,"pubkeys: ",pubkeys.length)
            log.error(tag,"pathsIn: ",pathsIn.length)
            throw Error("102: invalid input, paths dont match!")
        }

        let output:any = []
        if(format === 'keepkey'){
            for(let i = 0; i < pubkeys.length; i++){
                let pubkey:any = pathsIn[i]
                log.debug(tag,"pubkey: ",pubkey)
                let normalized:any = {}
                normalized.path = addressNListToBIP32(pathsIn[i].addressNList)
                normalized.pathMaster = addressNListToBIP32(pathsIn[i].addressNListMaster)

                log.debug(tag,"pubkey: ",pubkey)
                normalized.source = format
                if(pubkey.type === 'xpub'){
                    normalized.type = 'xpub'
                    normalized.xpub = true
                    normalized.pubkey = pubkeys[i].xpub
                    pubkey.pubkey = pubkeys[i].xpub
                }
                if(pubkey.type === 'zpub'){
                    normalized.type = 'zpub'
                    normalized.zpub = true
                    //convert to zpub
                    let zpub = await xpubConvert(pubkeys[i].xpub,'zpub')
                    normalized.pubkey = zpub
                    pubkey.pubkey = zpub
                }
                //TODO get this from supported coins? DRY
                if(pubkey.symbol === 'ETH' || pubkey.symbol === 'RUNE' || pubkey.symbol === 'BNB' || pubkey.symbol === 'ATOM' || pubkey.symbol === 'OSMO'){
                    pubkey.pubkey = pubkeys[i].xpub
                }
                normalized.note = pubkey.note
                normalized.symbol = pubkey.symbol
                normalized.blockchain = COIN_MAP_LONG[pubkey.symbol]
                normalized.network = COIN_MAP_LONG[pubkey.symbol]
                //normalized.path = addressNListToBIP32(pubkey.addressNList)

                //get master address
                let address = await get_address_from_xpub(pubkey.pubkey,pubkey.script_type,pubkey.symbol,0,0,false)
                if(!address){
                    log.error("Failed to get address for pubkey: ",pubkey)
                    throw Error("address master required for valid pubkey")
                }
                normalized.script_type = pubkey.script_type //TODO select script type?
                if(pubkey.symbol === 'ETH' || pubkey.symbol === 'RUNE' || pubkey.symbol === 'BNB' || pubkey.symbol === 'ATOM' || pubkey.symbol === 'OSMO'){
                    normalized.type = "address"
                    normalized.pubkey = address
                }
                if(isTestnet && pubkey.symbol === 'BTC'){
                    //tpub
                    normalized.tpub = await xpubConvert(pubkey.xpub,'tpub')
                }
                normalized.master = address
                normalized.address = address

                output.push(normalized)
            }

        } else {
            throw Error(" unknown format! ")
        }

        return output
    } catch (e) {
        log.error(tag, "e: ", e)
        throw e
    }
}

export async function get_address_from_xpub(xpub:string,scriptType:string,coin:string,account:number,index:number,isChange:boolean, isTestnet?:boolean) {
    let tag = TAG + " | get_address_from_xpub | "
    try {
        let output
        log.info(tag,"Input: ",{xpub,scriptType,coin,account,index,isChange,isTestnet})
        //if xpub get next unused
        if(!xpub) throw Error("xpub required! coin:"+coin)
        console.log("CHECKPOINT")
        //TODO is clone?
        //get pubkey at path
        let publicKey
        if(coin !== 'BTC'){
            publicKey = bitcoin.bip32.fromBase58(xpub).derive(account).derive(index).publicKey
        }

        let response:any
        switch(coin) {
            case 'BTC':
                //TODO more types
                console.log("CHECKPOINT1")
                if(scriptType === 'bech32' || scriptType === 'p2wpkh'){
                    if(xpub[0] !== 'z') throw Error("103: not a Zpub")
                    let account0 = new BIP84.fromZPub(xpub)
                    output = account0.getAddress(0)
                } else if(scriptType === 'legacy' || 'p2pkh'){
                    publicKey = bitcoin.bip32.fromBase58(xpub).derive(account).derive(index).publicKey
                    publicKey = publicKey.toString(`hex`)
                    const { address } = bitcoin.payments.p2pkh({
                        pubkey: Buffer.from(publicKey,'hex'),
                        network: NETWORKS[coin.toLowerCase()]
                    });
                    output = address
                }
                console.log("CHECKPOINT2 : ",output)
                break;
            case 'BCH':
                publicKey = publicKey.toString(`hex`)
                response = bitcoin.payments.p2pkh({
                    pubkey: Buffer.from(publicKey,'hex'),
                    network: NETWORKS[coin.toLowerCase()]
                })
                output = response.address
                break;
            case 'DOGE':
                publicKey = publicKey.toString(`hex`)
                response = bitcoin.payments.p2pkh({
                    pubkey: Buffer.from(publicKey,'hex'),
                    network: NETWORKS[coin.toLowerCase()]
                })
                output = response.address
                break;
            case 'DASH':
                publicKey = publicKey.toString(`hex`)
                response = bitcoin.payments.p2pkh({
                    pubkey: Buffer.from(publicKey,'hex'),
                    network: NETWORKS[coin.toLowerCase()]
                })
                output = response.address
                break;
            case 'LTC':
                publicKey = publicKey.toString(`hex`)
                response = bitcoin.payments.p2pkh({
                    pubkey: Buffer.from(publicKey,'hex'),
                    network: NETWORKS[coin.toLowerCase()]
                })
                output = response.address
                break;
            case 'ETH':
                output = ethUtils.bufferToHex(ethUtils.pubToAddress(publicKey,true))
                break;
            case 'RUNE':
                if(!isTestnet){
                    output = createBech32Address(publicKey,'thor')
                } else {
                    output = createBech32Address(publicKey,'tthor')
                }
                break;
            case 'ATOM':
                output = createBech32Address(publicKey,'cosmos')
                break;
            case 'OSMO':
                console.log("publicKey: ",publicKey.toString('hex'))
                let pubkeyOsmo = bitcoin.bip32.fromBase58(xpub).publicKey
                output = createBech32Address(pubkeyOsmo,'osmo')
                break;
            case 'BNB':
                log.debug("pubkey: ",publicKey)
                if(!isTestnet){
                    output = createBech32Address(publicKey,'bnb')
                } else {
                    output = createBech32Address(publicKey,'tbnb')
                }
                break;
            // case 'FIO':
            //     log.debug(tag,"pubkey: ",publicKey)
            //
            //     try{
            //         //get accounts for pubkey
            //         let account = networks['FIO'].getAccountsFromPubkey(publicKey)
            //         log.debug(tag,"account: ",account)
            //     }catch(e){
            //         //no accounts
            //         //return pubkey
            //         output = {unregistered:true,pubkey:publicKey}
            //     }
            //
            //     break;
            // case 'EOS':
            //     log.debug(tag,"pubkey: ",publicKey)
            //
            //     try{
            //         //get accounts for pubkey
            //         let account = networks['EOS'].getAccountsFromPubkey(publicKey)
            //         log.debug(tag,"account: ",account)
            //     }catch(e){
            //         //no accounts
            //         //return pubkey
            //         output = {unregistered:true,pubkey:publicKey}
            //     }
            //
            //     break;
            default:
                throw Error("coin not yet implemented ! coin: "+coin)
            // code block
        }

        log.debug(tag,"output: ",output)


        return output
    } catch (e) {
        log.error(tag, "e: ", e)
    }
}
