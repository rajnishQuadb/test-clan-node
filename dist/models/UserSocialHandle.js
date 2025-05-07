"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSocialHandle = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class UserSocialHandle extends sequelize_1.Model {
}
exports.UserSocialHandle = UserSocialHandle;
// Initialize UserSocialHandle model
UserSocialHandle.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users', // Uppercase table name
            key: 'userId'
        },
        onDelete: 'CASCADE'
    },
    provider: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    socialId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    displayName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    profilePicture: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: db_1.default,
    tableName: 'User_Social_Handles', // Matching your format
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { unique: true, fields: ['provider', 'socialId'] }
    ]
});
exports.default = UserSocialHandle;
//# sourceMappingURL=UserSocialHandle.js.map