defmodule VideoRoom.Repo.Migrations.CreateRtcEngineMetricsPersistenceTables do
  use Ecto.Migration

  alias Membrane.RTC.Engine.TimescaleDB.Migrations

  def up do
    Migrations.up(version: 1)
  end

  def down do
    Migrations.down(version: 1)
  end
end
