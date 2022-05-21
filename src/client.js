const api = require('./config/api-url')
const readline = require('readline');
const prompt = require('prompt')
const help = require('./utils/help')
const config = require('./config/config-loader')
const balance = require('./utils/balance')
const discussion = require('./utils/discussion')

var PROTO_PATH = __dirname + '/rpc/rpc.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const { exit } = require('process');
const yaml = require('js-yaml')
const fs = require('fs')
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

var messageClient = new services.MessageService(api.apiUrl(), grpc.credentials.createInsecure())
var discussionClient = new services.DiscussionService(api.apiUrl(), grpc.credentials.createInsecure())

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});



const sendRequest = async (disc, line) => {
    const args = line.split(".")
    if (args.length < 2) {
        console.log("Please provide an amount of sats after the '.'")
    }
    messageClient.sendMessage(
        {
            discussion_id: parseInt(disc.id),
            payload: args[0],
            amt_msat: parseInt(Number(args[1]) * 1000)
        },
        (err, res) => {
            if (err) {
            }
            if (res) {
            }
        }
    )
}

const openResponseStream = () => {
    messageClient.SubscribeMessages({})
        .on('data', (res) => {
            console.log('---------------------------')
            let response
            if (res.received_message.payload.startsWith('{')) {
                try {
                    response = JSON.parse(res.received_message.payload)
                } catch (e) {
                    response = res.received_message.payload
                }
            } else {
                response = res.received_message.payload
            }
            console.log(response)
            console.log('---------------------------\n')
        })
        .on('end', () => {
        })
}

const startClient = async () => {
    openResponseStream()
    let doc = config.getConfig()
    const disc = await discussion.findDiscussion(doc['service-node']?.address)
    console.log("If you need help on how to use this client, type \"help\"")
    console.log("Type a request for the remote node:")
    rl.on('line', function (line) {
        if (line == "exit") exit(0)
        if (line == "help") {
            help.printHelp()
            return
        }
        if (line == "balance") {
            balance.getBalance()
            return
        }
        sendRequest(disc, line)
    })
}

module.exports = {
    startClient
}