# Lightning Network Bulletin Board Client

## Intro

This is an implementation of a bulletin board client over a Lightning Network Node.

This is a client that runs on your node, and communicates with another node in the network running the [Bulletin Board Server](https://github.com/GeorgeTsagk/LN-bulletinboard-server).

It is using the [c13n API](https://docs.c13n.io/projects/api/en/latest/).

## How to use

You need a Lightning node (only `lnd` is supported currently) and deploy the [c13n daemon](https://github.com/c13n-io/c13n-go) on top of it.

This enables a new API for your LN node, which includes data-over-lightning functionality. For more info on **data over Lightning** read [here](https://c13n.io/about/).

After launching the `c13n` daemon rename `config.sample.yaml` to `config.yaml` and fill in the required credentials for connecting to c13n.

> NOTE: Currently the BulletinBoard client doesn't support authentication & TLS over the c13n API, so you will have to comment out the related lines in `c13n-go`'s configuration file.
>
> **Until user authentication and TLS are supported, do not run with remote c13n daemon.**
```yaml
server:
  address: "localhost:9999"
  #tls:
    #cert_path: "./cert/c13n.pem"
    #key_path:  "./cert/c13n.key"
  #user: example
  # bcrypt hash of RPC password
  #pwdhash: replaceme
  graceful_shutdown_timeout: 10
```