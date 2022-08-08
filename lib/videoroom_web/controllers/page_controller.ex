defmodule VideoRoomWeb.PageController do
  use VideoRoomWeb, :controller

  def index(conn, params) do
    render(conn, "index.html",
      room_id: Map.get(params, "room_id"),
      simulcast: Map.get(params, "simulcast")
    )
  end

  def enter(
        conn,
        %{"room_name" => room_name, "display_name" => display_name} = params
      ) do
    simulcast? = Map.get(params, "simulcast") == "true"

    path =
      Routes.room_path(
        conn,
        :index,
        room_name,
        %{"display_name" => display_name, "simulcast" => simulcast?}
      )

    redirect(conn, to: path)
  end

  def healthcheck(conn, _params) do
    conn
    |> send_resp(200, "")
  end
end
