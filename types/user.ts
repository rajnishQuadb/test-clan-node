export interface SocialHandleDTO {
    provider: 'google' | 'discord' | 'twitter' | 'apple';
    socialId: string;
    username?: string;
    email?: string;
    displayName?: string;
    profilePicture?: string;
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: Date;
    };
    connectedAt?: Date;
    isPrimary?: boolean;
  }
  
  export interface UserDTO {
    id?: string;
    web3Username: string;
    did?: string;
    wallet?: string;
    kiltConnectionDate?: Date;
    isKiltConnected?: boolean;
    socialHandles?: SocialHandleDTO[];
    isActive?: boolean;
    lastLogin?: Date;
  }
  
  export interface SocialAuthRequest {
    web3Username: string;
    did?: string;
    wallet?: string;
    email?: string;
    username?: string;
    displayName?: string;
    profilePicture?: string;
    provider?: 'google' | 'discord' | 'twitter' | 'apple';
    socialId?: string;
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: Date;
    };
  }
  
  // export interface AuthRequest extends Request {
  //   user?: {
  //     id: string;
  //     web3Username?: string;
  //   };
  // }
  
  // export interface JwtPayload {
  //   id: string;
  //   iat: number;
  //   exp: number;
  // }