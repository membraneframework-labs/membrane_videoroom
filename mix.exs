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
      dialyzer: dialyzer()
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
      {:membrane_rtc_engine,
       github: "jellyfish-dev/membrane_rtc_engine",
       branch: "sgfn/sip-endpoint-demo",
       sparse: "engine",
       override: true},
      {:membrane_rtc_engine_webrtc,
       github: "jellyfish-dev/membrane_rtc_engine",
       branch: "sgfn/sip-endpoint-demo",
       sparse: "webrtc",
       override: true},
      {:membrane_rtc_engine_sip,
       github: "jellyfish-dev/membrane_rtc_engine",
       branch: "sgfn/sip-endpoint-demo",
       sparse: "sip",
       override: true},
      {:plug_cowboy, "~> 2.5"},
      {:phoenix, "~> 1.6.15"},
      {:phoenix_html, "~> 3.0"},
      {:phoenix_live_view, "~> 0.17.0"},
      {:phoenix_pubsub, "~> 2.1.1"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:jason, "~> 1.2"},
      {:phoenix_inline_svg, "~> 1.4"},
      {:elixir_uuid, "~> 1.2"},
      {:esbuild, "~> 0.4", runtime: Mix.env() == :dev},
      {:cowlib, "~> 2.11.0", override: true},
      {:dialyxir, ">= 0.0.0", only: :dev, runtime: false},
      {:credo, ">= 0.0.0", only: :dev, runtime: false},

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
