import { DataTypes } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const groups = sequelize.define(
  "groups",
  {
    groupId: {
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
          msg: "Group name must be between 3 and 20 characters",
        },
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
