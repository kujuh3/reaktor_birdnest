import "./App.css";
import React, { useEffect, useState } from "react";
import { fetchData } from "./handles/fetch";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import PilotCard from "./components/Card";
import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

function App() {
  const [drones, setDrones] = useState();

  //UseEffect to initiate the fetch and interval of 2000ms to fetch every 2 seconds.
  useEffect(() => {
    setInterval(() => {
      fetchData("/drones")
        .then((body) => {
          return body.json();
        })
        .then((res) => {
          setDrones(res);
        });
    }, 2000);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {drones ? (
          <>
            <Typography variant="h3">Reaktor Birdnest</Typography>
            <Typography variant="body1">
              Drones in no-fly zone, past 10 minutes:{" "}
              <a style={{ color: "red", fontWeight: "bold" }}>
                {drones.length}
              </a>
            </Typography>
            <Container maxWidth="xl">
              <Box sx={{ flexGrow: 1, padding: "20px" }}>
                <Grid
                  container
                  spacing={{ xs: 2, md: 3 }}
                  columns={{ xs: 4, sm: 8, md: 12 }}
                >
                  {" "}
                  {drones.map((drone, idx) => {
                    return (
                      //Can't give keys to null fragments, have to use the long name.
                      <React.Fragment key={idx}>
                        <Grid item xs={2} sm={4} md={4}>
                          <PilotCard data={drone} />
                        </Grid>
                      </React.Fragment>
                    );
                  })}
                </Grid>
              </Box>
            </Container>
          </>
        ) : (
          <>
            <CircularProgress />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
