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

    {:ok, %{store_metrics: store_metrics, scrape_interval_ms: scrape_interval_ms}}
  end

  @impl true
  def handle_info(:scrape, state) do
    report = Reporter.scrape(VideoRoomReporter)
    Phoenix.PubSub.broadcast!(VideoRoom.PubSub, "metrics", {:metrics, prepare_fe_report(report)})

    if state.store_metrics, do: TimescaleDB.store_report(report)

    Process.send_after(self(), :scrape, state.scrape_interval_ms)

    {:noreply, state}
  end

  defp prepare_fe_report(report) when is_map(report) do
    report
    |> Map.new(fn {key, value} -> {maybe_remove_tuple(key), prepare_fe_report(value)} end)
  end

  defp prepare_fe_report(input), do: input

  defp maybe_remove_tuple(key) when is_tuple(key) do
    key
    |> Tuple.to_list()
    |> Enum.map_join("=", &to_string/1)
  end

  defp maybe_remove_tuple(key), do: to_string(key)
end
