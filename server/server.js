import express from "express";
import cors from "cors";   // ✅ ADD THIS
import universityRoutes from "./routes/university.routes.js";
import abaccoRoutes from "./routes/abacco.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import accessControlRoutes from "./routes/access_control.routes.js";
import idCardRoutes from "./routes/idcard.routes.js";

const app = express();

// ✅ ENABLE CORS
app.use(
  cors({
    origin: "https://school-analytics-e72s.onrender.com", // your frontend
    // origin: "http://localhost:5174", // your frontend
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is live");
});
app.use("/api/universities", universityRoutes);
app.use("/api/abacco", abaccoRoutes);
app.use("/api/payments", paymentRoutes);
app.use(
  "/api/dashboard",
  dashboardRoutes
);
app.use("/api/access-control", accessControlRoutes);
app.use("/api/id-cards", idCardRoutes);


app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});
