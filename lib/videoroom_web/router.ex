defmodule VideoRoomWeb.Router do
  use VideoRoomWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
  end

  scope "/", VideoRoomWeb do
    pipe_through(:browser)

    get("/", PageController, :index)
    get("/room", PageController, :index)
    get("/room/:room_id", PageController, :index)

#    post("/", PageController, :enter)
#
#    get("/room/:room_id", RoomController, :index)
#
#    get("/room/:room_id/stats", RoomController, :scrape)

    get("/healthcheck", PageController, :healthcheck)
  end
end
