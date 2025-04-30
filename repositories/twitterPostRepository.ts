import { User } from '../models/User';
import { UserSocialHandle } from '../models/UserSocialHandle';
import axios from 'axios';
import qs from 'qs';
import { TwitterTokens } from '../types/twitterAuth';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
class TwitterPostRepository {

  // Fetch user with Twitter tokens in one query
  async getUserWithTokensByUserId(userId: string): Promise<User | null> {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: UserSocialHandle,
            as: 'socialHandles' 
        }]
      });

      if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
        return null;
      }

      return user;  // Return the full user object, including tokens
    } catch (error) {
      console.error('Error in getUserWithTokensByUserId:', error);
      throw error;
    }
  }

  // Post a message on Twitter using the tokens
  async  postToTwitter(
    message: string,
    token: string,
    tokenSecret: string
  ): Promise<any> {
    try {
      const baseUrl = 'https://api.x.com/1.1/statuses/update.json';
      const urlWithParams = `${baseUrl}?status=${encodeURIComponent(message)}`;
  
      const oauth = new OAuth({
        consumer: {
          key: process.env.TWITTER_CONSUMER_KEY!,
          secret: process.env.TWITTER_CONSUMER_SECRET!,
        },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
          return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64');
        },
      });
  
      const requestData = {
        url: urlWithParams,
        method: 'POST',
      };
  
      const oauthHeaders = oauth.toHeader(
        oauth.authorize(requestData, {
          key: token,
          secret: tokenSecret,
        })
      );
  
      const response = await axios.post(urlWithParams, null, {
        headers: {
          Authorization: oauthHeaders.Authorization,
        },
      });
  
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Unknown error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }
}

export default new TwitterPostRepository();
