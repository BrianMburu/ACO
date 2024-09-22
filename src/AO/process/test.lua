
local json = require("json")
local math = require("math")


-- Load the Llama Herder library
Llama = require("@sam/Llama-Herder")

-- Get the prices
Llama.getPrices()


function CreatePrompt(systemPrompt, userContent)
  return [[<|system|>
]] .. systemPrompt .. [[<|end|>
<|user|>
]] .. userContent .. [[<|end|>
<|assistant|>
]]
end

local userContent = "Pigs"

local prompt = CreatePrompt(
  "Tell a joke on the given topic",
  userContent
);

JOKE_HISTORY = JOKE_HISTORY or {}

Llama.run(
  prompt,                  -- Your prompt
  30,                      -- Number of tokens to generate
  function(generated_text) -- Optional: A function to handle the response
    -- Match up until the first newline character
    local joke = generated_text:match("^(.-)\n")
    if joke == nil then
      return print("Could not find joke in: " .. generated_text)
    end
    print("Joke: " .. joke)
    table.insert(JOKE_HISTORY, joke)
  end
)