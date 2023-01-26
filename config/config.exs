import Config

config :phoenix, :json_library, Jason

config :esbuild,
  version: "0.12.15",
  default: [
    args:
      ~w(src/index.tsx --bundle --target=es2016 --outfile=../priv/static/assets/js/app.js --external:/images/*),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
  ]

config :membrane_videoroom_demo, VideoRoomWeb.Endpoint, pubsub_server: VideoRoom.PubSub

config :membrane_videoroom_demo, version: System.get_env("VERSION", "unknown")

config :logger,
  compile_time_purge_matching: [
    [level_lower_than: :info],
    # Silence irrelevant warnings caused by resending handshake events
    [module: Membrane.SRTP.Encryptor, function: "handle_event/4", level_lower_than: :error]
  ]

telemetry_enabled = true

config :membrane_telemetry_metrics, enabled: telemetry_enabled

config :membrane_opentelemetry, enabled: telemetry_enabled

config :membrane_rtc_engine_timescaledb, repo: VideoRoom.Repo

config :membrane_videoroom_demo, ecto_repos: [VideoRoom.Repo]

config :logger, :console,
  format: "\n$time $metadata[$level] $message",
  metadata: [:file, :line, :room_id, :rtc_engine, :webrtc_endpoint]

import_config("#{config_env()}.exs")
