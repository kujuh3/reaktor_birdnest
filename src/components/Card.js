import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

export default function PilotCard({ data }) {
  const randomBg = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };

  return (
    <Card sx={{ display: "flex", border: "1px solid #ffa700", boxShadow: "1px 1px 4px #ffa700"  }}>
      <Box sx={{ display: "flex", flexDirection: "column", margin: "auto"}}>
        <CardContent sx={{ flex: "1 1 auto" }}>
          <Typography component="div" variant="h5">
            {data.firstName} {data.lastName}
          </Typography>
          <div style={{ textAlign: "left" }}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              Email:{" "}
              <a style={{ color: "black", fontWeight: "bold" }}>{data.email}</a>
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              Phonenumber:{" "}
              <a style={{ color: "black", fontWeight: "bold" }}>
                {data.phoneNumber}
              </a>
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              Nearest confirmed distance:{" "}
              <a style={{ color: "black", fontWeight: "bold" }}>
                {Math.round(data.distance * 100) / 100} meters
              </a>
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              Last seen:{" "}
              <a style={{ color: "black", fontWeight: "bold" }}>
                {new Date(data.timeStamp).toLocaleString()}
              </a>
            </Typography>
          </div>
        </CardContent>
      </Box>
    </Card>
  );
}
