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
    {keepCase: true,
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
    // let call = discussionClient.GetDiscussions({});
    let disc = undefined
    let prom = new Promise((resolve, reject) => {
        discussionClient.GetDiscussions({})
        .on('data', (res) => {
            if(res.discussion.participants.length == 1
            && res.discussion.participants[0] == addr) {
                disc = res
            }
        })
        .on('end', () => {
            if(disc == undefined) {
                discussionClient.AddDiscussion(
                    {
                        "discussion": {
                            "participants": [
                                addr
                            ]
                        }
                    },
                    (err, res) => {
                        if(err)console.log(err)
                        if(res){
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

const purchaseItem = async (disc, item) => {
    let prom = new Promise((resolve, reject) => {
        messageClient.sendMessage(
            {
                discussion_id: parseInt(disc.id),
                payload: item,
                amt_msat: parseInt(500000)
            },
            (err, res) => {
                if(err){
                    resolve(1)
                }
                if(res){
                    
                }
            }
        )
    })
    await Promise.all([prom])
}

const startClient = async () => {
    messageClient.SubscribeMessages({})
    .on('data', (res) => {
        console.log('---------------------------')
        console.log('SUCCESSFULLY PURCHASED ITEM')
        console.log(res.received_message.payload)
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
    console.log("Enter name of item you want to purchase:")
    rl.on('line', function(line){
        if(line == "exit") exit(0)
        purchaseItem(disc, line)
    })
}

module.exports = {
    startClient
}