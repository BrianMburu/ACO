local json = require("json")
local math = require("math")

-- Load the Llama Herder library
Llama = require("@sam/Llama-Herder")

_0RBIT = "BaMK1dfayo75s3q1ow6AO64UDpD9SEFbeE8xYrY2fyQ"
_0RBT_TOKEN = "BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc"
FEE_AMOUNT = "1000000000000" -- 1 $0RBT

fetchPriceCallback = nil
ReceivedDataForecast = ReceivedDataForecast or {}
RECO_HISTORY = RECO_HISTORY or {}

-- Function to fetch forecast data
function fetchClimateForecast(callback, Latitude, Longitude)
    local latitude = Latitude
    local longitude = Longitude
    local url = "https://api.open-meteo.com/v1/forecast?latitude="..latitude.."&longitude="..longitude.."&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation,rain,showers,snowfall,snow_depth&forecast_days=2"
    Send({
        Target = _0RBT_TOKEN,
        Action = "Transfer",
        Recipient = _0RBIT,
        Quantity = FEE_AMOUNT,
        ["X-Url"] = url,
        ["X-Action"] = "Get-Real-Data"
    })
    print("GET Request sent for Forecast Data.")
    fetchPriceCallback = callback
end

-- Helper to create prompt
function CreatePrompt(systemPrompt, userContent)
    return [[<|system|>]] .. systemPrompt .. [[<|end|>
<|user|>]] .. userContent .. [[<|end|>
<|assistant|>]]
end

-- Function to process forecast data
function processForecastData(Activities)
    if next(ReceivedDataForecast) then
        local userContent = "Forecasted Data: " .. json.encode(ReceivedDataForecast) .. " | Activities: " .. Activities

        local prompt = CreatePrompt(
            "Analyse the weather data and give 2 recommendations based on the activities.",
            userContent
        )

        -- Run Llama analysis and get recommendations
        Llama.run(
            prompt,
            10,
            function(generated_text)
                if not generated_text then
                    return print("No recommendations.")
                end

                print("Recommendation: " .. generated_text)
                table.insert(RECO_HISTORY, generated_text)

                -- Notify the user that recommendations have been received
                ao.send({ Data = "Recommendation: " .. generated_text })
            end
        )
    else
        print("Forecast data not available.")
    end
end

-- Handler for fetching forecast data
Handlers.add(
    "fetchForecastData",
    Handlers.utils.hasMatchingTag("Action", "fetchForecast"),
    function(m)
        if m.Tags.Latitude and m.Tags.Longitude then
            local Latitude = m.Tags.Latitude
            local Longitude = m.Tags.Longitude

            fetchClimateForecast(function()
                print("Forecast data fetched.")
            end, Latitude, Longitude)
        end
    end
)

-- Handler for processing forecast data and prompting LLM
Handlers.add(
    "processForecastData",
    Handlers.utils.hasMatchingTag("Action", "processData"),
    function(m)
        if ReceivedDataForecast then
            local Activities = m.Tags.Activities or "No activities provided"

            processForecastData(Activities)
        else
            print("Forecast data not available.")
        end
    end
)
