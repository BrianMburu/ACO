import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Container,
  Header,
  Button,
  Menu,
  Divider,
} from "semantic-ui-react";

const HomePage = () => {
  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        paddingTop: "50px",
      }}
    >
      <Container>
        {/* Main Header Section */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <Header
            as="h1"
            style={{ fontSize: "3.5em", fontWeight: "700", color: "#1f2937" }}
          >
            Tackling Climate Change with{" "}
            <span style={{ color: "#10b981" }}>Decentralized Intelligence</span>
          </Header>
          <Header
            as="h3"
            style={{ fontSize: "1.6em", marginTop: "20px", color: "#4b5563" }}
          >
            Empowering communities to take action on climate risks while
            protecting your privacy.
          </Header>
          <Button
            primary
            size="large"
            style={{
              marginTop: "30px",
              backgroundColor: "#10b981",
              borderColor: "#10b981",
              padding: "15px 30px",
              fontSize: "1.2em",
            }}
            onMouseOver={(e: {
              target: { style: { backgroundColor: string } };
            }) => (e.target.style.backgroundColor = "#059669")}
            onMouseOut={(e: {
              target: { style: { backgroundColor: string } };
            }) => (e.target.style.backgroundColor = "#10b981")}
          >
            Learn More
          </Button>
        </div>

        <Divider style={{ margin: "50px 0" }} />

        {/* Problem Section */}
        <Grid.Column style={{ marginBottom: "40px", padding: "0 20px" }}>
          <Header
            as="h2"
            style={{
              color: "#1f2937",
              fontSize: "2.5em",
              marginBottom: "10px",
            }}
          >
            The Problem
          </Header>
          <p style={{ fontSize: "1.2em", lineHeight: "1.8", color: "#6b7280" }}>
            Centralized weather markets and privacy-invading weather apps are
            exploiting user data while overlooking the true potential of climate
            data to help mitigate climate change. Over $12 trillion dollars in
            climate losses are estimated in the next 26 years.
          </p>
        </Grid.Column>

        {/* Solution Section */}
        <Grid.Column style={{ marginBottom: "40px", padding: "0 20px" }}>
          <Header
            as="h2"
            style={{
              color: "#1f2937",
              fontSize: "2.5em",
              marginBottom: "10px",
            }}
          >
            Our Solution
          </Header>
          <p style={{ fontSize: "1.2em", lineHeight: "1.8", color: "#6b7280" }}>
            AoClimOptions is a decentralized weather market that allows you to
            trade temperature-based binary options. With the AO Weather Agent,
            powered by AI, we provide climate insights while keeping your data
            private.
          </p>
        </Grid.Column>

        <Divider style={{ margin: "50px 0" }} />

        {/* Footer Menu Section */}
        <Menu
          text
          stackable
          style={{ textAlign: "center", justifyContent: "center" }}
        >
          <Menu.Item
            header
            style={{ color: "#1f2937", fontSize: "1.4em", marginRight: "30px" }}
          >
            Notus DAO
          </Menu.Item>
          <Menu.Item>
            <Button
              href="https://x.com/NotusOptions"
              content="Twitter"
              icon="twitter"
              labelPosition="right"
              style={{ backgroundColor: "#1da1f2", color: "white" }}
            />
          </Menu.Item>
          <Menu.Item>
            <Button
              href="https://github.com/kimtony123/NEO"
              content="GitHub"
              icon="github"
              labelPosition="left"
              style={{ backgroundColor: "#333", color: "white" }}
            />
          </Menu.Item>
        </Menu>
      </Container>
    </div>
  );
};

export default HomePage;
