require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(morgan("dev"));

// ✅ CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://192.168.10.112:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.options("*", cors());

app.use(express.json());

// ✅ health check
app.get("/", (req, res) => {
  res.send("Backend running");
});

// ✅ routes 연결
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT} [${process.env.NODE_ENV}]`);
});