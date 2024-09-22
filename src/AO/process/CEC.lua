local json = require('json')

WAR = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"

if not Balances then Balances = { [ao.id] = 21,000,000,000 } end


if Name ~= 'ClimateEducationCredits' then Name = 'ClimateEducationCredits' end

if Ticker ~= 'CEC' then Ticker = 'CEC' end

if Denomination ~= 3 then Denomination = 3 end

if not Logo then Logo = 'OVJ2EyD3dKFctzANd0KX_PCgg8IQvk0zYqkWIj-aeaU' end



Handlers.add('mint', Handlers.utils.hasMatchingTag('Action', 'Mint'), function(msg, env)
  assert(type(msg.Tags.Quantity) == 'string', 'Quantity is required!')

  if msg.From == env.Process.Id then
    -- Add tokens to the token pool, according to Quantity
    local qty = tonumber(msg.Tags.Quantity)
    Balances[env.Process.Id] = Balances[env.Process.Id] + qty
  else
    ao.send({
      Target = msg.Tags.From,
      Tags = {
        Action = 'Mint-Error',
        ['Message-Id'] = msg.Id,
        Error = 'Only the Process Owner can mint new ' .. Ticker .. ' tokens!'
      }
    })
  end
end)

-- Handler for incoming messages

Handlers.add('info', Handlers.utils.hasMatchingTag('Action', 'Info'), function(m)
    ao.send(
        { Target = m.From, Tags = { Name = Name, Ticker = Ticker, Logo = Logo, Denomination = tostring(Denomination) } })
    end)

-- Handlers for token balances and info

Handlers.add('balance', Handlers.utils.hasMatchingTag('Action', 'Balance'), function(m)
    local bal = '0'
    
    -- If not Target is provided, then return the Senders balance
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
    
Handlers.add('balances', Handlers.utils.hasMatchingTag('Action', 'Balances'),
    function(m) ao.send({ Target = m.From, Data = json.encode(Balances) }) end)

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

      --[[
        Only Send the notifications to the Sender and Recipient
        if the Cast tag is not set on the Transfer message
      ]] --
      if not m.Tags.Cast then
        -- Send Debit-Notice to the Sender
        ao.send({
          Target = m.From,
          Tags = { Action = 'Debit-Notice', Recipient = m.Tags.Recipient, Quantity = tostring(qty) }
        })
        -- Send Credit-Notice to the Recipient
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
  
--[[
     Total Supply
   ]]
--
Handlers.add('totalSupply', "Total-Supply", function(msg)
  assert(msg.From ~= ao.id, 'Cannot call Total-Supply from the same process!')

  msg.reply({
    Action = 'Total-Supply',
    Data = TotalSupply,
    Ticker = Ticker
  })
end)

Handlers.add('burn', 'Burn', function(msg)
  assert(type(msg.Quantity) == 'string', 'Quantity is required!')
  assert(bint(msg.Quantity) <= bint(Balances[msg.From]), 'Quantity must be less than or equal to the current balance!')

  Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Quantity)
  TotalSupply = utils.subtract(TotalSupply, msg.Quantity)

  msg.reply({
    Data = Colors.gray .. "Successfully burned " .. Colors.blue .. msg.Quantity .. Colors.reset
  })
end)