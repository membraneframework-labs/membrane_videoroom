defmodule VideoRoomWeb.StatsChannel do
  @moduledoc """
  A secondary channel used to send metrics reports to the frontend
  """
  use Phoenix.Channel

  @impl true
  def join("stats", _message, socket) do
    {:ok, socket}
  end
end
