defmodule VideoRoom.MetricsPersistor do
  @moduledoc """
  Module responsible for scraping metrics reports and persisting them in the database.
  """

  use GenServer

  alias Membrane.RTC.Engine.TimescaleDB
  alias Membrane.TelemetryMetrics.Reporter

  @type option() ::
          GenServer.option() | {:scrape_interval, pos_integer()} | {:store_metrics, boolean()}
  @type options() :: [option()]

  @spec start(options()) :: GenServer.on_start()
  def start(options \\ []) do
    do_start(:start, options)
  end

  @spec start_link(options()) :: GenServer.on_start()
  def start_link(options \\ []) do
    do_start(:start_link, options)
  end

  defp do_start(function, options) do
    {scrape_interval, options} = Keyword.pop(options, :scrape_interval, 1)
    {store_metrics, options} = Keyword.pop(options, :store_metrics, false)

    apply(GenServer, function, [__MODULE__, [scrape_interval, store_metrics], options])
  end

  @impl true
  def init([scrape_interval, store_metrics]) do
    scrape_interval_ms =
      Membrane.Time.seconds(scrape_interval)
      |> Membrane.Time.as_milliseconds()

    Process.send_after(self(), :scrape, scrape_interval_ms)

    {:ok,
     %{
       store_metrics: store_metrics,
       scrape_interval_ms: scrape_interval_ms,
       prev_report: nil,
       prev_report_ts: 0
     }}
  end

  @impl true
  def handle_info(:scrape, state) do
    report = Reporter.scrape(VideoRoomReporter)

    VideoRoomWeb.Endpoint.broadcast!(
      "stats",
      "metrics",
      %{stats: prepare_fe_report(report, state)}
    )

    if state.store_metrics, do: TimescaleDB.store_report(report)

    Process.send_after(self(), :scrape, state.scrape_interval_ms)

    {:noreply,
     %{state | prev_report_ts: System.monotonic_time(:millisecond), prev_report: report}}
  end

  defp prepare_fe_report(report, state) do
    time = System.monotonic_time(:millisecond)

    report
    |> add_time_derivative_metrics(time, state)
    |> jsonify()
  end

  defp jsonify(report) when is_map(report) do
    Map.new(report, fn {key, value} -> {maybe_remove_tuple(key), jsonify(value)} end)
  end

  defp jsonify(input), do: input

  defp maybe_remove_tuple(key) when is_tuple(key) do
    key
    |> Tuple.to_list()
    |> Enum.map_join("=", &to_string/1)
  end

  defp maybe_remove_tuple(key), do: to_string(key)

  @metrics_to_derive [
    :"inbound-rtp.packets",
    :"inbound-rtp.bytes_received",
    :"ice.bytes_received",
    :"ice.bytes_sent",
    :"ice.packets_received",
    :"ice.packets_sent"
  ]

  defp add_time_derivative_metrics(report, time, state, path \\ []) do
    report =
      Map.new(report, fn
        {key, value} when is_map(value) ->
          {key, add_time_derivative_metrics(value, time, state, path ++ [key])}

        {key, value} ->
          {key, value}
      end)

    report
    |> Map.take(@metrics_to_derive)
    |> Enum.map(fn {key, value} when is_number(value) ->
      case get_in(state, [:prev_report | path ++ [key]]) do
        old_value when is_number(old_value) ->
          derivative = (value - old_value) * 1000 / (time - state.prev_report_ts)
          {"#{key}-per-second", derivative}

        _otherwise ->
          nil
      end
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.into(report)
  end
end
