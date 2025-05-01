import TwitterPostRepository from "../repositories/twitterPostRepository";
import { AppError } from '../utils/error-handler';
import axios from 'axios';
import FormData from 'form-data';
import { HTTP_STATUS } from "../constants/http-status";
import userRepository from "../repositories/userRepository";
import { Request } from 'express';
class TwitterPostService {
  // Service function to post a tweet and handle referral logic
  async postTweetAndHandleReferral(userId: string, referralCode: string, text: string, media?: Express.Multer.File) {
    try {
      // Step 1: Fetch user and Twitter tokens
      const userWithTokens = await TwitterPostRepository.getUserWithTokensByUserId(userId);
      console.log("User with tokens:", userWithTokens);
      if (!userWithTokens?.twitterAccessToken || !userWithTokens?.twitterRefreshToken) {
        throw new AppError("User or Twitter tokens not found", HTTP_STATUS.NOT_FOUND);
      }

      const { twitterAccessToken, twitterRefreshToken } = userWithTokens;

      let mediaId: string | undefined;

      // Step 2: Upload image to Twitter if media is present
      if (media) {
        mediaId = await TwitterPostRepository.uploadMediaToTwitter(media, twitterAccessToken);
        console.log("Uploaded media ID:", mediaId);
      }

      // Step 3: Post the tweet using text from payload
      const tweetResponse = await TwitterPostRepository.postToTwitter(
        text,
        twitterAccessToken,
        twitterRefreshToken,
        mediaId
      );

      console.log("Tweet response:", tweetResponse);

      if (tweetResponse.error) {
        throw new AppError("Failed to post tweet on Twitter", HTTP_STATUS.BAD_REQUEST);
      }

      // Step 4: If tweet posted and referral code exists, log referral
      if (tweetResponse?.data?.id && referralCode) {
        const referrer = await userRepository.findUserByReferralCode(referralCode);
        if (!referrer) {
          throw new AppError('Invalid referral code', HTTP_STATUS.BAD_REQUEST);
        }

        await userRepository.createReferral({
          referrerUserId: referrer.userId,
          referredUserId: userId,
          referralCode,
          joinedAt: new Date(),
          rewardGiven: false,
          tweetId: tweetResponse.data.id
        });
      }

      return { tweetResponse, referralCode };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error posting tweet and processing referral:", error);
        throw new AppError(error.message || "Internal Server Error", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      } else {
        console.error("Unknown error occurred:", error);
        throw new AppError("An unknown error occurred", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    }
  }
}


export default new TwitterPostService();
