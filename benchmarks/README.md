# Benchmarks

There are two benchmarks:
* simple - one big room 
* multiroom - multiple rooms with a small number of peers

To run stampede benchmarks, type from the root directory

```elixir
MIX_ENV=benchmark mix run benchmarks/<benchmark_name>.exs
```

To run testRTC benchmarks on our testing machine, type from the root directory

```elixir
MIX_ENV=benchmark EXTERNAL_IP=<ip> mix run benchmarks/testrtc.exs <api_key> <test_name>
```

where `test_name` is either `beamchmark-simple` or `beamchmark-multiroom`.

## Testbed

* AMD EPYC 7502P 32-Core Processor 
* 128 GB RAM
* video 1280x720, 9667 Kbps
* audio 192Kbps
* simulcast video limits: 1500Kbps, 500Kbps, 150Kbps
* non-simulcast video limit: 1500Kbps
* Chrome Stable (107.0.5304.110-1)
* Membrane RTC Engine - 0.8.2

## Test scenarios

* simple - 1 room with 20 participants
* multiroom - 50 rooms, each with 5 participants

## Results

### Simple

* **unsuccessful** simulcast with target quality set to 1280x720 - avg. CPU 65% -
that might be because of two peers being kicked from the session 
* simulcast with target quality set to 640x360 - avg. CPU 77%
* non-simulcast with the quality set to 1280x720 - avg. CPU 75%


### Multiroom

* simulcast with target quality set to 1280x720 - avg. CPU 35%
* simulcast with target quality set to 640x360 - avg. CPU 27%
* non-simulcast with the quality set to 1280x720 - avg. CPU 23-25%

The exact results are located under [results](results).

