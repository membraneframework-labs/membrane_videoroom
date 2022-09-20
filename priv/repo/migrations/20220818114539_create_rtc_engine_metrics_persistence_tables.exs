defmodule VideoRoom.Repo.Migrations.CreateRtcEngineMetricsPersistenceTables do
  use Ecto.Migration

  alias Membrane.RTC.Engine.TimescaleDB.Migrations

  def up do
    Migrations.up()
  end

  def down do
    Migrations.down()
  end
end
