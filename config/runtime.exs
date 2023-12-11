import Config

defmodule ConfigParser do
  def parse_integrated_turn_ip(ip) do
    with {:ok, parsed_ip} <- ip |> to_charlist() |> :inet.parse_address() do
      parsed_ip
    else
      _ ->
        raise("""
        Bad integrated TURN IP format. Expected IPv4, got: \
        #{inspect(ip)}
        """)
    end
  end

  def parse_integrated_turn_port_range(range) do
    with [str1, str2] <- String.split(range, "-"),
         from when from in 0..65_535 <- String.to_integer(str1),
         to when to in from..65_535 and from <= to <- String.to_integer(str2) do
      {from, to}
    else
      _else ->
        raise("""
        Bad INTEGRATED_TURN_PORT_RANGE enviroment variable value. Expected "from-to", where `from` and `to` \
        are numbers between 0 and 65535 and `from` is not bigger than `to`, got: \
        #{inspect(range)}
        """)
    end
  end

  def parse_port_number(nil, _var_name), do: nil

  def parse_port_number(var_value, var_name) do
    with {port, _sufix} when port in 1..65535 <- Integer.parse(var_value) do
      port
    else
      _var ->
        raise(
          "Bad #{var_name} enviroment variable value. Expected valid port number, got: #{inspect(var_value)}"
        )
    end
  end

  def parse_metrics_scrape_interval(nil), do: nil

  def parse_metrics_scrape_interval(interval) do
    with {number, _sufix} when number >= 1 <- Integer.parse(interval) do
      number
    else
      _var ->
        raise "Bad METRICS_SCRAPE_INTERVAL enviroment variable value. Expected positive integer, got: #{interval}"
    end
  end

  def parse_store_metrics("true"), do: true

  def parse_store_metrics("false"), do: false

  def parse_store_metrics(invalid_value) do
    raise "Bad STORE_METRICS enviroment variable value. Expected \"true\" or \"false\", got: #{invalid_value}"
  end
end

config :membrane_videoroom_demo,
  integrated_turn_ip:
    System.get_env("EXTERNAL_IP", "127.0.0.1") |> ConfigParser.parse_integrated_turn_ip(),
  integrated_turn_port_range:
    System.get_env("INTEGRATED_TURN_PORT_RANGE", "50050-50100")
    |> ConfigParser.parse_integrated_turn_port_range(),
  integrated_tcp_turn_port:
    System.get_env("INTEGRATED_TCP_TURN_PORT")
    |> ConfigParser.parse_port_number("INTEGRATED_TCP_TURN_PORT"),
  integrated_tls_turn_port:
    System.get_env("INTEGRATED_TLS_TURN_PORT")
    |> ConfigParser.parse_port_number("INTEGRATED_TLS_TURN_PORT"),
  integrated_turn_pkey: System.get_env("INTEGRATED_TURN_PKEY"),
  integrated_turn_cert: System.get_env("INTEGRATED_TURN_CERT"),
  integrated_turn_domain: System.get_env("VIRTUAL_HOST"),
  store_metrics: System.get_env("STORE_METRICS", "false") |> ConfigParser.parse_store_metrics(),
  metrics_scrape_interval:
    System.get_env("METRICS_SCRAPE_INTERVAL", "1")
    |> ConfigParser.parse_metrics_scrape_interval()

protocol = if System.get_env("USE_TLS") == "true", do: :https, else: :http

get_env = fn env, default ->
  if config_env() == :prod do
    System.fetch_env!(env)
  else
    System.get_env(env, default)
  end
end

host = get_env.("VIRTUAL_HOST", "localhost")
port = 5002

args =
  if protocol == :https do
    [
      keyfile: get_env.("KEY_FILE_PATH", "priv/certs/key.pem"),
      certfile: get_env.("CERT_FILE_PATH", "priv/certs/certificate.pem"),
      cipher_suite: :strong
    ]
  else
    []
  end
  |> Keyword.merge(otp_app: :membrane_videoroom_demo, port: port)

config :membrane_videoroom_demo, VideoRoomWeb.Endpoint, [
  {:url, [host: host]},
  {protocol, args}
]

otel_state = :purge

config :opentelemetry, :resource,
  service: [
    name: "membrane",
    namespace: "membrane"
  ]

exporter =
  case otel_state do
    :local ->
      {:otel_exporter_stdout, []}

    :honeycomb ->
      {:opentelemetry_exporter,
       %{
         endpoints: ["https://api.honeycomb.io:443"],
         headers: [
           {"x-honeycomb-dataset", "experiments"},
           {"x-honeycomb-team", System.get_env("HONEYCOMB")}
         ]
       }}

    :zipkin ->
      {:opentelemetry_zipkin,
       %{
         address: ["http://localhost:9411/api/v2/spans"],
         local_endpoint: %{service_name: "VideoRoom"}
       }}

    _ ->
      {}
  end

if otel_state != :purge do
  config :opentelemetry,
    processors: [
      otel_batch_processor: %{
        exporter: exporter
      }
    ]
else
  config :opentelemetry, traces_exporter: :none
end

config :membrane_videoroom_demo, VideoRoom.Repo,
  database: System.get_env("DATABASE"),
  username: System.get_env("DB_USERNAME"),
  password: System.get_env("DB_PASSWORD"),
  hostname: System.get_env("DB_HOSTNAME"),
  port: System.get_env("DB_PORT", "5432") |> ConfigParser.parse_port_number("DB_PORT")
