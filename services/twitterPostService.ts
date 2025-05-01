import TwitterPostRepository from "../repositories/twitterPostRepository";
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from "../constants/http-status";
import userRepository from "../repositories/userRepository";

class TwitterPostService {
  // Service function to post a tweet and handle referral logic
  async postTweetAndHandleReferral(userId: string, referralCode: string) {
    try {
      // Step 1: Fetch user and Twitter tokens in one query
      const userWithTokens = await TwitterPostRepository.getUserWithTokensByUserId(userId);
console.log("User with tokens:", userWithTokens);
      if (!userWithTokens || !userWithTokens.twitterAccessToken || !userWithTokens.twitterRefreshToken) {
        throw new AppError("User or Twitter tokens not found", HTTP_STATUS.NOT_FOUND);
      }

      const { twitterAccessToken, twitterRefreshToken } = userWithTokens;
      const tweetContent = `User ${userId} has posted using referral code ${referralCode}`;

      // Step 2: Post the tweet using Twitter API
      const tweetResponse = await TwitterPostRepository.postToTwitter(tweetContent, twitterAccessToken, twitterRefreshToken);
      console.log("Tweet response:", tweetResponse);
      if (tweetResponse.error) {
        throw new AppError("Failed to post tweet on Twitter", HTTP_STATUS.BAD_REQUEST);
      }

      // Check if the tweet was successfully posted and if we have a tweet ID
      if (tweetResponse?.data?.id) {
        // Step 3: Claim the referral only if the tweet was successfully posted
        if (referralCode) {
          // Step 3.1: Find the user who referred using the referral code
          const referrer = await userRepository.findUserByReferralCode(referralCode);

          if (!referrer) {
            throw new AppError('Invalid referral code', HTTP_STATUS.BAD_REQUEST);
          }

          // Step 3.2: Create a new referral log linking the referrer and referred user
          await userRepository.createReferral({
            referrerUserId: referrer.userId,
            referredUserId: userId,
            referralCode: referralCode,
            joinedAt: new Date(),
            rewardGiven: false // Assuming reward hasn't been given yet
          });
        }
      }

      // Step 4: Return the response with both the tweet and referral result
      return { tweetResponse, referralCode };
    } catch (error: unknown) {
        // Handle unknown error type and assert it as an instance of Error
        if (error instanceof Error) {
          // If it's an instance of Error, we can safely access its message and statusCode
          console.error("Error posting tweet and processing referral:", error);
          throw new AppError(error.message || "Internal Server Error", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        } else {
          // If error is not an instance of Error, it's unknown, handle accordingly
          console.error("Unknown error occurred:", error);
          throw new AppError("An unknown error occurred", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
      }
    }
  }

export default new TwitterPostService();
