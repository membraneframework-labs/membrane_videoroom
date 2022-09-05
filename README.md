# Membrane Videoroom
Membrane Videoroom is an open-source, basic video conferencing platform using WebRTC.
Based on [membrane_rtc_engine](https://github.com/membraneframework/membrane_rtc_engine), it may be a good starting point for building your own real-time communication solution using Elixir and Membrane

## Try it live!
You can test the Videoroom at [https://videoroom.membrane.stream](https://videoroom.membrane.stream)

### Using the demo 
The recommended browser for using the demo is Google Chrome.
To join a room, enter the room name and your name, then click `Join room!` button below. If the browser will ask you for a camera or microphone permission, click `Allow` (otherwise, other people will not be able to see or hear you). After entering a room, you can turn on/off your camera or microphone, or start sharing your screen, by clicking icons at the bottom of the screen. You can also leave the room by clicking the red button or just closing the card in your browser.

![videoroom_demo](https://membrane.stream/data/membrane_tutorials/videoroom/assets/records/expected_result.webp)

## Environment variables
Available runtime environment variables:
```
VIRTUAL_HOST={host passed to the endpoint config, defaults to "localhost" on non-production environments}

USE_TLS={"true" or "false", if set to "true" then https will be used and certificate paths will be required}
KEY_FILE_PATH={path to certificate key file, used when "USE_TLS" is set to true}
CERT_FILE_PATH={path to certificate file, used when "USE_TLS" is set to true}

INTEGRATED_TURN_IP={TURN server IP address}
INTEGRATED_TURN_PORT_RANGE={port range, where UDP TURN will try to open ports. By default set to 50000-59999}
INTEGRATED_TCP_TURN_PORT={port number of TCP TURN}
INTEGRATED_TLS_TURN_PORT={port number of TLS TURN, used when "INTEGRATED_TURN_PKEY" and "INTEGRATED_TURN_CERT" are provided}
INTEGRATED_TURN_PKEY={SSL certificate for TLS TURN}
INTEGRATED_TURN_PKEY={SSL private key for TLS TURN}
```

## Run manually

### Dependencies

In order to run phoenix application manually you will need to have `node` installed.
Demo has been tested with `node` version `v14.15.0`. You will also need some system dependencies.

#### Mac OS X

```
brew install srtp clang-format ffmpeg
```

#### Ubuntu

```
sudo apt-get install libsrtp2-dev libavcodec-dev libavformat-dev libavutil-dev
```

### To run
First install all dependencies:
```
mix deps.get
npm ci --prefix=assets
```

In order to run, type:

```
mix phx.server 
```

Then go to <http://localhost:4000/>.

## Run with docker

Videoroom demo provides a `Dockerfile` that you can use to run videoroom application yourself without any additional setup and dependencies.

### To run:

**IMPORTANT** If you intend to use TLS remember that setting paths in the `.env` file is not enough. Those paths will be used inside the docker container therefore besides setting env variables you will need to mount those paths to the docker container on your own. You can do it by adding `-v` flag with proper paths to `docker` command.

Default environmental variables are available in `.env` file. To run Membrane Videoroom, firstly you have to set up integrated TURNs environments. You can add these 2 lines to `.env` file and add `--env-file .env` flag to `docker` command or set envionment variables omitting `.env` file with `-e` flag, as in examples below
```bash
INTEGRATED_TURN_PORT_RANGE=50000-50050
INTEGRATED_TURN_IP={IPv4 address of one of your network interfaces}
```
`INTEGRATED_TURN_PORT_RANGE` describes the range, where TURN servers will try to open ports. The bigger the range is, the more users server will be able to handle. Useful when not using the `-network=host` option to limit the UDP ports used only to ones exposed from a Docker container.
`INTEGRATED_TURN_IP` is the IP address, on which TURN servers will listen. You can get it from the output of `ifconfig` command. To make the server available from your local network, you can set it to an address like `192.168.*.*`.

To start a container with image from Docker Hub, run
```bash
$ docker run --network=host -e INTEGRATED_TURN_IP=<IPv4 address> membraneframework/demo_webrtc_videoroom_advanced:latest
```
or
```bash
$ docker run -p 50000-50050:50000-50050/udp -p 4000:4000/tcp -e INTEGRATED_TURN_PORT_RANGE=50000-50050 -e INTEGRATED_TURN_IP=<IPv4 address> membraneframework/demo_webrtc_videoroom_advanced:latest
```

***NOTE 1*** There might be a problem with running `--network=host` on `macOS`, so the latter command is recommended on that operating system.

***NOTE 2*** Remember to update the range of published ports if setting the `INTEGRATED_TURN_PORT_RANGE` to a value different than in this guide.

Alternatively, you can build docker image from source
```bash
$ docker build  -t membrane_videoroom .
```

And start a container with this image
```bash
$ docker run --network=host -e INTEGRATED_TURN_IP=<IPv4 address> membrane_videoroom
```
```bash
$ docker run -p 50000-50050:50000-50050/udp -p 4000:4000/tcp -e INTEGRATED_TURN_PORT_RANGE=50000-50050 -e INTEGRATED_TURN_IP=<IPv4 address> membrane_videoroom
```

Then go to <http://localhost:4000/>.

## OpenTelemetry
By default OpenTelemetry is turned off. You can turn it on by going to `config/runtime.exs` and changing `otel_state` to one of four possible values:
* `:local` - OpenTelemetry traces will be printed on stdout
* `:zipkin` - OpenTelemetry traces are sent to Zipkin. You can change the url traces are sent to in `config/runtime.exs`. To setup zipkin you can run this command `docker run -d -p 9411:9411 openzipkin/zipkin`.
* `:honeycomb` - OpenTelemetry traces are sent to Honeycomb. You have to specify "x-honeycomb-team", which is API KEY for this service.

## Copyright and License

Copyright 2020, [Software Mansion](https://swmansion.com/?utm_source=git&utm_medium=readme&utm_campaign=membrane)

[![Software Mansion](https://logo.swmansion.com/logo?color=white&variant=desktop&width=200&tag=membrane-github)](https://swmansion.com/?utm_source=git&utm_medium=readme&utm_campaign=membrane)

Licensed under the [Apache License, Version 2.0](LICENSE)
