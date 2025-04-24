import { v4 as uuidv4 } from 'uuid';
import AppleUser from '../models/AppleUser';
import { AppleUserDTO } from '../types/appleAuth';

class AppleAuthRepository {
  async findByEmail(email: string): Promise<AppleUserDTO | null> {
    try {
      const user = await AppleUser.findOne({ where: { email } });
      if (!user) return null;
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }
  
  async findByAppleId(appleId: string): Promise<AppleUserDTO | null> {
    try {
      const user = await AppleUser.findOne({ where: { appleId } });
      if (!user) return null;
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in findByAppleId:', error);
      throw error;
    }
  }
  
  async createUser(userData: AppleUserDTO): Promise<AppleUserDTO> {
    try {
      const user = await AppleUser.create({
        id: uuidv4(),
        appleId: userData.appleId,
        email: userData.email,
        name: userData.name || 'Apple User',
        picture: userData.picture,
        emailVerified: userData.emailVerified
      });
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }
  
  async updateUser(id: string, userData: Partial<AppleUserDTO>): Promise<AppleUserDTO | null> {
    try {
      const user = await AppleUser.findByPk(id);
      if (!user) return null;
      
      await user.update(userData);
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }
  
  private mapToDTO(user: AppleUser): AppleUserDTO {
    return {
      id: user.id,
      appleId: user.appleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      emailVerified: user.emailVerified
    };
  }
}

export default new AppleAuthRepository();