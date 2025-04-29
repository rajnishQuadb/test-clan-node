import { Request } from 'express';

export interface AppleUserDTO {
  appleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

export interface AppleTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  nonce?: string;
  nonce_supported?: boolean;
}

export interface AppleAuthRequest extends Request {
  body: {
    identityToken: string;
    name?: string;
    picture?: string;
  };
}

export interface AppleAuthResponse {
  user: AppleUserDTO;
  access_token: string;
  refresh_token: string;
}