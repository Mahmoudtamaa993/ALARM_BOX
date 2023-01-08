import {OSCClient, OSCType, OSCServer} from 'ts-osc';

const client = new OSCClient("localhost", 9999);

client.send('/hello', OSCType.Integer, 50);

// const server = new OSCServer("0.0.0.0", 9999);

// server.on('message', (msg)=>{
//     console.log(msg);
// })
