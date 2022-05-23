defmodule VideoRoom.Metrics do
  @moduledoc """
  Defines functions to get reports from Membrane.TelemetryMetrics.Reporter
  """

  alias Membrane.TelemetryMetrics.Reporter

  @spec scrape() :: Reporter.report()
  def scrape() do
    Reporter.scrape(videoroom_reporter())
  end

  @spec metrics() :: [Telemetry.Metrics.t()]
  def metrics(), do: Membrane.RTC.Engine.Metrics.metrics()

  @spec reporter_name() :: atom()
  def reporter_name(), do: videoroom_reporter()

  defp videoroom_reporter(), do: VideoRoom.Metrics.Reporter
end
