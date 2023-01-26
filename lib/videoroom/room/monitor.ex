defmodule Videoroom.Room.Monitor do
  @moduledoc false

  require Membrane.OpenTelemetry
  require Logger

  @spec monitor(pid(), String.t()) :: :ok
  def monitor(room_pid, room_id) do
    ref = Process.monitor(room_pid)

    receive do
      {:DOWN, ^ref, :process, ^room_pid, reason} ->
        Logger.info("Room: #{room_id} terminated with reason: #{inspect(reason)}")

        room_id
        |> Videoroom.Room.room_span_id()
        |> Membrane.OpenTelemetry.end_span()
    end

    :ok
  end
end
