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

    get("/*path", PageController, :index) # 'Catch all' route allows for client-side handing of unknown routes
  end
end
