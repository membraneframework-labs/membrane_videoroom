defmodule VideoRoomWeb.WebhookController do
  use VideoRoomWeb, :controller

  @spec index(conn :: Plug.Conn.t(), params :: map()) :: Plug.Conn.t()
  def index(conn, params) do
    twilio_internal_phone_number = Sippet.URI.parse!(params["To"]).userinfo

    [{_twilio_phone_number, external_phone_number} | _phone_numbers] =
      :ets.lookup(:phone_numbers, twilio_internal_phone_number)

    body =
      """
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
          <Dial callerId="#{twilio_internal_phone_number}">
            <Number>#{external_phone_number}</Number>
          </Dial>
      </Response>
      """

    conn
    |> put_resp_content_type("application/xml")
    |> send_resp(200, body)
  end
end
