defmodule VideoRoom.Metrics do
  @moduledoc """
  Defines functions to get reports from Membrane.TelemetryMetrics.Reporter
  """

  alias Membrane.TelemetryMetrics.Reporter

  @spec scrape() :: Reporter.report()
  def scrape() do
    Reporter.scrape(Reporter)
  end

  @spec scrape_and_cleanup() :: Reporter.report()
  def scrape_and_cleanup() do
    Reporter.scrape(Reporter)
  end
end
