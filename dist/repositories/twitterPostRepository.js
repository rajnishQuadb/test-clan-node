"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const UserSocialHandle_1 = require("../models/UserSocialHandle");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
class TwitterPostRepository {
    // Fetch user with Twitter tokens in one query
    async getUserWithTokensByUserId(userId) {
        try {
            const user = await User_1.User.findByPk(userId, {
                include: [{ model: UserSocialHandle_1.UserSocialHandle, as: 'socialHandles' }]
            });
            if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
                return null;
            }
            return user;
        }
        catch (error) {
            console.error('Error in getUserWithTokensByUserId:', error);
            throw error;
        }
    }
    // Upload media to Twitter and return media_id
    async uploadMediaToTwitter(media, accessToken) {
        try {
            const form = new form_data_1.default();
            form.append('media', media.buffer, {
                filename: media.originalname,
                contentType: media.mimetype
            });
            const response = await axios_1.default.post('https://upload.twitter.com/1.1/media/upload.json', form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data.media_id_string;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('Error uploading media to Twitter:', error.response?.data || error.message);
                throw new Error(error.response?.data?.error || error.message);
            }
            else if (error instanceof Error) {
                console.error('Error uploading media to Twitter:', error.message);
                throw error;
            }
            else {
                console.error('Unknown error uploading media to Twitter:', error);
                throw new Error('Unknown error occurred while uploading media');
            }
        }
    }
    // Post tweet with optional media ID
    async postToTwitter(text, accessToken, refreshToken, mediaId) {
        try {
            const tweetBody = {
                text
            };
            if (mediaId) {
                tweetBody.media = {
                    media_ids: [mediaId]
                };
            }
            const response = await axios_1.default.post('https://api.twitter.com/2/tweets', tweetBody, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('Error posting tweet:', error.response?.data || error.message);
                return { error: error.response?.data || error.message };
            }
            else if (error instanceof Error) {
                console.error('Error posting tweet:', error.message);
                return { error: error.message };
            }
            else {
                console.error('Unknown error posting tweet:', error);
                return { error: 'Unknown error occurred while posting tweet' };
            }
        }
    }
}
exports.default = new TwitterPostRepository();
//# sourceMappingURL=twitterPostRepository.js.map