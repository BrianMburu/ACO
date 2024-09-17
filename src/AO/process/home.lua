local json = require("json")
local math = require("math")




-- Function to deposit funds
function deposit(user, amount)
    balances[user] = (balances[user] or 0) + amount
    print(user .. " deposited " .. amount .. ". New balance: " .. balances[user])
end


-- Function to withdraw funds
function withdraw(user, amount)
    -- Check if the user has a balance and if it is sufficient
    if balances[user] and balances[user] > 0 then
        if balances[user] >= amount then
            -- Deduct the amount from the user's balance
            balances[user] = balances[user] - amount
            print(user .. " withdrew " .. amount .. ". New balance: " .. balances[user])

            -- Send confirmation message to the user
            ao.send({
                Target = user,
                Data = "Successfully Withdrawn. New balance: " .. balances[user] / 1000000000000
            })

            return true -- Withdrawal successful
        else
            print("Insufficient balance for " .. user)
            ao.send({
                Target = user,
                Data = "Insufficient balance. Current balance: " .. balances[user] / 1000000000000
            })
            return false -- Withdrawal failed due to insufficient funds
        end
    else
        -- Handle the case where the user has no balance or a balance of 0
        print("Insufficient balance for " .. user)
        ao.send({
            Target = user,
            Data = "Insufficient balance. Current balance: 0"
        })
        return false -- Withdrawal failed due to 0 balance
    end
end


-- Handler for withdrawal
Handlers.add(
    "withdraw",
    Handlers.utils.hasMatchingTag("Action", "withdraw"),
    function(m)
        if m.Tags.Amount then
            local user = m.From
            local amount = tonumber(m.Tags.Amount)
            local success = withdraw(user, amount)
            
            if success then
                -- Only send transfer if withdrawal was successful
                ao.send({
                    Target = USDA,
                    Action = "Transfer",
                    Quantity = tostring(amount),
                    Recipient = tostring(m.From)
                })
                currentTime = getCurrentTime(m)
                local transactionId = generateTransactionId()
                -- Record the transaction
                table.insert(transactions, {
                    user = user,
                    transactionid = transactionId,
                    type = "withdrawal",
                    amount = amount,
                    balance = balances[user],
                    timestamp = currentTime
                })
            else
                ao.send({ Target = m.From, Data = "Withdrawal failed due to insufficient funds. Current balance: " .. balances[user]/1000000000000 })
            end
        end  
    end
)

Handlers.add('balance', Handlers.utils.hasMatchingTag('Action', 'Balance'), function(m)
    local bal = '0'
    
    -- If not Target is provided, then return the Senders balance
    if (m.Tags.Target and balances[m.Tags.Target]) then
        bal = tostring(balances[m.Tags.Target])
    elseif balances[m.From] then
        bal = tostring(balances[m.From])
    end
    
    ao.send({
        Target = m.From,
        Tags = { Target = m.From, Balance = bal, Ticker = Ticker, Data = json.encode(tonumber(bal)) }
    })
    end)
