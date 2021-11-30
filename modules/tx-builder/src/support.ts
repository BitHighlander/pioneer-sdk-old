const bech32 = require(`bech32`)
import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib

//TODO move to coins
const ETH_BASE = 1000000000000000000
const HARDENED = 0x80000000;

//compileMemo
export const compileMemo = (memo: string): Buffer => {
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    return Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
}

//TODO THIS IS DUMB AS SHIT FIXME default cant be null?
export function getBase(coin:string) {
    switch(coin) {
        case "ETH":
            return ETH_BASE
        default:
            return 100000000
    }
}

export function bip32Like(path: string): boolean {
    if (path == "m/") return true;
    return /^m(((\/[0-9]+h)+|(\/[0-9]+H)+|(\/[0-9]+')*)((\/[0-9]+)*))$/.test(
        path
    );
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


export function bech32ify(address:any, prefix:string) {
    const words = bech32.toWords(address)
    return bech32.encode(prefix, words)
}
