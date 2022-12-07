import {OSCClient, OSCType, OSCServer} from 'ts-osc';

const client = new OSCClient("localhost", 8000);

client.send('/hello', OSCType.String, "hello");

const server = new OSCServer("0.0.0.0", 8000);

server.on('message', (msg)=>{
    console.log(msg);
})
