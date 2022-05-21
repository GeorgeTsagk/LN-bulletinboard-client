const printHelp = () => {
    console.log(
        `
        
        Welcome to the bulletin board client!
        
        All the commands you type are requests transfered to another node in the network in the
        form of micropayments.

        The generic format for the commands is <command>.<amt>. The amount is a number,
        representing the amount of sats transfered to the remote node per request.
        i.e. "info.10" will send the request "info" with an attached amount of 10 sats.
        
        balance     Not followed by an amount (e.g. typed as "balance", without a ".<amt>" part).
                    Retrieves your node's on-chain and off-chain balance.

        info        Acquire more info on bulletin board service node (default price for
                    this request is 10 sat)

        channel     Followed by a pubkey of a LN node. This request returns the total
                    local balance of the remote node in all the channels with the node
                    included in the request.
                    Example
                    "channel 0272d85b4c927c64f31bb0fee7a25a78c80e8c057d0de0c2fe779f086f64bf08bb.100"
                    will return a number representing the total local balance of the remote node in
                    all the channels with the node included in the request.

        item        Followed by an item name and by its price, to purchase any static
                    content that is up for sale by the remote node. To learn what items are
                    available for sale, you need to first perform the "info" request.
                    `
    )
}

module.exports = {
    printHelp
}