export interface Error{
    success:boolean
    tag:string
    e:any
}
// export class ApiError extends Error {
//     private statusCode: number;
//     constructor(name: string, statusCode: number, message?: string) {
//         super(message);
//         this.name = name;
//         this.statusCode = statusCode;
//     }
// }

export interface Health {
    online:boolean
    name:string
    version:string
    system:any
    hostname:string,
    uptime:any,
    loadavg:any
}
