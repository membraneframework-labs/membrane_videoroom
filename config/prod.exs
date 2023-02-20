import Config

config :logger, level: :info

config :membrane_videoroom_demo, VideoRoomWeb.Endpoint, server: true
config :membrane_core, use_push_flow_control: true
