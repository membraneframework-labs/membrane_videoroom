defmodule VideoRoomWeb.PeerChannel do
  @moduledoc """
  The main channel used to communicate with a peer,
  i.e. exchange media events and any additional messages
  """
  use Phoenix.Channel

  require Logger

  @impl true
  def join("room:" <> room_id, params, socket) do
    simulcast? = Map.get(params, "isSimulcastOn")

    case :global.whereis_name(room_id) do
      :undefined ->
        Videoroom.Room.start(%{room_id: room_id, simulcast?: simulcast?},
          name: {:global, room_id}
        )

      pid ->
        {:ok, pid}
    end
    |> handle_start_room_result(socket, room_id, simulcast?)
  end

  @impl true
  def handle_in("mediaEvent", %{"data" => event}, socket) do
    send(socket.assigns.room_pid, {:media_event, socket.assigns.peer_id, event})

    {:noreply, socket}
  end

  @impl true
  def handle_info(
        {:DOWN, _ref, :process, _pid, _reason},
        socket
      ) do
    {:stop, :normal, socket}
  end

  @impl true
  def handle_info({:media_event, event}, socket) do
    push(socket, "mediaEvent", %{data: event})

    {:noreply, socket}
  end

  @impl true
  def handle_info({:simulcast_config, simulcast_config}, socket) do
    push(socket, "simulcastConfig", %{data: simulcast_config})

    {:noreply, socket}
  end

  @impl true
  def handle_info({:sip_message, msg}, socket) do
    push(socket, "SIPMessage", %{data: msg})

    {:noreply, socket}
  end

  @impl true
  def handle_info(:endpoint_crashed, socket) do
    push(socket, "error", %{
      message: "WebRTC Endpoint has crashed. Please refresh the page to reconnect"
    })

    {:stop, :normal, socket}
  end

  defp handle_start_room_result(start_room_result, socket, room_id, simulcast?) do
    case start_room_result do
      {:ok, room_pid} ->
        do_join(socket, room_pid, room_id, simulcast?)

      {:error, {:already_started, room_pid}} ->
        do_join(socket, room_pid, room_id, simulcast?)

      {:error, reason} ->
        Logger.error("""
        Failed to start room.
        Room: #{inspect(room_id)}
        Reason: #{inspect(reason)}
        """)

        {:error, %{reason: "failed to start room"}}
    end
  end

  defp do_join(socket, room_pid, room_id, simulcast?) do
    peer_id = "#{UUID.uuid4()}"
    # TODO handle crash of room?

    try do
      Videoroom.Room.add_peer_channel(room_pid, self(), peer_id)
    catch
      :exit, _reason ->
        Logger.info("Room #{inspect(room_id)} died when trying to join. Creating a new one.")

        Videoroom.Room.start(%{room_id: room_id, simulcast?: simulcast?},
          name: {:global, room_id}
        )
        |> handle_start_room_result(socket, room_id, simulcast?)
    else
      :ok ->
        Process.monitor(room_pid)

        {:ok,
         Phoenix.Socket.assign(socket, %{room_id: room_id, room_pid: room_pid, peer_id: peer_id})}
    end
  end
end
