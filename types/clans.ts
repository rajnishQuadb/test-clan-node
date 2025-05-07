// Public-facing data transfer object
export interface ClanDTO {
    clanId?: string;
    banner: string;
    title: string;
    description: string;
    clanScore: number;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

// For creating a new clan
export interface CreateClanRequest {
    banner: string;
    title: string;
    description: string;
    status?: boolean;
  }


// For updating existing clan details
export interface UpdateClanRequest {
    clanId: string;
    banner?: string;
    title?: string;
    description?: string;
    clanScore?: number;
    status?: boolean;
  }
  