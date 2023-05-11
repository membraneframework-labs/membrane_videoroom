defmodule VideoRoomWeb.PageController do
  use VideoRoomWeb, :controller

  @spec index(conn :: Plug.Conn.t(), params :: map()) :: Plug.Conn.t()
  def index(conn, params) do
    render(conn, "index.html",
      room_id: Map.get(params, "room_id"),
      simulcast: Map.get(params, "simulcast"),
      version: Application.fetch_env!(:membrane_videoroom_demo, :version)
    )
  end

  @spec internals(conn :: Plug.Conn.t(), params :: map()) :: Plug.Conn.t()
  def internals(conn, _params) do
    render(conn, "index.html")
  end

  @spec healthcheck(conn :: Plug.Conn.t(), params :: map()) :: Plug.Conn.t()
  def healthcheck(conn, _params) do
    conn
    |> send_resp(200, "")
  end
end
