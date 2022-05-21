const api = require('../config/api-url')

var PROTO_PATH = __dirname + '/../rpc/rpc.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

var services = grpc.loadPackageDefinition(packageDefinition).services;

var selfInfoClient = new services.NodeInfoService(api.apiUrl(), grpc.credentials.createInsecure())

const getBalance = () => {
    selfInfoClient.GetSelfBalance(
        {},
        (err, res) => {
            if(err){ 
                console.log("Error while retrieving balance from node")
            }
            if(res){
                console.log("On-Chain:", Number(res.wallet_confirmed_sat))
                console.log("Off-Chain", Number(res.channel_local_msat) / 1000)
            }
        }
    )
}

module.exports = {
    getBalance
}