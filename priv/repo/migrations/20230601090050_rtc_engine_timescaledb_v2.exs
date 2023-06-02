defmodule VideoRoom.Repo.Migrations.RtcEngineTimescaledbV2 do
  use Ecto.Migration

  alias Membrane.RTC.Engine.TimescaleDB.Migrations

  @spec up() :: :ok
  def up() do
    Migrations.up(version: 2)
  end

  @spec down() :: :ok
  def down() do
    Migrations.down(version: 2)
  end
end
