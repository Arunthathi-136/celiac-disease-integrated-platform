require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
const routes   = require("./routes");

const app  = express();
const PORT = process.env.PORT || 5000;
const URI  = process.env.MONGODB_URI || "mongodb://localhost:27017/celiac_db";

app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use((_, res) => res.status(404).json({ error: "Not found" }));

mongoose.connect(URI)
  .then(() => {
    console.log("✅  MongoDB connected:", URI);
    app.listen(PORT, () => console.log(`🚀  Backend running → http://localhost:${PORT}`));
  })
  .catch((e) => { console.error("❌  DB Error:", e.message); process.exit(1); });
