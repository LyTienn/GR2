import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const ConversationMessage = sequelize.define("conversation_messages", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "conversations", key: "id" },
  },
  role: {
    type: DataTypes.ENUM("user", "ai"),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "conversation_messages",
  timestamps: false,
});

export default ConversationMessage;