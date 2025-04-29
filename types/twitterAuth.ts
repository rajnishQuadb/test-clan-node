import { Request } from 'express';

export interface TwitterUserDTO {
  twitterId: string;
  username: string;
  displayName: string;
  email?: string;
  profilePicture?: string;
}

export interface TwitterTokens {
  token: string;
  tokenSecret: string;
}

export interface TwitterAuthRequest extends Request {
  user?: TwitterUserDTO;
}

export interface TwitterProfile {
  id: string;
  username: string;
  displayName: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  _json?: {
    profile_image_url_https?: string;
  };
}