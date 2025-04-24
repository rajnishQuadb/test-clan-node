import { Request } from 'express';

export interface TwitterUserDTO {
  id?: string;
  twitterId: string;
  username: string;
  displayName: string;
  email?: string;
  profilePicture?: string;
}

export interface TwitterProfile {
  id: string;
  username: string;
  displayName: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
  _json?: {
    profile_image_url_https?: string;
  };
}

export interface TwitterTokens {
  token: string;
  tokenSecret: string;
}

export interface TwitterAuthRequest extends Request {
  user?: TwitterProfile;
}

export interface TwitterAuthResponse {
  user: TwitterUserDTO;
  access_token: string;
  refresh_token: string;
}