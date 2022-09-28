defmodule VideoRoom.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """

  alias Membrane.RTC.Engine.TimescaleDB

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

  @spec cp_grafana_config_to_lib() :: :ok
  def cp_grafana_config_to_lib() do
    do_cp_grafana_config_to_lib()
    :ok
  end

  @spec cp_grafana_config_to_lib(Mix.Release.t()) :: Mix.Release.t()
  def cp_grafana_config_to_lib(release) do
    do_cp_grafana_config_to_lib()
    release
  end

  defp do_cp_grafana_config_to_lib() do
    rtc_engine_timescaledb_priv =
      "./_build/prod/rel/membrane_videoroom_demo/lib/membrane_rtc_engine_timescaledb-#{TimescaleDB.ReleaseHelper.project_version()}/priv"

    target_path = "_build/prod/rel/membrane_videoroom_demo/lib/"

    TimescaleDB.ReleaseHelper.cp_grafana_directory(rtc_engine_timescaledb_priv, target_path)
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
