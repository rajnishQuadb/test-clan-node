import { Request } from 'express';

export interface GoogleUserDTO {
  googleId: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  emailVerified: boolean;
}

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat: number;
  exp: number;
}

export interface GoogleAuthRequest extends Request {
  headers: {
    authorization?: string;
  };
}

export interface GoogleAuthResponse {
  user: GoogleUserDTO;
  access_token: string;
  refresh_token: string;
}