export interface Chart {
    network:string
    symbol?: string;
    pioneer?:string //first user to chart
    queueId?:string
    type:string
    username?:string
    contractName:string
    contractVerbose?:any
    tags:any
    pubkey:string
}
