if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require("@babel/polyfill");

const express = require("express");
const cors = require("cors");

const router = require("./routers");
const app = express();
const bodyParser = require("body-parser");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://cms.kantiss.com",
  "http://cms.kantiss.com",
  "https://catalogue.kantiss.com",
  "http://catalogue.kantiss.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const port = 8000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server can be access in http://localhost:${port}`);
});
