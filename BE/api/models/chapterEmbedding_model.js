import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const ChapterEmbedding = sequelize.define('chapter_embeddings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chapterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'chapter_id',
        references: {
            model: 'chapters', // Tên bảng chapters trong database của bạn
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    chunkIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'chunk_index',
    },
    chunkContent: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'chunk_content',
    },
    embedding: {
        type: DataTypes.TEXT, // Tạm thời để TEXT để Sequelize tạo bảng thành công
        allowNull: true,
    },
}, {
    tableName: 'chapter_embeddings',
    timestamps: false, 
});

export default ChapterEmbedding;