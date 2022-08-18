defmodule VideoRoom.MetricsPersistor do
  use GenServer

  alias Membrane.RTC.Engine.TimescaleDB.Reporter

  @type option() :: GenServer.option() | {:reporter, Reporter.reporter()}
  @type options() :: [option()]

  # 1 second
  @scrape_interval 1000

  # 1 hour
  @cleanup_interval 1000 * 60 * 60

  @spec start(options()) :: GenServer.on_start()
  def start(options \\ []) do
    do_start(:start, reporter, options)
  end

  @spec start_link(options()) :: GenServer.on_start()
  def start_link(options \\ []) do
    do_start(:start_link, options)
  end

  defp do_start(function, options) do
    {reporter, gen_server_options} = Keyword.pop(options, :reporter)
    apply(GenServer, function, [__MODULE__, reporter, gen_server_options])
  end

  @impl true
  def init(reporter) do
    Process.send_after(self(), :scrape, @scrape_interval)
    Process.send_after(self(), :cleanup, @cleanup_interval)

    {:ok, %{reporter: reporter}}
  end

  @impl true
  def handle_info(:scrape, state) do
    report = Membrane.TelemetryMetrics.Reporter.scrape(VideoRoomReporter)
    Reporter.store_report(state.reporter, report)
    Process.send_after(self(), :scrape, @scrape_interval)

    {:noreply, state}
  end

  @impl true
  def handle_info(:cleanup, state) do
    Reporter.cleanup(state.reporter, 1, "day")
    Process.send_after(self(), :cleanup, @cleanup_interval)

    {:noreply, state}
  end
end
