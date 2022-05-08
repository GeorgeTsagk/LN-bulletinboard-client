const api = require('./config/api-url')
const readline = require('readline');
const prompt = require('prompt')

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

const findDiscussion = async (addr) => {
    let disc = undefined
    let prom = new Promise((resolve, reject) => {
        discussionClient.GetDiscussions({})
            .on('data', (res) => {
                if (res.discussion.participants.length == 1
                    && res.discussion.participants[0] == addr) {
                    disc = res
                }
            })
            .on('end', () => {
                if (disc == undefined) {
                    discussionClient.AddDiscussion(
                        {
                            "discussion": {
                                "participants": [
                                    addr
                                ]
                            }
                        },
                        (err, res) => {
                            if (err) console.log(err)
                            if (res) {
                                disc = res
                                resolve(1)
                            }
                        }
                    )
                } else {
                    resolve(1)
                }
            })
    })
    await Promise.all([prom])
    return disc
}

const sendRequest = async (disc, line) => {
    const args = line.split(".")
    if (args.length < 2) {
        console.log("Please provide an amount of sats after the '.'")
    }
    let prom = new Promise((resolve, reject) => {
        messageClient.sendMessage(
            {
                discussion_id: parseInt(disc.id),
                payload: args[0],
                amt_msat: parseInt(Number(args[1]) * 1000)
            },
            (err, res) => {
                if (err) {
                    resolve(1)
                }
                if (res) {

                }
            }
        )
    })
    await Promise.all([prom])
}

const printHelp = () => {
    console.log(
        `
        
        Welcome to the bulletin board client!
        
        All the commands you type are requests transfered to another node in the network in the
        form of micropayments.

        The generic format for the commands is <command>.<amt>. The amount is a number,
        representing the amount of sats transfered to the remote node per request.
        i.e. "info.10" will send the request "info" with an attached amount of 10 sats.
        

        info        Acquire more info on bulletin board service node (default price for
                    this request is 10 sat)

        channel     Followed by a pubkey of a LN node. This request returns the total
                    local balance of the remote node in all the channels with the node
                    included in the request.
                    Example
                    "channel 0272d85b4c927c64f31bb0fee7a25a78c80e8c057d0de0c2fe779f086f64bf08bb.100"
                    will return a number representing the total local balance of the remote node in
                    all the channels with the node included in the request.

        <item>      You can enter any item name, followed by its price, to purchase any other
                    content that is up for sale by the remote node. To learn what items are
                    available for sale, you need to first perform the "info" request.
                    `
    )
}

const startClient = async () => {
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
    let doc
    try {
        doc = yaml.load(fs.readFileSync(__dirname + '/../config.yaml', 'utf8'));
    } catch (e) {
        console.log(e);
    }
    const disc = await findDiscussion(doc['service-node'].address)
    console.log("If you need help on how to use this client, type \"help\"")
    console.log("Type a request for the remote node:")
    rl.on('line', function (line) {
        if (line == "exit") exit(0)
        if (line == "help") printHelp()
        else sendRequest(disc, line)
    })
}

module.exports = {
    startClient
}