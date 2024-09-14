import { useNavigate } from "react-router-dom";
import {
  Grid,
  Container,
  Card,
  Image,
  Header,
  Button,
} from "semantic-ui-react";

const appsPage = () => {
  const navigate = useNavigate();

  const handleClickClimaOptions = () => {
    navigate("/aoClimaOptions");
  };
  const handleClickWeatherAgent = () => {
    navigate("/aoWeatherAgent");
  };
  return (
    <Container>
      <Header as="h2" textAlign="center" style={{ marginBottom: "40px" }}>
        Explore Our Products
      </Header>
      <Grid columns={2} padded="horizontally">
        <Grid.Row>
          <Grid.Column>
            <Card>
              <Image
                src="sunset.png"
                wrapped
                ui={false}
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Content>
                <Card.Header>AO-ClimaOptions.</Card.Header>
                <Card.Meta>Climate Binary Options Trading platform</Card.Meta>
                <Card.Description>
                  Buy Temperature based binary options.
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button primary onClick={handleClickClimaOptions}>
                  Trade
                </Button>
              </Card.Content>
            </Card>
          </Grid.Column>
          <Grid.Column>
            <Card>
              <Image
                src="weather.png"
                wrapped
                ui={false}
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Content>
                <Card.Header>AO Weather Agent</Card.Header>
                <Card.Meta>First Intelligent Weather Dapp</Card.Meta>
                <Card.Description>
                  Get The best Summarized weather intelligence on AO weather
                  Dapp.
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button primary onClick={handleClickWeatherAgent}>
                  Ao Weather Agent.
                </Button>
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default appsPage;
