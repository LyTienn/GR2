import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const CommentReaction = sequelize.define(
  "CommentReaction",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    comment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("LIKE", "DISLIKE"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "comment_reactions",
    timestamps: false,
    underscored: true,
  }
);

export default CommentReaction;