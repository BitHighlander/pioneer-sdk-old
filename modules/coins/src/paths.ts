


export function getPaths(blockchains?:any,isTestnet?:boolean) {
    let output = []
    if(!blockchains) blockchains = []
    if(blockchains.indexOf('bitcoin') >= 0){
        if(isTestnet){
            output.push({
                note:"Bitcoin testnet account 0",
                blockchain: 'bitcoin',
                testnet:true,
                symbol: 'BTC',
                network: 'BTC',
                script_type:"p2wpkh", //bech32
                available_scripts_types:['p2pkh','p2sh','p2wpkh','p2sh-p2wpkh'],
                type:"zpub",
                addressNList: [0x80000000 + 84, 0x80000000 + 1, 0x80000000 + 0],
                addressNListMaster: [0x80000000 + 84, 0x80000000 + 1, 0x80000000 + 0, 0, 0],
                curve: 'secp256k1',
                showDisplay: true // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            })
        }else{
            //legacy  bip44
            // output.push({
            //     note:"Bitcoin account 0",
            //     blockchain: 'bitcoin',
            //     symbol: 'BTC',
            //     network: 'BTC',
            //     script_type:"p2pkh",
            //     available_scripts_types:['p2pkh','p2sh','p2wpkh','p2sh-p2wpkh'],
            //     type:"zpub",
            //     addressNList: [0x80000000 + 44, 0x80000000 + 0, 0x80000000 + 0],
            //     addressNListMaster: [0x80000000 + 44, 0x80000000 + 0, 0x80000000 + 0, 0, 0],
            //     curve: 'secp256k1',
            //     showDisplay: true // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            // })
            //TODO non-native segwit wraped p2sh

            //bech32 bip84
            output.push({
                note:"Bitcoin account Native Segwit (Bech32)",
                blockchain: 'bitcoin',
                symbol: 'BTC',
                network: 'BTC',
                script_type:"p2wpkh", //bech32
                available_scripts_types:['p2pkh','p2sh','p2wpkh','p2sh-p2wpkh'],
                type:"zpub",
                addressNList: [0x80000000 + 84, 0x80000000 + 0, 0x80000000 + 0],
                addressNListMaster: [0x80000000 + 84, 0x80000000 + 0, 0x80000000 + 0, 0, 0],
                curve: 'secp256k1',
                showDisplay: true // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            })
        }
    }

    if(blockchains.indexOf('ethereum') >= 0){
        let entry:any = {
            note:" ETH primary (default)",
            symbol: 'ETH',
            network: 'ETH',
            script_type:"ethereum",
            available_scripts_types:['ethereum'],
            type:"address",
            addressNList: [0x80000000 + 44, 0x80000000 + 60, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 60, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'ethereum'
        }
        if(isTestnet) entry.testnet = true
        output.push(entry)
    }

    if(blockchains.indexOf('thorchain') >= 0){
        let entry:any = {
            note:" Default RUNE path ",
            type:"address",
            addressNList: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            script_type:"thorchain",
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'thorchain',
            symbol: 'RUNE',
            network: 'RUNE',
        }
        if(isTestnet) {
            entry.testnet = true
        }
        output.push(entry)
    }

    if(blockchains.indexOf('secret') >= 0){
        let entry:any = {
            note:" Default Secret path ",
            type:"address",
            addressNList: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            script_type:"thorchain",
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'thorchain',
            symbol: 'RUNE',
            network: 'RUNE',
        }
        if(isTestnet) {
            entry.testnet = true
        }
        output.push(entry)
    }

    if(blockchains.indexOf('cosmos') >= 0){
        let entry:any = {
            note:" Default ATOM path ",
            type:"address",
            script_type:"bech32",
            available_scripts_types:['bech32'],
            addressNList: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'cosmos',
            symbol: 'ATOM',
            network: 'ATOM',
        }
        if(isTestnet) {
            entry.testnet = true
        }
        output.push(entry)
    }

    if(blockchains.indexOf('osmosis') >= 0){
        let entry:any = {
            note:" Default OSMO path ",
            type:"address",
            script_type:"bech32",
            available_scripts_types:['bech32'],
            addressNList: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'osmosis',
            symbol: 'OSMO',
            network: 'OSMO',
        }
        if(isTestnet) {
            entry.testnet = true
        }
        output.push(entry)
    }

    if(blockchains.indexOf('binance') >= 0){
        let entry:any = {
            note:"Binance default path",
            type:"address",
            script_type:"binance",
            available_scripts_types:['binance'],
            addressNList: [0x80000000 + 44, 0x80000000 + 714, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 714, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'binance',
            symbol: 'BNB',
            network: 'BNB',
        }
        if(isTestnet) {
            entry.testnet = true
        }
        output.push(entry)
    }

    if(blockchains.indexOf('bitcoincash') >= 0){
        let entry:any = {
            note:"Bitcoin Cash Default path",
            type:"xpub",
            script_type:"p2pkh",
            available_scripts_types:['p2pkh'],
            addressNList: [0x80000000 + 44, 0x80000000 + 145, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 145, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'bitcoincash',
            symbol: 'BCH',
            network: 'BCH',
        }
        if(isTestnet) {
            entry.testnet = true
        }
        output.push(entry)
    }

    if(blockchains.indexOf('litecoin') >= 0){
        let entry:any = {
            note:"Litecoin Default path",
            type:"xpub",
            script_type:"p2pkh",
            available_scripts_types:['p2pkh'],
            addressNList: [0x80000000 + 44, 0x80000000 + 2, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 2, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'litecoin',
            symbol: 'LTC',
            network: 'LTC',
        }
        if(isTestnet) {
            entry.testnet = true
        }
        output.push(entry)
    }

    if(blockchains.indexOf('dogecoin') >= 0){
        let entry:any = {
            note:"Dogecoin Default path",
            type:"xpub",
            script_type:"p2pkh",
            available_scripts_types:['p2pkh'],
            addressNList: [0x80000000 + 44, 0x80000000 + 3, 0x80000000 + 0],
            addressNListMaster: [0x80000000 + 44, 0x80000000 + 3, 0x80000000 + 0, 0, 0],
            curve: 'secp256k1',
            showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            blockchain: 'dogecoin',
            symbol: 'DOGE',
            network: 'DOGE',
        }
        if(isTestnet) {
            entry.testnet = true
        }
        output.push(entry)
    }

    return output
}

// {
//     note:"",
//     type:"address",
//     script_type:"binance",
//     available_scripts_types:['binance'],
//     addressNList: [0x80000000 + 44, 0x80000000 + 714, 0x80000000 + 0, 0 , 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'Binance',
//     symbol: 'BNB',
//     network: 'BNB',
// },
// {
//     note:" Default ATOM path ",
//     type:"address",
//     script_type:"cosmos",
//     available_scripts_types:['cosmos'],
//     addressNList: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0, 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'Cosmos',
//     symbol: 'ATOM',
//     network: 'ATOM',
// },

//TODO More paths
// [
//
// // {
// //     note:"Bitcoin account 1",
// //     coin: 'Bitcoin',
// //     symbol: 'BTC',
// //     network: 'BTC',
// //     script_type:"p2pkh",
// //     available_scripts_types:['p2pkh'],
// //     type:"xpub",
// //     addressNList: [0x80000000 + 44, 0x80000000 + 0, 0x80000000 + 1],
// //     curve: 'secp256k1',
// //     showDisplay: true // Not supported by TrezorConnect or Ledger, but KeepKey should do it
// // },
// // {
// //     note:"bitcoin segwit bip49",
// //     coin: 'Bitcoin',
// //     symbol: 'BTC',
// //     network: 'BTC',
// //     script_type:"p2pkh",
// //     available_scripts_types:['p2pkh'],
// //     type:"xpub",
// //     addressNList: [0x80000000 + 49, 0x80000000 + 0, 0x80000000 + 0],
// //     curve: 'secp256k1',
// //     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
// //     scriptType: 'p2sh'
// // },
// {
//     note:"Standard bitcoin cash default path",
//     type:"xpub",
//     script_type:"p2pkh",
//     available_scripts_types:['p2pkh'],
//     addressNList: [0x80000000 + 44, 0x80000000 + 145, 0x80000000 + 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'BitcoinCash',
//     symbol: 'BCH',
//     network: 'BCH',
// },
// {
//     note:"Default litecoin path",
//     coin: 'Litecoin',
//     symbol: 'LTC',
//     network: 'LTC',
//     script_type:"p2pkh",
//     available_scripts_types:['p2pkh'],
//     type:"xpub",
//     addressNList: [0x80000000 + 44, 0x80000000 + 2, 0x80000000 + 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
// },
// {
//     note:"Default dogecoin path",
//     coin: 'Dogecoin',
//     symbol: 'DOGE',
//     network: 'DOGE',
//     script_type:"p2pkh",
//     available_scripts_types:['p2pkh'],
//     type:"xpub",
//     addressNList: [0x80000000 + 44, 0x80000000 + 3, 0x80000000 + 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
// },
// {
//     note:"Default dash path",
//     coin: 'Dash',
//     symbol: 'DASH',
//     network: 'DASH',
//     script_type:"p2pkh",
//     available_scripts_types:['p2pkh'],
//     type:"xpub",
//     addressNList: [0x80000000 + 44, 0x80000000 + 5, 0x80000000 + 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
// },
// {
//     note:" ETH primary (default)",
//     symbol: 'ETH',
//     network: 'ETH',
//     script_type:"eth",
//     available_scripts_types:['eth'],
//     type:"address",
//     addressNList: [0x80000000 + 44, 0x80000000 + 60, 0x80000000 + 0,0,0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'Ethereum'
// },
// // {
// //     note:" ETH primary (ledger)",
// //     symbol: 'ETH',
// //     network: 'ETH',
// //     script_type:"eth",
// //     available_scripts_types:['eth'],
// //     type:"address",
// //     addressNList: [0x80000000 + 44, 0x80000000 + 60, 0],
// //     curve: 'secp256k1',
// //     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
// //     coin: 'Ethereum'
// // },
// {
//     note:"Fio primary",
//     type:"address",
//     script_type:"fio",
//     available_scripts_types:['fio'],
//     addressNList: [0x80000000 + 44, 0x80000000 + 235, 0x80000000 + 0, 0, 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'Fio',
//     symbol: 'FIO',
//     network: 'FIO',
// },
// {
//     note:" Default eos path ",
//     type:"address",
//     script_type:"eos",
//     available_scripts_types:['eos'],
//     addressNList: [0x80000000 + 44, 0x80000000 + 194, 0x80000000 + 0, 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'Eos',
//     symbol: 'EOS',
//     network: 'EOS',
// },
// {
//     note:"",
//     type:"address",
//     script_type:"binance",
//     available_scripts_types:['binance'],
//     addressNList: [0x80000000 + 44, 0x80000000 + 714, 0x80000000 + 0, 0 , 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'Binance',
//     symbol: 'BNB',
//     network: 'BNB',
// },
// {
//     note:" Default ATOM path ",
//     type:"address",
//     script_type:"cosmos",
//     available_scripts_types:['cosmos'],
//     addressNList: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0, 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'Cosmos',
//     symbol: 'ATOM',
//     network: 'ATOM',
// },
// {
//     note:" Default RUNE path ",
//     type:"address",
//     script_type:"tthor",
//     available_scripts_types:['tthor'],
//     addressNList: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0, 0, 0],
//     curve: 'secp256k1',
//     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
//     coin: 'Thorchain',
//     symbol: 'RUNE',
//     network: 'RUNE',
// },
// // {
// //     note:"",
// //     type:"address",
// //     addressNList: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0x80000000 + 0],
// //     curve: 'secp256k1',
// //     showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
// //     coin: 'Cardano',
// //     symbol: 'ADA'
// // }
//
// ]
