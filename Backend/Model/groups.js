import { DataTypes } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const groups = sequelize.define(
  "groups",
  {
    group_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 20],
      },
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default groups;
