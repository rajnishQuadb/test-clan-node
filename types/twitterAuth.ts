// import { Request } from 'express';

// export interface TwitterUserDTO {
//   twitterId: string;
//   username: string;
//   displayName: string;
//   email?: string;
//   profilePicture?: string;
// }

// export interface TwitterTokens {
//   token: string;
//   tokenSecret: string;
// }

// export interface TwitterAuthRequest extends Request {
//   user?: TwitterUserDTO;
// }

// export interface TwitterProfile {
//   id: string;
//   username: string;
//   displayName: string;
//   emails?: Array<{ value: string }>;
//   photos?: Array<{ value: string }>;
//   _json?: {
//     profile_image_url_https?: string;
//   };
// }

import { Request } from 'express';

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    twitterState?: string;
    googleState?: string;
    // Add any other custom session properties you need
  }
}



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

export interface TwitterTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token?: string;
}

export interface TwitterUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  }
}

export interface TwitterEmailResponse {
  data: {
    email: string;
    verified: boolean;
  }
}