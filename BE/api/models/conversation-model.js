import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Conversation = sequelize.define("conversations", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "users", key: "user_id" },
  },
  book_title: { type: DataTypes.TEXT, allowNull: true },
  chapter_id: { type: DataTypes.STRING, allowNull: true },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: "Cuộc trò chuyện mới",
  },
  is_deleted: { type: DataTypes.INTEGER, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "conversations",
  timestamps: false,
});

export default Conversation;