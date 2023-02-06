defmodule Videoroom.PeersTracker do
  @moduledoc false

  # Module responsible for ensuring that we won't allow more peers than the server can handle
  # It is crutial to ensure that we don't get random timeouts and other overload problems

  @type peer_id() :: Membrane.RTC.Engine.Endpoint.id()

  @spec child_spec([]) :: Supervisor.child_spec()
  def child_spec([]) do
    Registry.child_spec(name: __MODULE__, keys: :unique)
  end

  @spec try_add(peer_id()) :: :ok | {:error, :full}
  def try_add(peer_id) do
    if Registry.count(__MODULE__) == Application.fetch_env!(:membrane_videoroom_demo, :max_peers) do
      {:error, :full}
    else
      Registry.register(__MODULE__, peer_id, nil)
      :ok
    end
  end

  @spec remove(peer_id()) :: :ok
  def remove(peer_id) do
    Registry.unregister(__MODULE__, peer_id)
  end
end
