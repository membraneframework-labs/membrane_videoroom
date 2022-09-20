# Membrane Videoroom

[![CircleCI](https://circleci.com/gh/membraneframework/membrane_videoroom.svg?style=svg)](https://circleci.com/gh/membraneframework/membrane_videoroom)

Membrane Videoroom is an open-source, basic video conferencing platform using WebRTC.
Based on [membrane_rtc_engine](https://github.com/membraneframework/membrane_rtc_engine), it may be a good starting point for building your own real-time communication solution using Elixir and Membrane.


## Try it live!
You can test the Videoroom at [https://videoroom.membrane.stream](https://videoroom.membrane.stream)

### Using the demo 
The recommended browser for using the demo is Google Chrome.
To join a room, enter the room name and your name, then click the `Join room!` button below. If the browser will ask you for a camera or microphone permission, click `Allow` (otherwise, other people will not be able to see or hear you). After entering a room, you can turn on/off your camera or microphone, or start sharing your screen, by clicking icons at the bottom of the screen. You can also leave the room by clicking the red button or just closing the card in your browser.

![videoroom_demo](https://membrane.stream/data/membrane_tutorials/videoroom/assets/records/expected_result.webp)



## Running locally


### Installation of the dependencies
To run phoenix application manually, you will need to have [`node.js`](https://nodejs.org/en/) installed. You can read about the installation [here](https://nodejs.org/en/download/).
The demo has been tested with `node.js` version `v14.15.0`. 

Furthermore, you will need some other dependencies.
Depending on an operation system, you might also need to set up some
environment variables. Below you can find a list of commands to
be executed on a given OS.

#### Mac OS X with Intel processor

```
brew install srtp clang-format ffmpeg
export LDFLAGS="-L/usr/local/opt/openssl@1.1/lib"
export CFLAGS="-I/usr/local/opt/openssl@1.1/include/"
export CPPFLAGS="-I/usr/local/opt/openssl@1.1/include/"
export PKG_CONFIG_PATH="/usr/local/opt/openssl@1.1/lib/pkgconfig"
```

#### Mac OS X with M1 processor

```
brew install srtp clang-format ffmpeg
export C_INCLUDE_PATH=/opt/homebrew/Cellar/libnice/0.1.18/include:/opt/homebrew/Cellar/opus/1.3.1/include:/opt/homebrew/Cellar/openssl@1.1/1.1.1l_1/include
export LIBRARY_PATH=/opt/homebrew/Cellar/opus/1.3.1/lib
export PKG_CONFIG_PATH=/opt/homebrew/Cellar/openssl@1.1/1.1.1l_1/lib/pkgconfig/
```


#### Ubuntu

```
sudo apt-get install libsrtp2-dev libavcodec-dev libavformat-dev libavutil-dev
```

### Launching the demo
First, install all project dependencies:
```
mix deps.get
npm ci --prefix=assets
```

To run, type:

```
mix phx.server 
```

Then go to <http://localhost:4000/>.

## Running with docker

Videoroom demo provides a `Dockerfile` that you can use to run videoroom application yourself without any additional setup and system dependencies installation.
All you need is to have Docker Desktop installed - here you can find the instruction for installation on [Mac OS](https://docs.docker.com/desktop/install/mac-install/) and [Ubuntu](https://docs.docker.com/desktop/install/ubuntu/).

### Launching the demo
First, you need to build the image from the source:
```bash
docker build -t membrane_videoroom .
```
Later, you need to obtain the `EXTERNAL_IP` address. This is the IPVv4 address at your computer is accessible in the network.
To make the server available from your local network, you can set it to a private address, like `192.168.*.*`.
The address can be found with the use of the `ifconfig` command:
```
$ ifconfig
...
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
 options=400<CHANNEL_IO>
 ether 88:66:5a:49:ac:e0 
 inet6 fe80::426:8833:1408:cd1a%en0 prefixlen 64 secured scopeid 0x6 
 inet 192.168.1.196 netmask 0xffffff00 broadcast 192.168.1.255
 nd6 options=201<PERFORMNUD,DAD>
 media: autoselect
 status: active
```
(The address we are seeking is the address following the `inet` field - in that particular case, `192.168.1.196`)

Then you can start the container:
#### Mac OS X
```bash
docker run -p 50000-50050:50000-50050/udp -p 4000:4000/tcp -e INTEGRATED_TURN_PORT_RANGE=50000-50050 -e EXTERNAL_IP=<IPv4 address> -e VIRTUAL_HOST=localhost membrane_videoroom
```
#### Ubuntu
```bash
docker run --network=host -e EXTERNAL_IP=<IPv4 address> -e VIRTUAL_HOST=localhost membrane_videoroom
```
> ***NOTE*** The first command, which is the one we suggest using on Mac OS, will also work completely on Ubuntu. At the same time, it is not necessarily true another way around, since there is a problem with running `--network=host` on `macOS`. That is why you need to explicitly forward the desired ports range on macOS. If you have decided to use the first command, make sure that the ports you are forwarding with the `-p` option switch of the `docker run` command are corresponding to the ports specified within the `INTEGRATED_TURN_PORT_RANGE` variable.

Finally, go to <http://localhost:4000/>.

## More advanced configuration

### Environment variables
Below you can find a list of runtime environment variables, used to configure the demo:
```
VIRTUAL_HOST={host passed to the endpoint config, defaults to "localhost" on non-production environments (MIX_ENV != prod)}

USE_TLS={"true" or "false", if set to "true" then https will be used and certificate paths will be required}
KEY_FILE_PATH={path to certificate key file, used when "USE_TLS" is set to true}
CERT_FILE_PATH={path to certificate file, used when "USE_TLS" is set to true}

EXTERNAL_IP= {the IP address, on which TURN servers will listen}
INTEGRATED_TURN_PORT_RANGE={port range, where UDP TURN will try to open ports. By default set to 50000-59999. 
    The bigger the range is, the more users server will be able to handle. Useful when not using the `-network=host` option to 
    limit the UDP ports used only to ones exposed from a Docker container.}
INTEGRATED_TCP_TURN_PORT={port number of TCP TURN}
INTEGRATED_TLS_TURN_PORT={port number of TLS TURN, used when "INTEGRATED_TURN_PKEY" and "INTEGRATED_TURN_CERT" are provided}
INTEGRATED_TURN_CERT={SSL certificate for TLS TURN}
INTEGRATED_TURN_PKEY={SSL private key for TLS TURN}
```


>Default environment variables are available in `.env` file. If you are using the docker setup, you might want to make the container use the variables defined in `.env` - you can do it by providing the `--env-file .env` flag to `docker run` command. With the variables defined in the `.env` file, you won't need to use `-e` switch of the `docker run` command: 
>```bash
>docker run <rest of the options...> -env-file .env membrane_videoroom
>```
>You can surely add other environment variables definitions to the `.env` file

**IMPORTANT** If you intend to use TLS with the docker setup, remember that setting paths in the `.env` file is not enough. Those paths will be used inside the docker container therefore besides setting env variables you will need to mount those paths to the docker container on your own. You can do it by adding `-v` flag with proper paths to `docker` command, which will mount the desired volumes in the container's file system:
```bash
docker run <rest of the options...> -e INTEGRATED_TURN_CERT=/usr/local/key.cert -e INTEGRATED_TURN_PKEY=/usr/local/key.priv -v <path to the certificate on the host filesystem>:/usr/local/key.cert -v <path to the private key on the host filesystem>:/usr/local/key.priv membrane_videoroom
```


### OpenTelemetry
The videoroom provides observability metrics 
By default, OpenTelemetry is turned off. You can turn it on by going to `config/runtime.exs` and changing `otel_state` to one of three possible values:
* `:local` - OpenTelemetry traces will be printed on stdout
* `:zipkin` - OpenTelemetry traces are sent to Zipkin. You can change the url traces are sent to in `config/runtime.exs`. To set up zipkin you can run this command `docker run -d -p 9411:9411 openzipkin/zipkin`.
* `:honeycomb` - OpenTelemetry traces are sent to Honeycomb. You have to specify "x-honeycomb-team", which is API KEY for this service.


## FAQ
Below you can find a list of Frequently Asked Questions (FAQ).
In case of any errors occurring during the setup, we encourage you to get familiar with that list.
If you haven't found an answer to your question, we invite you to ask it on [the Membrane's Discord server](https://discord.com/channels/464786597288738816/1007190795167731742).

### Videoroom capabilities
#### What is the maximum number of users in a Membrane videoroom conference?
That is limited mostly by the hardware you are using, and the usage scenario.
Let's take under the consideration server with 64 GiB RAM, access to 10 Gbit network and 32 vCPUs.
Below you can find a table comparing a cost of such a server from three different cloud providers.

| name | RAM | CPU | Storage | Network | Cost, on-demand |
|--------------|---------:|---------:|------------------------------:|-----------:|-----------------:|
| Amazon EC c5ad.8xlarge | 64.0 GiB | 32 vCPUs | 1200 GB (2 * 600 GB NVMe SSD) | 10 Gbps | $1.376 hourly |
| Microsoft Azure Standard_D32plds_v5 | 64.0 GiB | 32 vCPUs | 1200 GiB |---------| $1.552 hourly |
| Google Cloud VM c2d-highcpu-32 | 64.0 GiB | 32 vCPUs | ---------- | 32 Gbps| $1.321 hourly |

With such a hardware:
* when it comes to hosting a conference where we have e.g. two presenters that are sending audio and video and multiple passive participants, who are only watching the stream, we can handle at least ~10 rooms, 17 participants each (2 speakers, 15 passive participants).
* in the case of a casual room where everyone can send their media, with low-quality video, one big room for 21 participants (each of them was sending audio and video) was using about 21% of the CPU resources of the given machine.

#### Does Membrane videoroom support broadcasting (only one peer streaming and many peers who are only watching)?
Membrane videoroom demo is an application meant to mimic the behavior of a videoconferencing room (i.e. Google Meet). It has mechanisms to reduce the amount of resources consumed when only part of the video conference participants are actively participating (streaming the multimedia), and the rest are only watching the stream.
At the same time, for broadcasting multimedia to thousands of viewers, other mechanisms need to be used, and it can be achieved with the use of the Membrane Framework. We invite you to take a look at other [Membrane demos](https://github.com/membraneframework/membrane_demo), especially:
* [WebRTC to HLS demo](https://github.com/membraneframework/membrane_demo/tree/master/webrtc_to_hls)
* [RTMP to HLS demo](https://github.com/membraneframework/membrane_demo/tree/master/rtmp_to_hls)
which are demo applications meant to broadcast the media sent by the streamer to many viewers.
<!--> ADD INFORMATION ABOUT RTMP TO HLS TUTORIAL WHEN IT IS PUBLISHED <-->

### Configuration
#### Can you use the external TURN server instead of the integrated one?
It's not possible at the moment. Since the SFU needs to be publicly available, we don't see a purpose of having a separate publicly available TURN server.
The architecture proposed by us: `client --- NETWORK ---> SFU with TURN` reduces the number of 'hops' in the network by one. In contrast, the architecture with the separate TURN server would like that: `client --- NETWORK -- TURN --- NETWORK ---> SFU`.
If you can think of a use case for a separate TURN server, feel free to start a discussion on our discord server.

### Known bugs
#### `(Mix) Could not compile dependency :fast_tls,`
As the error suggests, there was a problem with the `:fast_tls` dependency compilation. It's usually caused by the fact, that the compiler cannot
find OpenSSL dependencies in your system.
In the setup instruction above we have set the compiler flags pointing to the appropriate directories containing OpenSSL dependencies on a given OS.
However, if you have your OpenSSL installed in some custom location, you will need to change the compiler flags (i.e. [`LDFLAGS`, `CFLAGS`, `CPPFLAGS`] or [`C_INCLUDE_PATH`, `LIBRARY_PATH`], depending on your compiler and OS) and the `PKG_CONFIG_PATH` environment variable.
For more instructions on how to install the `:fast_tls` dependency, please visit the [Fast TLS repository](https://github.com/processone/fast_tls).

#### Why, after joining the room, I don't see a video stream from the others?
Take a look at the console logs - most probably there are prints of the following form:
```
client error exporting spans {:failed_connect,
[{:to_address, {'localhost', 4318}}, {:inet, [:inet], :econnrefused}]}
```
That might be due to the misconfiguration of the `EXTERNAL_IP` environment variable. Make sure, that the variable is set in the environment where you are running the server, as well as that it is the IPv4 address pointing to the server, visible by all the peers.

#### When I run the videoroom in the docker container, why cannot I access VP8 tracking?
You need to publish docker ports used for sending and receiving media (`INTEGRATED_TURN_PORT_RANGE` environment variable) or you can use the host network if you are running on Linux.


## Copyright and License

Copyright 2020, [Software Mansion](https://swmansion.com/?utm_source=git&utm_medium=readme&utm_campaign=membrane)

[![Software Mansion](https://logo.swmansion.com/logo?color=white&variant=desktop&width=200&tag=membrane-github)](https://swmansion.com/?utm_source=git&utm_medium=readme&utm_campaign=membrane)

Licensed under the [Apache License, Version 2.0](LICENSE)