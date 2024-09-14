import React from "react";
import axios from "axios";
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
} from "semantic-ui-react";

import { useEffect, useState } from "react";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";
import useCronTick from "./useCronTick";

const aoClimaOptions = () => {
  const permissions: PermissionType[] = [
    "ACCESS_ADDRESS",
    "SIGNATURE",
    "SIGN_TRANSACTION",
    "DISPATCH",
  ];

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case "betAmountCall":
        setBetAmountCall(value);
        break;
      case "betAmountPut":
        setBetAmountPut(value);
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

  interface WeatherDataProps {
    name: string;
    id: number;
    dt: number;

    main: {
      temp: number;
    };
    sys: {
      country: string;
    };
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
  const api_key = "a2f4db644e9107746535b0d2ca43b85d";
  const api_Endpoint = "https://api.openweathermap.org/data/2.5/";

  const [weatherData, setWeatherData] = React.useState<WeatherDataProps | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [address, setAddress] = useState("");
  const [aocBalance, setAocBalance] = useState(0);
  const [betAmountCall, setBetAmountCall] = useState("");
  const [betAmountPut, setBetAmountPut] = useState("");
  const [isLoadingCall, setIsLoadingCall] = useState(false);
  const [isLoadingPut, setIsLoadingPut] = useState(false);
  const [searchCity, setSearchCity] = React.useState("");

  const fetchCurrentWeather = React.useCallback(
    async (lat: number, lon: number) => {
      const url = `${api_Endpoint}weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
      const response = await axios.get(url);
      return response.data;
    },
    [api_Endpoint, api_key]
  );

  const fetchWeatherData = async (city: string) => {
    try {
      const url = `${api_Endpoint}weather?q=${city}&appid=${api_key}&units=metric`;
      const searchResponse = await axios.get(url);

      const currentWeatherData: WeatherDataProps = searchResponse.data;
      return { currentWeatherData };
    } catch (error) {
      throw error;
    }
  };
  const handleSearch = async () => {
    if (searchCity.trim() === "") {
      return;
    }

    try {
      const { currentWeatherData } = await fetchWeatherData(searchCity);
      setWeatherData(currentWeatherData);
    } catch (error) {}
  };

  function reloadPage(forceReload: boolean = false): void {
    if (forceReload) {
      // Force reload from the server
      location.href = location.href;
    } else {
      // Reload using the cache
      location.reload();
    }
  }

  React.useEffect(() => {
    const fetchData = async () => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const [currentWeather] = await Promise.all([
          fetchCurrentWeather(latitude, longitude),
        ]);
        setWeatherData(currentWeather);
        setIsLoading(true);
      });
    };

    fetchData();
  }, [fetchCurrentWeather]);

  const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const tradeCall = async () => {
    setIsLoadingCall(true);
    // Function to handle the swap and set success state
    var value = parseInt(betAmountCall);
    var units = value * 1000000000000;
    var credUnits = units.toString();
    try {
      // Proceed with creating the trade only if send was successful
      const getPropMessage = await message({
        process: AOC,

        tags: [
          { name: "Action", value: "trade" },
          { name: "TradeId", value: String(randomInt(1, 1000000000)) },
          { name: "Country", value: String(weatherData?.sys.country!) },
          { name: "City", value: String(weatherData?.name!) },
          { name: "CountryId", value: String(weatherData?.id!) },
          { name: "CurrentTemp", value: String(weatherData?.main.temp) },
          { name: "CreatedTime", value: String(weatherData?.dt) },
          { name: "ContractType", value: "Call" },
          { name: "ContractStatus", value: "Open" },
          {
            name: "BetAmount",
            value: credUnits,
          },
          { name: "Payout", value: String(1.5) },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      let { Messages, Error } = await result({
        message: getPropMessage,
        process: AOC,
      });
      if (Error) {
        alert("Error trading : " + Error);
        return;
      }
      if (!Messages || Messages.length === 0) {
        alert("No messages were returned from ao. Please try later.");
        return;
      }
      alert(Messages[0].Data);
      setBetAmountCall("");
    } catch (error) {
      alert("There was an error in the trade process: " + error);
    }

    setIsLoadingCall(false);
    reloadPage(true);
  };

  const tradePut = async () => {
    setIsLoadingPut(true);
    var value = parseInt(betAmountPut);
    var units = value * 1000000000000;
    var credUnits = units.toString();
    // Function to handle the swap and set success state
    try {
      // Proceed with creating the trade only if send was successful
      const getPropMessage = await message({
        process: AOC,
        tags: [
          { name: "Action", value: "trade" },
          { name: "TradeId", value: String(randomInt(1, 1000000000)) },
          { name: "Country", value: String(weatherData?.sys.country!) },
          { name: "City", value: String(weatherData?.name!) },
          { name: "CountryId", value: String(weatherData?.id!) },
          { name: "CurrentTemp", value: String(weatherData?.main.temp) },
          { name: "ContractType", value: "Put" },
          { name: "CreatedTime", value: String(Date.now()) },
          { name: "ContractStatus", value: "Open" },
          {
            name: "BetAmount",
            value: credUnits,
          },
          { name: "Payout", value: String(1.5) },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      let { Messages, Error } = await result({
        message: getPropMessage,
        process: AOC,
      });
      if (Error) {
        alert("Error trading : " + Error);
        return;
      }
      if (!Messages || Messages.length === 0) {
        alert("No messages were returned from ao. Please try later.");
        return;
      }
      alert(Messages[0].Data);
      setBetAmountPut("");
    } catch (error) {
      alert("There was an error in the trade process: " + error);
    }
    setIsLoadingPut(false);
    reloadPage(true);
  };

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
  useCronTick(AOC);
  return (
    <Container>
      <Divider />
      <Menu pointing>
        <MenuItem>
          AoClimaOptions Balance:{" "}
          <span className="font-bold">{aocBalance}</span>
        </MenuItem>
        <MenuMenu position="right">
          <MenuItem>
            <Input
              placeholder="Enter Location"
              value={searchCity}
              type="text"
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <Button primary size="mini" onClick={handleSearch}>
              search
            </Button>
          </MenuItem>
        </MenuMenu>
      </Menu>
      {weatherData && isLoading ? (
        <>
          <Grid columns="equal">
            <GridColumn>
              <Form size="large">
                <Segment stacked>
                  <Image src="sunset.png" wrapped ui={false} />
                  <Divider />
                  <span>Country : {weatherData.sys.country}</span>
                  <Divider />
                  <span>CountryId : {weatherData.id}</span>
                  <Divider />
                  <span>City : {weatherData.name}</span>
                  <Divider />

                  <span> Current Temp : {weatherData.main.temp}</span>
                  <Divider />
                  <span>Current Time : {weatherData.dt}</span>
                  <Divider />
                  <span>Minimum Trade Amount is 0.5 USDA</span>
                  <Divider />
                  <Form.Input
                    type="number"
                    name="betAmountCall"
                    value={betAmountCall}
                    onChange={handleInputChange}
                    icon="money"
                    iconPosition="left"
                    placeholder="Amount of USDA."
                  />
                  <Divider />
                  <Button
                    onClick={tradeCall}
                    color="teal"
                    position="left"
                    fluid
                    size="small"
                    loading={isLoadingCall}
                  >
                    Call.
                  </Button>
                </Segment>
              </Form>
            </GridColumn>
            <GridColumn>
              <Form size="large">
                <Segment stacked>
                  <Image src="sunset.png" wrapped ui={false} />
                  <Divider />
                  <span>Country : {weatherData.sys.country}</span>
                  <Divider />
                  <span>CountryId : {weatherData.id}</span>
                  <Divider />
                  <span>City : {weatherData.name}</span>
                  <Divider />

                  <span> Current Temp : {weatherData.main.temp}</span>
                  <Divider />
                  <span>Current Time : {weatherData.dt}</span>
                  <Divider />
                  <span>Minimum Trade Amount is 0.5 USDA</span>
                  <Divider />
                  <Form.Input
                    type="number"
                    name="betAmountPut"
                    value={betAmountPut}
                    onChange={handleInputChange}
                    icon="money"
                    iconPosition="left"
                    placeholder="Amount of USDA."
                  />
                  <Divider />
                  <Button
                    onClick={tradePut}
                    fluid
                    size="small"
                    color="red"
                    position="right"
                    loading={isLoadingPut}
                  >
                    Put.
                  </Button>
                </Segment>
              </Form>
            </GridColumn>
          </Grid>
        </>
      ) : (
        <div className="loading">
          <h3>Fetching data</h3>
        </div>
      )}
    </Container>
  );
};

export default aoClimaOptions;
