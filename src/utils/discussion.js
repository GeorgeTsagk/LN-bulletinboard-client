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

var discussionClient = new services.DiscussionService(api.apiUrl(), grpc.credentials.createInsecure())

/**
 * This function either retrieves the id of an already existing discussion with the given node
 * or creates a new one and returns the id of the created discussion.
 * 
 * @param {string} addr The address of the node you that will participate in the discussion.
 * @returns {Number} The id of the discussion with given address.
 */
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

module.exports = {
    findDiscussion
}