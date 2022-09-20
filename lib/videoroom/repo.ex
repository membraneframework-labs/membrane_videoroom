defmodule VideoRoom.Repo do
  @moduledoc false
  use Ecto.Repo,
    otp_app: :membrane_videoroom_demo,
    adapter: Ecto.Adapters.Postgres
end
