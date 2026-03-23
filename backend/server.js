import dotenv from "dotenv";
dotenv.config();
import express from "express";

import cors from "cors";
import passport from "passport";
import session from "express-session";
import subscriptionsRoutes from "./routes/subscriptionsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import flatsRoutes from "./routes/flatsRoutes.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import monthlyRecordsRoutes from "./routes/monthlyRecordsRoutes.js";
import paymentEntryRoutes from "./routes/paymentEntryRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import adminProfilePageRoutes from "./routes/adminProfileRoutes.js";
import residentSubscirptionRoutes from "./routes/residentSubscriptionRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import residentProfileRoutes from "./routes/residentProfileRoutes.js";
import "./config/passport.js";
import residentDashboardRoutes from "./routes/residentDashboardRoutes.js";
import cookieParser from "cookie-parser";


const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.AUTH_SECRET || "testsecret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use("/api", authRoutes);
app.use("/api", googleAuthRoutes);
app.use("/api/flats", flatsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/monthly-records", monthlyRecordsRoutes);
app.use("/api/payment-entry", paymentEntryRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin/profile", adminProfilePageRoutes);
app.use("/api/resident-subscriptions", residentSubscirptionRoutes);
app.use("/api/dashboard", adminDashboardRoutes);
app.use("/api/resident-dashboard", residentDashboardRoutes);
app.use("/api/resident-profile", residentProfileRoutes);
app.get("/", (req, res) => {
  res.send("running");
});

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
