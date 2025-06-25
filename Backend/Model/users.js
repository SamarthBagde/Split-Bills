import { DataTypes } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const users = sequelize.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 20],
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  },
  { timestamps: false }
);

export default users;
