defmodule VideoRoom.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """

  alias Membrane.RTC.Engine.TimescaleDB.GrafanaHelper

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

  @spec cp_grafana_config(String.t()) :: :ok
  def cp_grafana_config(target_path),
    do: GrafanaHelper.cp_grafana_directory(target_path)

  @spec cp_grafana_config_release_step(Mix.Release.t()) :: Mix.Release.t()
  def cp_grafana_config_release_step(release) do
    IO.inspect(release, label: "dupa release struct", limit: :infinity)
    GrafanaHelper.cp_grafana_directory(release.path)
    release
  end

  # defp do_cp_grafana_config_to_lib() do
  #   GrafanaHelper.cp_grafana_directory("_build/prod/rel/#{@app}/lib/")
  # end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
