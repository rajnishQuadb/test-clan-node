import { v4 as uuidv4 } from 'uuid';
import TwitterUser from '../models/TwitterUser';
import { TwitterUserDTO } from '../types/twitterAuth';

class TwitterAuthRepository {
  async findByTwitterId(twitterId: string): Promise<TwitterUserDTO | null> {
    try {
      const user = await TwitterUser.findOne({ where: { twitterId } });
      if (!user) return null;
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in findByTwitterId:', error);
      throw error;
    }
  }
  
  async findByUsername(username: string): Promise<TwitterUserDTO | null> {
    try {
      const user = await TwitterUser.findOne({ where: { username } });
      if (!user) return null;
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in findByUsername:', error);
      throw error;
    }
  }
  
  async createUser(userData: TwitterUserDTO): Promise<TwitterUserDTO> {
    try {
      const user = await TwitterUser.create({
        id: uuidv4(),
        twitterId: userData.twitterId,
        username: userData.username,
        displayName: userData.displayName,
        email: userData.email,
        profilePicture: userData.profilePicture
      });
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }
  
  async updateUser(id: string, userData: Partial<TwitterUserDTO>): Promise<TwitterUserDTO | null> {
    try {
      const user = await TwitterUser.findByPk(id);
      if (!user) return null;
      
      await user.update(userData);
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }
  
  private mapToDTO(user: TwitterUser): TwitterUserDTO {
    return {
      id: user.id,
      twitterId: user.twitterId,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      profilePicture: user.profilePicture
    };
  }
}

export default new TwitterAuthRepository();