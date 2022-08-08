defmodule VideoRoomWeb.RoomController do
  use VideoRoomWeb, :controller

  def index(conn, %{"room_id" => id, "display_name" => _name} = params) do
    render(conn, "index.html", room_id: id)
  end

  # display name is not present, redirect to home page with filled in room name
  def index(conn, %{"room_id" => id} = params) do
    params =
      if Map.get(params, "simulcast", "false") == "true",
        do: %{room_id: id, simulcast: true},
        else: %{room_id: id}

    redirect(conn, to: Routes.page_path(conn, :index, params))
  end

  def scrape(conn, %{"room_id" => id}) do
    response =
      Membrane.TelemetryMetrics.Reporter.scrape(VideoRoomReporter)
      |> Map.get({:room_id, id})
      |> inspect(pretty: true, limit: :infinity)

    text(conn, response)
  end
end
