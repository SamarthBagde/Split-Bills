import { DataTypes } from "sequelize";
import sequelize from "../DB/dbcConnection.js";
import bcrypt from "bcrypt";

const users = sequelize.define(
  "users",
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [3, 20],
          msg: "Name must be between 3 and 20 characters",
        },
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password cannot be empty",
        },
        len: {
          args: [8, 100],
          msg: "Password must be at least 8 characters long",
        },
      },
    },
  },
  {
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 5);
        }
      },
    },
  }
);

export default users;
