import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const ChapterNote = sequelize.define("ChapterNote", {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    user_id: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },
    chapter_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    start_index: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    end_index: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    selected_text: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    note_content: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
}, {
    tableName: "ChapterNotes",
    timestamps: true,
});

export default ChapterNote;