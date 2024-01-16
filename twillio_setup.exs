Mix.install(
  [
    {:httpoison, "~> 2.0"},
    {:jason, "~> 1.4.1"}
  ]
  # force: true
)

# TWILIO SETUP GUIDE

# 1. Purchase a phone number: search "Phone Numbers" in search bar > Buy a number
# 2. Get Twilio account SID and auth token: search "API keys" in search bar > Auth Tokens section > Live Credentials > Account SID, Auth Token
# 3. Setup your envs and run elixir script twilio_setup.exs
# 4. Setup geographic permissions: search "Voice Geographic Permissions" in search bar > select countries in which the numbers you're planning to call are registered

Application.start(:httpoison)

twilio_account_sid = System.fetch_env!("TWILIO_ACCOUNT_SID")
twilio_auth_token = System.fetch_env!("TWILIO_AUTH_TOKEN")
sip_username = System.fetch_env!("SIP_USERNAME")
sip_password = System.fetch_env!("SIP_PASSWORD")

external_ip = System.fetch_env!("EXTERNAL_IP")

phone_numbers =
  HTTPoison.get!(
    "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/IncomingPhoneNumbers.json?PageSize=50&Page=0",
    [],
    hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
  )

decoded = Jason.decode!(phone_numbers.body)

phone_numbers =
  for phone <- decoded["incoming_phone_numbers"] do
    phone["phone_number"]
  end

IO.inspect(phone_numbers, label: :TWILIO_PHONE_NUMBERS)

# SIP Domain created
created_sip_domain =
  HTTPoison.post!(
    "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/SIP/Domains.json",
    {:form,
     [
       {"DomainName", "swm2.sip.twilio.com"},
       {"FriendlyName", "SIP demo"},
       {"SipRegistration", true},
       {"VoiceUrl", "http://bigcow.jellyfish.ovh/sip-webhook"},
       {"VoiceMethod", "GET"}
     ]},
    [],
    hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
  ).body
  |> Jason.decode!()

sip_domain_sid = created_sip_domain["sid"]

# IP ACL created
ip_access_control_list_sid =
  HTTPoison.post!(
    "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/SIP/IpAccessControlLists.json",
    {:form,
     [
       {"FriendlyName", "SIP DEMO ACL"}
     ]},
    [],
    hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
  ).body
  |> Jason.decode!()
  |> Map.get("sid")

# IP Addresses added
HTTPoison.post!(
  "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/SIP/IpAccessControlLists/#{ip_access_control_list_sid}/IpAddresses.json",
  {:form,
   [
     {"FriendlyName", "SIP DEMO IP ACL"},
     {"IpAddress", external_ip}
   ]},
  [],
  hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
)

# Create mapping between SIP Domain and ACL
HTTPoison.post!(
  "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/SIP/Domains/#{sip_domain_sid}/Auth/Calls/IpAccessControlListMappings.json",
  {:form,
   [
     {"IpAccessControlListSid", ip_access_control_list_sid}
   ]},
  [],
  hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
)

# Credentials list created
credentials_list_sid =
  HTTPoison.post!(
    "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/SIP/CredentialLists.json",
    {:form,
     [
       {"FriendlyName", "SIP DEMO CredList"}
     ]},
    [],
    hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
  ).body
  |> Jason.decode!()
  |> Map.get("sid")

# Credential added
HTTPoison.post!(
  "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/SIP/CredentialLists/#{credentials_list_sid}/Credentials.json",
  {:form,
   [
     {"Username", sip_username},
     {"Password", sip_password}
   ]},
  [],
  hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
)

# Create mapping between SIP Domain and credential list
HTTPoison.post!(
  "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/SIP/Domains/#{sip_domain_sid}/Auth/Calls/CredentialListMappings.json",
  {:form,
   [
     {"CredentialListSid", credentials_list_sid}
   ]},
  [],
  hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
)

# Create mapping between SIP Domain Registration and credential list
HTTPoison.post!(
  "https://api.twilio.com/2010-04-01/Accounts/#{twilio_account_sid}/SIP/Domains/#{sip_domain_sid}/Auth/Registrations/CredentialListMappings.json",
  {:form,
   [
     {"CredentialListSid", credentials_list_sid}
   ]},
  [],
  hackney: [basic_auth: {twilio_account_sid, twilio_auth_token}]
)
