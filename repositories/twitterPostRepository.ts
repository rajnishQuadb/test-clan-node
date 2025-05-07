import { User } from '../models/User';
import { UserSocialHandle } from '../models/UserSocialHandle';
import axios from 'axios';
import FormData from 'form-data';

class TwitterPostRepository {
  // Fetch user with Twitter tokens in one query
  async getUserWithTokensByUserId(userId: string): Promise<User | null> {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: UserSocialHandle, as: 'socialHandles' }]
      });

      if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error in getUserWithTokensByUserId:', error);
      throw error;
    }
  }

  // Upload media to Twitter and return media_id
  async uploadMediaToTwitter(
    media: Express.Multer.File,
    accessToken: string
  ): Promise<string> {
    try {
      if (!media || !media.buffer || !media.originalname || !media.mimetype) {
        throw new Error("Invalid media file provided");
      }
  
      const form = new FormData();
      form.append('media', media.buffer, {
        filename: media.originalname,
        contentType: media.mimetype
      });

      const response = await axios.post(
        'https://api.twitter.com/2/media/upload',
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data.media_id_string;
    }catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('Error uploading media to Twitter:', error.response?.data || error.message);
          throw new Error(error.response?.data?.error || error.message);
        } else if (error instanceof Error) {
          console.error('Error uploading media to Twitter:', error.message);
          throw error;
        } else {
          console.error('Unknown error uploading media to Twitter:', error);
          throw new Error('Unknown error occurred while uploading media');
        }
      }
  }

  // Post tweet with optional media ID
  async postToTwitter(
    text: string,
    accessToken: string,
    refreshToken: string,
    mediaId?: string
  ): Promise<any> {
    try {
      const tweetBody: any = {
        text
      };

      if (mediaId) {
        tweetBody.media = {
          media_ids: [mediaId]
        };
      }

      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        tweetBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('Error posting tweet:', error.response?.data || error.message);
          return { error: error.response?.data || error.message };
        } else if (error instanceof Error) {
          console.error('Error posting tweet:', error.message);
          return { error: error.message };
        } else {
          console.error('Unknown error posting tweet:', error);
          return { error: 'Unknown error occurred while posting tweet' };
        }
      }
      
  }
}

export default new TwitterPostRepository();
