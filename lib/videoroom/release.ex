defmodule VideoRoom.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """
  @app :membrane_videoroom_demo

  @spec migrate() :: :ok
  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _fun_return, _apps} =
        Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end

    :ok
  end

  @spec rollback(module(), integer()) :: :ok
  def rollback(repo, version) do
    load_app()

    {:ok, _fun_return, _apps} =
      Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))

    :ok
  end

  @spec move_grafana_config(Mix.Release.t()) :: Mix.Release.t()
  def move_grafana_config(release, target_path \\ "_build/prod/rel/membrane_videoroom_demo/lib/") do
    target_path =
      if(String.ends_with?(target_path, "/"),
        do: target_path <> "/",
        else: target_path) <> "grafana"

    File.mkdir_p(target_path)

    Membrane.RTC.Engine.TimescaleDB.Mixfile.project()
    |> Keyword.fetch!(:version)
    |> then(&"./_build/prod/rel/membrane_videoroom_demo/lib/membrane_rtc_engine_timescaledb-#{&1}/priv/grafana")
    |> File.cp_r!(target_path)

    release
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
