defmodule VideoRoom.MetricsPersistor do
  @moduledoc """
  Module responsible for scraping metrics reports and persisting them in the database.
  """

  use GenServer

  alias Membrane.RTC.Engine.TimescaleDB
  alias Membrane.TelemetryMetrics.Reporter

  @type option() :: GenServer.option() | {:scrape_interval, pos_integer()}
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
    apply(GenServer, function, [__MODULE__, scrape_interval, options])
  end

  @impl true
  def init(scrape_interval) do
    scrape_interval_ms =
      Membrane.Time.seconds(scrape_interval)
      |> Membrane.Time.as_milliseconds()

    Process.send_after(self(), :scrape, scrape_interval_ms)

    {:ok, %{scrape_interval_ms: scrape_interval_ms}}
  end

  @impl true
  def handle_info(:scrape, state) do
    Reporter.scrape(VideoRoomReporter)
    |> TimescaleDB.store_report()

    Process.send_after(self(), :scrape, state.scrape_interval_ms)

    {:noreply, state}
  end
end
