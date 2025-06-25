import "dotenv/config";

import app from "./app.js";
import sequelize from "./DB/dbcConnection.js";

sequelize
  .sync()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Error while connecting to db", err.name, err.message);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server started at localhost:${process.env.PORT}`);
});
