import Config

config :membrane_videoroom_demo, VideoRoomWeb.Endpoint,
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:default, ~w(--sourcemap=inline --watch)]},
    npx: [
      "tailwindcss",
      "--input=css/app.css",
      "--output=../priv/static/assets/css/app.css",
      "--postcss",
      "--watch",
      cd: Path.expand("../assets", __DIR__)
    ]
  ]

config :membrane_videoroom_demo, VideoRoomWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/videoroom_web/(live|views)/.*(ex)$",
      ~r"lib/videoroom_web/templates/.*(eex)$"
    ]
  ]

# config :logger, level: :info
config :logger, level: :debug

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20
# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime
