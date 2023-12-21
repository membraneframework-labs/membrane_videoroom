defmodule Videoroom.Room do
  @moduledoc false

  use GenServer

  require Membrane.Logger
  require Membrane.OpenTelemetry

  require Logger
  alias Membrane.ICE.TURNManager
  alias Membrane.RTC.Engine
  alias Membrane.RTC.Engine.Endpoint.{WebRTC, SIP}
  alias Membrane.RTC.Engine.Endpoint.SIP.RegistrarCredentials
  alias Membrane.RTC.Engine.Endpoint.WebRTC.SimulcastConfig
  alias Membrane.RTC.Engine.Message
  alias Membrane.WebRTC.Extension.{Mid, RepairedRid, Rid, TWCC, VAD}
  alias Membrane.WebRTC.Track.Encoding
  alias Membrane.RTC.Engine.Message.{EndpointAdded, EndpointRemoved}

  @mix_env Mix.env()

  @sip_endpoint "sip-endpoint"

  @spec start(any(), list()) :: {:ok, pid()}
  def start(init_arg, opts) do
    GenServer.start(__MODULE__, init_arg, opts)
  end

  @spec start_link(any()) :: {:ok, pid()}
  def start_link(opts) do
    GenServer.start_link(__MODULE__, [], opts)
  end

  @spec add_peer_channel(pid(), pid(), String.t()) :: :ok
  def add_peer_channel(room_pid, peer_channel_pid, peer_id) do
    GenServer.call(room_pid, {:add_peer_channel, peer_channel_pid, peer_id})
  end

  @spec room_span_id(String.t()) :: String.t()
  def room_span_id(id), do: "room:#{id}"

  @impl true
  def init(args) do
    room_id = args.room_id
    simulcast? = args.simulcast?

    Logger.metadata(room_id: room_id)
    Membrane.Logger.info("Spawning room process: #{inspect(self())}")

    turn_mock_ip = Application.fetch_env!(:membrane_videoroom_demo, :integrated_turn_ip)
    turn_ip = if @mix_env == :prod, do: {0, 0, 0, 0}, else: turn_mock_ip

    trace_ctx = Membrane.OpenTelemetry.new_ctx()
    Membrane.OpenTelemetry.attach(trace_ctx)

    span_id = room_span_id(room_id)
    room_span = Membrane.OpenTelemetry.start_span(span_id)
    Membrane.OpenTelemetry.set_attributes(span_id, tracing_metadata())

    rtc_engine_options = [
      id: room_id,
      trace_ctx: trace_ctx,
      parent_span: room_span
    ]

    turn_cert_file =
      case Application.fetch_env(:membrane_videoroom_demo, :integrated_turn_cert_pkey) do
        {:ok, val} -> val
        :error -> nil
      end

    integrated_turn_options = [
      ip: turn_ip,
      mock_ip: turn_mock_ip,
      ports_range: Application.fetch_env!(:membrane_videoroom_demo, :integrated_turn_port_range),
      cert_file: turn_cert_file
    ]

    network_options = [
      integrated_turn_options: integrated_turn_options,
      integrated_turn_domain:
        Application.fetch_env!(:membrane_videoroom_demo, :integrated_turn_domain),
      dtls_pkey: Application.get_env(:membrane_videoroom_demo, :dtls_pkey),
      dtls_cert: Application.get_env(:membrane_videoroom_demo, :dtls_cert)
    ]

    tcp_turn_port = Application.get_env(:membrane_videoroom_demo, :integrated_tcp_turn_port)
    TURNManager.ensure_tcp_turn_launched(integrated_turn_options, port: tcp_turn_port)

    if turn_cert_file do
      tls_turn_port = Application.get_env(:membrane_videoroom_demo, :integrated_tls_turn_port)
      TURNManager.ensure_tls_turn_launched(integrated_turn_options, port: tls_turn_port)
    end

    {:ok, pid} = Membrane.RTC.Engine.start_link(rtc_engine_options, [])
    Engine.register(pid, self())

    {:ok, _pid} =
      DynamicSupervisor.start_child(
        Videoroom.RoomMonitorSupervisor,
        {Videoroom.Room.Monitor, [self(), room_id]}
      )

    {:ok,
     %{
       room_id: room_id,
       rtc_engine: pid,
       peer_channels: %{},
       network_options: network_options,
       trace_ctx: trace_ctx,
       simulcast?: simulcast?,
       enable_vad?: true,
       phone_number: nil
     }}
  end

  @impl true
  def handle_call({:add_peer_channel, peer_channel_pid, peer_id}, _from, state) do
    state = put_in(state, [:peer_channels, peer_id], peer_channel_pid)
    send(peer_channel_pid, {:simulcast_config, state.simulcast?})
    Process.monitor(peer_channel_pid)

    Membrane.Logger.info("New peer: #{inspect(peer_id)}. Accepting.")

    handshake_opts =
      if state.network_options[:dtls_pkey] &&
           state.network_options[:dtls_cert] do
        [
          client_mode: false,
          dtls_srtp: true,
          pkey: state.network_options[:dtls_pkey],
          cert: state.network_options[:dtls_cert]
        ]
      else
        [
          client_mode: false,
          dtls_srtp: true
        ]
      end

    webrtc_extensions = [Mid, Rid, RepairedRid, TWCC, VAD]

    endpoint = %WebRTC{
      rtc_engine: state.rtc_engine,
      ice_name: peer_id,
      owner: self(),
      integrated_turn_options: state.network_options[:integrated_turn_options],
      integrated_turn_domain: state.network_options[:integrated_turn_domain],
      handshake_opts: handshake_opts,
      log_metadata: [peer_id: peer_id],
      # trace_context: state.trace_ctx,
      webrtc_extensions: webrtc_extensions,
      rtcp_sender_report_interval: Membrane.Time.seconds(5),
      rtcp_receiver_report_interval: Membrane.Time.seconds(5),
      filter_codecs: &filter_codecs/1,
      toilet_capacity: 1000,
      simulcast_config: %SimulcastConfig{
        enabled: state.simulcast?,
        initial_target_variant: fn _track -> :medium end
      }
    }

    :ok = Engine.add_endpoint(state.rtc_engine, endpoint, id: peer_id)

    {:reply, :ok, state}
  end

  @impl true
  def handle_info(%Message.EndpointMessage{endpoint_id: to, message: {:media_event, data}}, state) do
    if state.peer_channels[to] != nil do
      send(state.peer_channels[to], {:media_event, data})
    end

    {:noreply, state}
  end

  #  @impl true
  #  def handle_info(%Message.EndpointCrashed{endpoint_id: @sip_endpoint}, state) do
  #    {:noreply, %{state | phone_number: nil}}
  #  end

  @impl true
  def handle_info(%Message.EndpointCrashed{endpoint_id: endpoint_id}, state) do
    Membrane.Logger.error("Endpoint #{inspect(endpoint_id)} has crashed!")
    peer_channel = state.peer_channels[endpoint_id]

    if peer_channel do
      send(peer_channel, :endpoint_crashed)
    else
      Membrane.Logger.warning("""
      No peer corresponding to endpoint: #{inspect(endpoint_id)}.
      It might have left just before the crash happend or the
      crash happend as a result of peer leaving.
      """)
    end

    {:noreply, state}
  end

  # media_event coming from client
  @impl true
  def handle_info({:media_event, to, event}, state) do
    # The code below is a little bit of a hack. Because we check the internals of media-events,
    # which could change in the future and are not part of Public API.
    # That's why it would be better to set up a separate web socket.
    new_state =
      case Jason.decode!(event) do
        %{"type" => "SIP-Event", "phoneNumber" => phone_number} ->
          if is_nil(state.phone_number) do
            state = %{state | phone_number: phone_number}
            call_phone(state.rtc_engine, phone_number)
            state
          else
            Logger.warning(
              "Tried to add another SIP Endpoint when previous call doesn't end, so removing old SIP endpoint"
            )

            state
          end

        %{"type" => "SIP-Event", "msg" => "disconnect"} ->
          Logger.info("Remove phone number")
          Engine.remove_endpoint(state.rtc_engine, @sip_endpoint)
          state

        _other ->
          Engine.message_endpoint(state.rtc_engine, to, {:media_event, event})
          state
      end

    {:noreply, new_state}
  end

  @impl true
  def handle_info({:DOWN, _ref, :process, pid, _reason}, state) do
    {peer_id, _peer_channel_id} =
      state.peer_channels
      |> Enum.find(fn {_peer_id, peer_channel_pid} -> peer_channel_pid == pid end)

    Membrane.Logger.info("Peer #{inspect(peer_id)} left")

    Engine.remove_endpoint(state.rtc_engine, peer_id)
    {_elem, state} = pop_in(state, [:peer_channels, peer_id])

    if state.peer_channels == %{} do
      Membrane.Logger.info("Last peer left the room. Terminating engine.")

      case Membrane.Pipeline.terminate(state.rtc_engine) do
        :ok ->
          Membrane.Logger.info("Engine terminated.")
          {:stop, :normal, state}

        error ->
          Membrane.Logger.error(
            "Couldn't terminate engine gracefully: #{inspect(error)}. Forcing termination."
          )

          Process.exit(state.rtc_engine, :kill)
          {:noreply, state}
      end
    else
      {:noreply, state}
    end
  end

  @impl true
  def handle_info(
        %EndpointAdded{
          endpoint_id: _sip_endpoint_id,
          endpoint_type: SIP
        },
        state
      ) do
    {:noreply, state}
  end

  @impl true
  def handle_info(
        %EndpointRemoved{
          endpoint_type: SIP
        },
        state
      ) do
    state = %{state | phone_number: nil}

    {:noreply, state}
  end

  @impl true
  def handle_info(ignored_message, state) do
    Membrane.Logger.warning("Ignored message: #{inspect(ignored_message)}")
    {:noreply, state}
  end

  defp call_phone(rtc_engine, phone_number) do
    registrar_credentials =
      RegistrarCredentials.new(
        address: System.fetch_env!("SIP_DOMAIN"),
        username: System.fetch_env!("SIP_USERNAME"),
        password: System.fetch_env!("SIP_PASSWORD")
      )

    endpoint = %SIP{
      rtc_engine: rtc_engine,
      registrar_credentials: registrar_credentials,
      external_ip: System.fetch_env!("EXTERNAL_IP")
    }

    :ok = Engine.add_endpoint(rtc_engine, endpoint, id: @sip_endpoint)

    :ok = SIP.dial(rtc_engine, @sip_endpoint, phone_number)
  end

  defp filter_codecs(%Encoding{name: "VP8"}), do: true
  defp filter_codecs(%Encoding{name: "opus"}), do: true
  defp filter_codecs(_other), do: false

  defp tracing_metadata(),
    do: [
      {:"library.language", :erlang},
      {:"library.name", :membrane_rtc_engine},
      {:"library.version", "server:#{Application.spec(:membrane_rtc_engine, :vsn)}"}
    ]
end
