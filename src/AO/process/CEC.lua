local json = require('json')

WAR = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
CORE = "xLCweWomoFQvOlO9nD2zYxghAgIGljoCaeYNVCO2nhA"
DAO = "rD0J_Nv0X321WG4gYOU7dbiNNSrCLU4eT9yD1xjG3zk"

if not Balances then Balances = { [ao.id] = 0 } end
if not ArSent then ArSent = { [ao.id] = 0 } end

if Name ~= 'ClimateEducationCredits' then Name = 'ClimateEducationCredits' end
if Ticker ~= 'CEC' then Ticker = 'CEC' end
if Denomination ~= 3 then Denomination = 3 end
if not Logo then Logo = 'ITsmy1g8IC5-4GXYe_rrw-O5EEuAhJR7nRFYJUhSpVo' end

local function calcCoin(quantity, process)
  local whatToMint

  if ArSent[process] == nil then
    ArSent[process] = quantity
    whatToMint = 0.0001 + (1 - (ArSent[process] / 100000)) * ArSent[process]
  else
    local whatAlreadyMinted = 0.0001 + (1 - (ArSent[process] / 100000)) * ArSent[process]
    ArSent[process] = ArSent[process] + quantity
    local totalWhat = 0.0001 + (1 - (ArSent[process] / 100000)) * ArSent[process]
    whatToMint = totalWhat - whatAlreadyMinted
  end

  local actualWhatUnits = whatToMint * 1000

  -- Distribute 10% to DAO and 2% to CORE team
  local daoShare = actualWhatUnits * 0.10
  local coreShare = actualWhatUnits * 0.02
  local remainingUnits = actualWhatUnits - (daoShare + coreShare)

  -- Update balances
  Balances[DAO] = (Balances[DAO] or 0) + daoShare
  Balances[CORE] = (Balances[CORE] or 0) + coreShare

  return remainingUnits
end

local function validSend(quantity, process)
  if ArSent[process] == nil or ArSent[process] + quantity <= 100000 then
    return true
  else
    return false
  end
end

-- Handler for incoming messages
Handlers.add('info', Handlers.utils.hasMatchingTag('Action', 'Info'), function(m)
  ao.send({ Target = m.From, Tags = { Name = Name, Ticker = Ticker, Logo = Logo, Denomination = tostring(Denomination) } })
end)

-- Handlers for token balances and info
Handlers.add('balance', Handlers.utils.hasMatchingTag('Action', 'Balance'), function(m)
  local bal = '0'
  
  if (m.Tags.Target and Balances[m.Tags.Target]) then
    bal = tostring(Balances[m.Tags.Target])
  elseif Balances[m.From] then
    bal = tostring(Balances[m.From])
  end

  ao.send({
    Target = m.From,
    Tags = { Target = m.From, Balance = bal, Ticker = Ticker, Data = json.encode(tonumber(bal)) }
  })
end)

Handlers.add('balances', Handlers.utils.hasMatchingTag('Action', 'Balances'), function(m)
  ao.send({ Target = m.From, Data = json.encode(Balances) })
end)

-- Handler for transfers
Handlers.add('transfer', Handlers.utils.hasMatchingTag('Action', 'Transfer'), function(m)
  assert(type(m.Tags.Recipient) == 'string', 'Recipient is required!')
  assert(type(m.Tags.Quantity) == 'string', 'Quantity is required!')

  if not Balances[m.From] then Balances[m.From] = 0 end
  if not Balances[m.Tags.Recipient] then Balances[m.Tags.Recipient] = 0 end

  local qty = tonumber(m.Tags.Quantity)
  assert(type(qty) == 'number', 'qty must be number')

  if Balances[m.From] >= qty then
    Balances[m.From] = Balances[m.From] - qty
    Balances[m.Tags.Recipient] = Balances[m.Tags.Recipient] + qty

    if not m.Tags.Cast then
      ao.send({
        Target = m.From,
        Tags = { Action = 'Debit-Notice', Recipient = m.Tags.Recipient, Quantity = tostring(qty) }
      })
      ao.send({
        Target = m.Tags.Recipient,
        Tags = { Action = 'Credit-Notice', Sender = m.From, Quantity = tostring(qty) }
      })
    end
  else
    ao.send({
      Target = m.Tags.From,
      Tags = { Action = 'Transfer-Error', ['Message-Id'] = m.Id, Error = 'Insufficient Balance!' }
    })
  end
end)

-- Handler for total supply
Handlers.add('totalSupply', "Total-Supply", function(msg)
  assert(msg.From ~= ao.id, 'Cannot call Total-Supply from the same process!')

  msg.reply({
    Action = 'Total-Supply',
    Data = TotalSupply,
    Ticker = Ticker
  })
end)

-- Handler for burning tokens
Handlers.add('burn', 'Burn', function(msg)
  assert(type(msg.Quantity) == 'string', 'Quantity is required!')
  assert(bint(msg.Quantity) <= bint(Balances[msg.From]), 'Quantity must be less than or equal to the current balance!')

  Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Quantity)
  TotalSupply = utils.subtract(TotalSupply, msg.Quantity)

  msg.reply({
    Data = "Successfully burned " .. msg.Quantity
  })
end)
