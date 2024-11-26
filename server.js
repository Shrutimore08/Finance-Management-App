const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const apiRoutes = require("./routes/api");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(bodyParser.json());
app.use("/api", apiRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
