defmodule Videoroom.PeersTracker do
  @moduledoc false

  # Module responsible for ensuring that we won't allow more peers than the server can handle
  # It is crutial to ensure that we don't get random timeouts and other overload problems

  use Agent

  @type peer_id() :: Membrane.RTC.Engine.Endpoint.id()

  defmodule State do
    @moduledoc false

    @enforce_keys [:max_peers]
    defstruct @enforce_keys ++ [peers: MapSet.new()]
  end

  @spec start_link([]) :: Agent.on_start()
  def start_link([]) do
    Agent.start_link(
      fn -> %State{max_peers: Application.fetch_env!(:membrane_videoroom_demo, :max_peers)} end,
      name: __MODULE__
    )
  end

  @spec try_add(peer_id()) :: :ok | {:error, :full}
  def try_add(pid) do
    internal_pid = {self(), pid}

    Agent.get_and_update(__MODULE__, fn state ->
      if Enum.count(state.peers) == state.max_peers do 
        {{:error, :full}, state}
      else
        {:ok, %{state | peers: MapSet.put(state.peers, internal_pid)}}
      end
    end)
  end

  @spec remove(peer_id()) :: :ok
  def remove(pid) do
    internal_pid = {self(), pid}
    Agent.update(__MODULE__, &%{&1 | peers: MapSet.delete(&1.peers, internal_pid)})
  end

  @spec remove_all() :: :ok
  def remove_all() do
    pid = self()

    Agent.update(__MODULE__, fn state ->
      peers =
        state.peers
        |> Enum.reject(&match?({^pid, _peer_id}, &1))
        |> MapSet.new()

      %{state | peers: peers}
    end)
  end
end
