defmodule VideoRoom.MixProject do
  use Mix.Project

  def project do
    [
      app: :membrane_videoroom_demo,
      version: "0.1.0",
      elixir: "~> 1.13",
      aliases: aliases(),
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      dialyzer: dialyzer(),
      releases: [
        membrane_videoroom_demo: [
          steps: [:assemble, &VideoRoom.Release.cp_grafana_config_release_step/1],
          applications: [membrane_rtc_engine_timescaledb: :load]
        ]
      ]
    ]
  end

  def application do
    [
      mod: {VideoRoom.Application, []},
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:membrane_core,
       github: "membraneframework/membrane_core", branch: "use-push-flow-0.11", override: true},
      {:membrane_rtc_engine, "~> 0.12.0", override: true},
      {:membrane_rtc_engine_timescaledb, "~> 0.1.0", runtime: false},
      {
        :membrane_rtp_plugin,
        # path: "../membrane_rtp_plugin",
        github: "membraneframework/membrane_rtp_plugin", branch: "master", override: true
      },
      {:plug_cowboy, "~> 2.5"},
      {:phoenix, "~> 1.6.15"},
      {:phoenix_html, "~> 3.0"},
      {:phoenix_live_view, "~> 0.17.0"},
      {:phoenix_pubsub, "~> 2.1.1"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:jason, "~> 1.2"},
      {:phoenix_inline_svg, "~> 1.4"},
      {:uuid, "~> 1.1"},
      {:esbuild, "~> 0.4", runtime: Mix.env() == :dev},
      {:cowlib, "~> 2.11.0", override: true},
      {:dialyxir, ">= 0.0.0", only: :dev, runtime: false},
      {:credo, ">= 0.0.0", only: :dev, runtime: false},

      # Ecto
      {:ecto_sql, "~> 3.7"},
      {:postgrex, "~> 0.16"},

      # Otel
      {:opentelemetry, "~> 1.0"},
      {:opentelemetry_api, "~> 1.0"},
      {:opentelemetry_exporter, "~> 1.0.4"},
      {:opentelemetry_zipkin, "~> 1.0"},

      # Benchmarks
      {:beamchmark, "~> 1.4.0", only: :benchmark},
      {:stampede, github: "membraneframework-labs/stampede-elixir", only: :benchmark},
      {:httpoison, "~> 1.8", only: :benchmark},
      {:poison, "~> 5.0.0", only: :benchmark}
    ]
  end

  defp dialyzer() do
    opts = [
      flags: [:error_handling]
    ]

    if System.get_env("CI") == "true" do
      # Store PLTs in cacheable directory for CI
      [plt_local_path: "priv/plts", plt_core_path: "priv/plts"] ++ opts
    else
      opts
    end
  end

  defp aliases do
    [
      setup: ["deps.get", "cmd --cd assets npm ci"],
      "assets.deploy": [
        "cmd --cd assets npm run deploy",
        "esbuild default --minify",
        "phx.digest"
      ],
      "ecto.setup": ["ecto.create", "ecto.migrate"],
      "ecto.reset": ["ecto.drop", "ecto.setup"]
    ]
  end
end
