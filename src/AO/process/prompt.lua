local json = require("json")
local math = require("math")

-- Load the Llama Herder library
Llama = require("@sam/Llama-Herder")

_0RBIT = "BaMK1dfayo75s3q1ow6AO64UDpD9SEFbeE8xYrY2fyQ"
_0RBT_TOKEN = "BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc"
FEE_AMOUNT = "1000000000000" -- 1 $0RBT

-- Callback function for fetch price
fetchPriceCallback = nil
ReceivedDataHistory = ReceivedDataHistory or {}
ReceivedDataForecast = ReceivedDataForecast or {}
RECO_HISTORY = RECO_HISTORY or {}


function fetchClimateHistorical(callback, Latitude, Longitude)
    local latitude = Latitude
    local longitude = Longitude
    local url = "https://archive-api.open-meteo.com/v1/archive?latitude=" ..
    latitude ..
    "&longitude=" ..
    longitude ..
    "&start_date=2017-08-22&end_date=2024-09-10&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation"
    Send({
        Target = _0RBT_TOKEN,
        Action = "Transfer",
        Recipient = _0RBIT,
        Quantity = FEE_AMOUNT,
        ["X-Url"] = url,
        ["X-Action"] = "Get-Real-Data"
    })

    print("GET Request sent to the 0rbit process for Historical Data.")

    -- Save the callback to be called later
    fetchPriceCallback = callback
end

function fetchClimateForecast(callback, Latitude, Longitude)
    local latitude = Latitude
    local longitude = Longitude
    local url = "https://api.open-meteo.com/v1/forecast?latitude="..latitude.."&longitude="..longitude.."&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth&forecast_days=1"
    Send({
        Target = _0RBT_TOKEN,
        Action = "Transfer",
        Recipient = _0RBIT,
        Quantity = FEE_AMOUNT,
        ["X-Url"] = url,
        ["X-Action"] = "Get-Real-Data"
    })

    print("GET Request sent to the 0rbit process for Forecast Data.")

    -- Save the callback to be called later
    fetchPriceCallback = callback
end

function CreatePrompt(systemPrompt, userContent)
    return [[<|system|>
]] .. systemPrompt .. [[<|end|>
<|user|>
]] .. userContent .. [[<|end|>
<|assistant|>
]]
end

-- Handlers for receiving data
Handlers.add(
    "Receive-Historical",
    Handlers.utils.hasMatchingTag("Action", "Receive-Response"),
    function(msg)
        local res = json.decode(msg.Data)
        ReceivedDataHistory = res
        print("Historical Data received from the 0rbit process.")
    end
)

Handlers.add(
    "Receive-Forecast",
    Handlers.utils.hasMatchingTag("Action", "Receive-Response"),
    function(msg)
        local res = json.decode(msg.Data)
        ReceivedDataForecast = res
        print("Forecast Data received from the 0rbit process.")
    end
)

Handlers.add(
    "fetchHistorical",
    Handlers.utils.hasMatchingTag("Action", "fetchHistorical"),
    function(m)
        if m.Tags.Latitude and m.Tags.Longitude then
            local Latitude = m.Tags.Latitude
            local Longitude = m.Tags.Longitude
            
            -- Fetch historical data
            fetchClimateHistorical(function() 
                ao.send({ Target = m.From, Action = "fetchForecast", Latitude = Latitude, Longitude = Longitude }) 
            end, Latitude, Longitude)

            print("Fetching Historical Data...")
        end
    end
)

Handlers.add(
    "fetchForecast",
    Handlers.utils.hasMatchingTag("Action", "fetchForecast"),
    function(m)
        if m.Tags.Latitude and m.Tags.Longitude then
            local Latitude = m.Tags.Latitude
            local Longitude = m.Tags.Longitude

            -- Fetch forecast data
            fetchClimateForecast(function() 
                ao.send({ Target = m.From, Action = "processData", Latitude = Latitude, Longitude = Longitude, Activities = m.Tags.Activities }) 
            end, Latitude, Longitude)

            print("Fetching Forecast Data...")
        end
    end
)
Handlers.add(
    "processData",
    Handlers.utils.hasMatchingTag("Action", "processData"),
    function(m)
        if hasReceivedData() then
            local Forecast = ReceivedDataForecast
            local Historical = ReceivedDataHistory
            local Activities = m.Tags.Activities
            
            local userContent = "Historical Data: " .. json.encode(Historical) .. 
                                " | Forecasted Data: " .. json.encode(Forecast) .. 
                                " | Activities: " .. Activities

            local prompt = CreatePrompt(
                "Analyse the weather data and give 2 recommendations based on the activities.",
                userContent)

            Llama.run(
                prompt,                  -- Your prompt
                30,                      -- Number of tokens to generate
                function(generated_text) -- Optional: A function to handle the response
                    local reco = generated_text
                    if not reco then
                        return print("Could not find any recommendations.")
                    end
                    print("Recommendation: " .. reco)
                    table.insert(RECO_HISTORY, reco)
                    ao.send({ Target = m.From, Data = "Recommendation: " .. reco })
                end
            )
        else
            print("Waiting for both Historical and Forecast data...")
        end
    end
)

Handlers.add(
    "check",
    Handlers.utils.hasMatchingTag("Action", "check"),
    function(m)
        if m.Tags.Latitude and m.Tags.Longitude and m.Tags.Activities then
            -- Start by fetching historical data
            ao.send({ Target = m.From, Action = "fetchHistorical", Latitude = m.Tags.Latitude, Longitude = m.Tags.Longitude })
        end
    end
)

