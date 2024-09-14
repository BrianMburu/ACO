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
  Card,
} from "semantic-ui-react";
import { sign } from "@othent/kms"; // Import the sign method

import { useEffect, useState } from "react";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";

const tradingPage = () => {
  interface Tag {
    name: string;
    value: string;
  }
  interface TradeDetails {
    UserId: string;
    TradeId: number;
    BetAmount: number;
    Outcome: string;
    ContractType: string;
    Country: string;
    CurrentTemp: string;
    ContractStatus: string;
    CountryId: string;
    ContractExpiry: string;
    CreatedTime: string;
    ClosingTemp: number;
    ClosingTime: string;
    Payout: number;
    City: string;
  }

  interface Trade {
    UserId: string;
    TradeId: number;
    BetAmount: number;
    ContractType: string;
    Outcome: string;
    Country: string;
    CurrentTemp: string;
    ContractStatus: string;
    CountryId: string;
    ContractExpiry: string;
    CreatedTime: string;
    ClosingTemp: number;
    ClosingTime: string;
    Payout: number;
    City: string;
  }

  const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";
  const [opentrades, setOpenTrades] = useState<Trade[]>([]);
  const [closedtrades, setClosedTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const fetchOpenTrades = async () => {
      try {
        const messageResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "openTrades" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });
        const getProposalsMessage = messageResponse;
        try {
          let { Messages, Error } = await result({
            message: getProposalsMessage,
            process: AOC,
          });
          if (Error) {
            alert("Error fetching proposals:" + Error);
            return;
          }
          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from ao. Please try later.");
            return;
          }
          const data = JSON.parse(Messages[0].Data);
          const openTradesData = Object.entries(data).map(([name, details]) => {
            const typedDetails: TradeDetails = details as TradeDetails;
            return {
              name,
              BetAmount: typedDetails.BetAmount / 1000000000000,
              ContractType: typedDetails.ContractType,
              ContractExpiry: new Date(
                typedDetails.ContractExpiry
              ).toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // Use 24-hour format
              }),
              CreatedTime: new Date(typedDetails.CreatedTime).toLocaleString(
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
              Country: typedDetails.Country,
              City: typedDetails.City,
              CurrentTemp: typedDetails.CurrentTemp,
              ContractStatus: typedDetails.ContractStatus,
              TradeId: typedDetails.TradeId,
              ClosingTime: typedDetails.ClosingTime
                ? new Date(typedDetails.ClosingTime).toLocaleString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "Pending",
              ClosingTemp: typedDetails.ClosingTemp,
              Payout: typedDetails.Payout,
              UserId: typedDetails.UserId,
              Outcome: typedDetails.Outcome,
            };
          });
          setOpenTrades(openTradesData);
        } catch (error) {
          alert("There was an error when loading balances: " + error);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchOpenTrades();
  }, []);

  useEffect(() => {
    const fetchClosedTrades = async () => {
      try {
        const messageResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "closedTrades" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });
        const getProposalsMessage = messageResponse;
        try {
          let { Messages, Error } = await result({
            message: getProposalsMessage,
            process: AOC,
          });
          if (Error) {
            alert("Error fetching proposals:" + Error);
            return;
          }
          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from ao. Please try later.");
            return;
          }
          const data = JSON.parse(Messages[0].Data);
          const closedTradesData = Object.entries(data).map(
            ([name, details]) => {
              const typedDetails: TradeDetails = details as TradeDetails;
              return {
                Country: typedDetails.Country,
                City: typedDetails.City,
                CurrentTemp: typedDetails.CurrentTemp,
                ContractStatus: typedDetails.ContractStatus,
                CountryId: typedDetails.CountryId,
                TradeId: typedDetails.TradeId,
                Outcome: typedDetails.Outcome,
                name,
                BetAmount: typedDetails.BetAmount / 1000000000000,
                ContractType: typedDetails.ContractType,
                ContractExpiry: new Date(
                  typedDetails.ContractExpiry
                ).toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false, // Use 24-hour format
                }),
                CreatedTime: new Date(typedDetails.CreatedTime).toLocaleString(
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
                ClosingTime: typedDetails.ClosingTime
                  ? new Date(typedDetails.ClosingTime).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "Pending",
                ClosingTemp: typedDetails.ClosingTemp,
                Payout: typedDetails.Payout,
                UserId: typedDetails.UserId,
              };
            }
          );
          setClosedTrades(closedTradesData);
        } catch (error) {
          alert("There was an error when loading balances: " + error);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchClosedTrades();
  }, []);
  return (
    <Container>
      <Header as="h2" textAlign="center" style={{ marginBottom: "40px" }}>
        Trade History.
      </Header>
      <Divider />
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment raised style={{ overflowX: "auto", maxWidth: "100%" }}>
            <Header as="h2" color="teal" textAlign="center">
              <Image src="/Aco-logo.svg" alt="logo" /> Open Trades.
            </Header>
            <Table celled>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ProcessId</TableHeaderCell>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell>City</TableHeaderCell>
                  <TableHeaderCell>Bought Temp.</TableHeaderCell>
                  <TableHeaderCell>Contract Type</TableHeaderCell>
                  <TableHeaderCell>Trade Amount</TableHeaderCell>
                  <TableHeaderCell>Created Time</TableHeaderCell>
                  <TableHeaderCell>Contract Expiry</TableHeaderCell>
                  <TableHeaderCell>Contract Status</TableHeaderCell>
                  <TableHeaderCell>Closing Time</TableHeaderCell>
                  <TableHeaderCell>
                    Real-World-Data Powered by Orbit
                    <Image src="/orbit.png" />
                  </TableHeaderCell>
                  <TableHeaderCell>Payout</TableHeaderCell>
                  <TableHeaderCell>Outcome</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opentrades.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell>{trade.UserId}</TableCell>
                    <TableCell>{trade.Country}</TableCell>
                    <TableCell>{trade.City}</TableCell>
                    <TableCell>{trade.CurrentTemp}</TableCell>
                    <TableCell>{trade.ContractType}</TableCell>
                    <TableCell>{trade.BetAmount}</TableCell>
                    <TableCell>{trade.CreatedTime}</TableCell>
                    <TableCell> {trade.ContractExpiry}</TableCell>
                    <TableCell>{trade.ContractStatus}</TableCell>
                    <TableCell>{trade.ClosingTime}</TableCell>
                    <TableCell>{trade.ClosingTemp}</TableCell>
                    <TableCell>{trade.Payout}</TableCell>
                    <TableCell>{trade.Outcome}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Segment>
        </Grid.Column>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment raised style={{ overflowX: "auto", maxWidth: "100%" }}>
            <Header as="h2" color="teal" textAlign="center">
              Closed Trades.
            </Header>
            <Table celled>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ProcessId</TableHeaderCell>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell>City</TableHeaderCell>
                  <TableHeaderCell>Bought Temp.</TableHeaderCell>
                  <TableHeaderCell>Contract Type</TableHeaderCell>
                  <TableHeaderCell>Trade Amount</TableHeaderCell>
                  <TableHeaderCell>Created Time</TableHeaderCell>
                  <TableHeaderCell>Contract Expiry</TableHeaderCell>
                  <TableHeaderCell>Contract Status</TableHeaderCell>
                  <TableHeaderCell>Closing Time</TableHeaderCell>
                  <TableHeaderCell>
                    Real world Data Powered by Orbit
                    <Image src="/orbit.png" />
                  </TableHeaderCell>
                  <TableHeaderCell>Payout</TableHeaderCell>
                  <TableHeaderCell>Outcome</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closedtrades.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell>{trade.UserId}</TableCell>
                    <TableCell>{trade.Country}</TableCell>
                    <TableCell>{trade.City}</TableCell>
                    <TableCell>{trade.CurrentTemp}</TableCell>
                    <TableCell>{trade.ContractType}</TableCell>
                    <TableCell>{trade.BetAmount}</TableCell>
                    <TableCell>{trade.CreatedTime}</TableCell>
                    <TableCell> {trade.ContractExpiry}</TableCell>
                    <TableCell>{trade.ContractStatus}</TableCell>
                    <TableCell>{trade.ClosingTime}</TableCell>
                    <TableCell>{trade.ClosingTemp}</TableCell>
                    <TableCell>{trade.Payout}</TableCell>
                    <TableCell>{trade.Outcome}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Container>
  );
};

export default tradingPage;
