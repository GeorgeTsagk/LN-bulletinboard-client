const api = require('./config/api-url')
var PROTO_PATH = __dirname + '/rpc/rpc.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

var services = grpc.loadPackageDefinition(packageDefinition).services;

const client = require('./client')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const start = async () => {
    await sleep(1000)
    try{
        await client.startClient()
    } catch (e) { 
        console.log(e)
    }
}

start()

