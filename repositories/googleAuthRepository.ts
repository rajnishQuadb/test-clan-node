import { v4 as uuidv4 } from 'uuid';
import GoogleUser from '../models/GoogleUser';
import { GoogleUserDTO } from '../types/googleAuth';

class GoogleAuthRepository {
  async findByEmail(email: string): Promise<GoogleUserDTO | null> {
    try {
      const user = await GoogleUser.findOne({ where: { email } });
      if (!user) return null;
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }
  
  async findByGoogleId(googleId: string): Promise<GoogleUserDTO | null> {
    try {
      const user = await GoogleUser.findOne({ where: { googleId } });
      if (!user) return null;
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in findByGoogleId:', error);
      throw error;
    }
  }
  
  async createUser(userData: GoogleUserDTO): Promise<GoogleUserDTO> {
    try {
      const user = await GoogleUser.create({
        id: uuidv4(),
        googleId: userData.googleId,
        email: userData.email,
        name: userData.name,
        givenName: userData.givenName,
        familyName: userData.familyName,
        picture: userData.picture,
        emailVerified: userData.emailVerified
      });
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }
  
  async updateUser(id: string, userData: Partial<GoogleUserDTO>): Promise<GoogleUserDTO | null> {
    try {
      const user = await GoogleUser.findByPk(id);
      if (!user) return null;
      
      await user.update(userData);
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }
  
  private mapToDTO(user: GoogleUser): GoogleUserDTO {
    return {
      id: user.id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      givenName: user.givenName,
      familyName: user.familyName,
      picture: user.picture,
      emailVerified: user.emailVerified
    };
  }
}

export default new GoogleAuthRepository();