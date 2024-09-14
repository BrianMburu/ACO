import axios from "axios";
import React from "react";
import {
  Button,
  Container,
  Divider,
  Grid,
  Image,
  Segment,
  MenuMenu,
  MenuItem,
  GridColumn,
  Form,
  Menu,
  Input,
  Header,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "semantic-ui-react";
import { sign } from "@othent/kms"; // Import the sign method

import { useEffect, useState } from "react";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";

const walletPage = () => {
  const permissions: PermissionType[] = [
    "ACCESS_ADDRESS",
    "SIGNATURE",
    "SIGN_TRANSACTION",
    "DISPATCH",
  ];

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case "depositAmount":
        setDepositAmount(value);
        break;
      case "withdrawAmount":
        setWithdrawAmount(value);
        break;
      default:
        break;
    }
  };
  const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";
  const USDA = "GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU";
  interface Tag {
    name: string;
    value: string;
  }

  interface Transaction {
    user: string;
    transactionid: string;
    amount: string;
    type: string;
    balance: string;
    timestamp: string;
  }
  const [address, setAddress] = useState("");
  const [aocBalance, setAocBalance] = useState(0);
  const [usdaBalance, setUsdaBalance] = useState(0);
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false);
  const [isLoadingWithdraw, setIsLoadingWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [sendSuccess, setSuccess] = useState(false);
  const [transactionlist, setTransactionDetails] = useState<Transaction[]>([]);

  function reloadPage(forceReload: boolean = false): void {
    if (forceReload) {
      // Force reload from the server
      location.href = location.href;
    } else {
      // Reload using the cache
      location.reload();
    }
  }
  const deposit = async () => {
    setIsLoadingDeposit(true);

    // Function to handle the swap and set success state
    const send = async (): Promise<void> => {
      var value = parseInt(depositAmount);
      var units = value * 1000000000000;
      var credUnits = units.toString();
      try {
        const getSwapMessage = await message({
          process: USDA,
          tags: [
            { name: "Action", value: "Transfer" },
            { name: "Recipient", value: AOC },
            { name: "Quantity", value: credUnits },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        let { Messages, Error } = await result({
          message: getSwapMessage,
          process: USDA,
        });
        if (Error) {
          alert("Error Sending USDA: " + Error);
          throw new Error(Error);
        }
        if (!Messages || Messages.length === 0) {
          alert("No messages were returned from ao. Please try later.");
          throw new Error("No messages were returned from ao.");
        }
        const actionTag = Messages[0].Tags.find(
          (tag: Tag) => tag.name === "Action"
        );
        if (actionTag.value === "Debit-Notice") {
          setSuccess(true);
        }
      } catch (error) {
        alert("There was an error sending USDA: " + error);
        throw error;
      }
    };
    try {
      // Await the send function to ensure it completes before proceeding
      await send();

      // Proceed with creating the trade only if send was successful
      const getPropMessage = await message({
        process: AOC,
        tags: [
          { name: "Action", value: "deposit" },
          {
            name: "Amount",
            value: String(parseInt(depositAmount) * 1000000000000),
          },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      let { Messages, Error } = await result({
        message: getPropMessage,
        process: AOC,
      });
      if (Error) {
        alert("Error Depositing : " + Error);
        return;
      }
      if (!Messages || Messages.length === 0) {
        alert("No messages were returned from ao. Please try later.");
        return;
      }
      alert(Messages[0].Data);
      setDepositAmount("");
    } catch (error) {
      alert("There was an error in the deposit process: " + error);
    }

    setIsLoadingDeposit(false);
    reloadPage(true);
  };

  const withdraw = async () => {
    setIsLoadingWithdraw(true);
    var value = parseInt(withdrawAmount);
    var units = value * 1000000000000;
    var credUnits = units.toString();
    try {
      // Proceed with creating the trade only if send was successful
      const getPropMessage = await message({
        process: AOC,
        tags: [
          { name: "Action", value: "withdraw" },
          {
            name: "Amount",
            value: String(credUnits),
          },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      let { Messages, Error } = await result({
        message: getPropMessage,
        process: AOC,
      });
      if (Error) {
        alert("Error Withdrawing : " + Error);
        return;
      }
      if (!Messages || Messages.length === 0) {
        alert("No messages were returned from ao. Please try later.");
        return;
      }
      alert(Messages[0].Data);
      setWithdrawAmount("");
    } catch (error) {
      alert("There was an error in the trade process: " + error);
    }
    setIsLoadingWithdraw(false);
    reloadPage(true);
  };

  useEffect(() => {
    const fetchBalanceUsda = async (process: string) => {
      try {
        const messageResponse = await message({
          process,
          tags: [{ name: "Action", value: "Balance" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });
        const getBalanceMessage = messageResponse;
        try {
          let { Messages, Error } = await result({
            message: getBalanceMessage,
            process,
          });
          if (Error) {
            alert("Error fetching balances:" + Error);
            return;
          }
          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from ao. Please try later.");
            return;
          }
          const balanceTag = Messages[0].Tags.find(
            (tag: Tag) => tag.name === "Balance"
          );
          const balance = balanceTag
            ? parseFloat((balanceTag.value / 1000000000000).toFixed(4))
            : 0;
          if (process === USDA) {
            setUsdaBalance(balance);
          }
        } catch (error) {
          alert("There was an error when loading balances: " + error);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchBalanceUsda(USDA);
  }, [address]);

  useEffect(() => {
    const fetchBalanceAoc = async (process: string) => {
      try {
        const messageResponse = await message({
          process,
          tags: [{ name: "Action", value: "Balance" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });
        const getBalanceMessage = messageResponse;
        try {
          let { Messages, Error } = await result({
            message: getBalanceMessage,
            process,
          });
          if (Error) {
            alert("Error fetching balances:" + Error);
            return;
          }
          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from ao. Please try later.");
            return;
          }
          const balanceTag = Messages[0].Tags.find(
            (tag: Tag) => tag.name === "Balance"
          );
          const balance = balanceTag
            ? parseFloat((balanceTag.value / 1000000000000).toFixed(4))
            : 0;
          if (process === AOC) {
            setAocBalance(balance);
          }
        } catch (error) {
          alert("There was an error when loading balances: " + error);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchBalanceAoc(AOC);
  }, [address]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const messageResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "view_transactions" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });
        const getProposalsMessage = messageResponse;
        try {
          let { Messages, Error } = await result({
            message: getProposalsMessage,
            process: AOC,
          });
          if (Error) {
            alert("Error fetching transactions:" + Error);
            return;
          }
          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from ao. Please try later.");
            return;
          }
          const data = JSON.parse(Messages[0].Data);
          const openTradesData = Object.entries(data).map(([name, details]) => {
            const typedDetails: Transaction = details as Transaction;
            return {
              user: typedDetails.user,
              transactionid: typedDetails.transactionid,
              amount: typedDetails.amount / 1000000000000,
              type: typedDetails.type,
              balance: typedDetails.balance / 1000000000000,
              timestamp: new Date(typedDetails.timestamp).toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false, // Use 24-hour format
                }
              ),
            };
          });
          setTransactionDetails(openTradesData);
        } catch (error) {
          alert("There was an error when loading balances: " + error);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <Container>
      <Divider />
      <Menu pointing>
        <MenuMenu position="left">
          <MenuItem>
            <Form>
              <Form.Input
                type="number"
                name="withdrawAmount"
                value={withdrawAmount}
                onChange={handleInputChange}
                icon="money"
                iconPosition="left"
                placeholder="Amount of USDA."
              />
              <Button
                secondary
                fluid
                onClick={withdraw}
                style={{ marginTop: "10px" }}
                loading={isLoadingWithdraw}
              >
                Withdraw
              </Button>
            </Form>
          </MenuItem>
        </MenuMenu>
        <MenuMenu position="right">
          <MenuItem>
            <Form>
              <Form.Input
                type="number"
                name="depositAmount"
                value={depositAmount}
                onChange={handleInputChange}
                icon="money"
                iconPosition="left"
                placeholder="Amount of USDA."
              />
              <Button
                primary
                fluid
                onClick={deposit}
                style={{ marginTop: "10px" }}
                loading={isLoadingDeposit}
              >
                Deposit.
              </Button>
            </Form>
          </MenuItem>
        </MenuMenu>
      </Menu>
      <Divider />
      <Menu pointing>
        <MenuItem>
          AoClimaOptions Balance:{" "}
          <span className="font-bold">{aocBalance}</span>
        </MenuItem>

        <MenuMenu position="right">
          <MenuItem>
            USDA Balance: <span className="font-bold"> {usdaBalance}</span>
          </MenuItem>
        </MenuMenu>
      </Menu>
      <Divider />
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment raised style={{ overflowX: "auto", maxWidth: "100%" }}>
            <Header as="h3" textAlign="center">
              Your Transaction History
            </Header>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>tId</Table.HeaderCell>
                  <Table.HeaderCell>user</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>type</Table.HeaderCell>
                  <Table.HeaderCell>Balance</Table.HeaderCell>
                  <Table.HeaderCell>Timestamp</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {transactionlist.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.transactionid}</TableCell>
                    <TableCell>{transaction.user}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.balance}</TableCell>
                    <TableCell>{transaction.timestamp}</TableCell>
                  </TableRow>
                ))}
              </Table.Body>
            </Table>
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Container>
  );
};

export default walletPage;
