import express from "express";
import { errorHandler } from "./Middlerwares/errorHandler.js";
import { AppError } from "./Utils/appError.js";
import userRouter from "./Routes/userRouter.js";
import groupRouter from "./Routes/groupRouter.js";
import expenseRouter from "./Routes/expenseRouter.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/group", groupRouter);
app.use("/api/expense", expenseRouter);

app.all("*unknown", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.method} ${req.originalUrl} on this server!`,
      404
    )
  );
});

app.use(errorHandler);
export default app;
