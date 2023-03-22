defmodule VideoRoomWeb.Router do
  use VideoRoomWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
  end

  scope "/", VideoRoomWeb do
    pipe_through(:browser)

    get("/room", PageController, :index)
    get("/room/:room_id", PageController, :index)

    get("/healthcheck", PageController, :healthcheck)

    get("/webrtc-internals", StatsController, :index)

    # use of '/*path' route allows for client-side handing of unknown routes
    get("/*path", PageController, :index)
  end
end
