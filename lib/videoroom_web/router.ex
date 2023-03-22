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
    
    # use of '/*path' route allows for client-side handing of unknown routes
    get("/*path", PageController, :index)
    
    get("/webrtc-internals", StatsController, :index)
  end
end
