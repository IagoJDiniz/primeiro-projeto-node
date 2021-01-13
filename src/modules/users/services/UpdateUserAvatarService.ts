import User from '../infra/typeorm/entities/User'
import path from 'path'
import AppError from '@shared/errors/AppError'
import fs from 'fs'
import uploadConfig from '@config/upload'
import IUsersRepository from '../repositories/IUsersRepository'
import { injectable, inject } from 'tsyringe'


interface Request {
  userId: string,
  avatarFilename: string
}

@injectable()
class UpdateUserAvatarService {

  constructor(
    @inject('UsersRepository')
    private usersRepository:IUsersRepository,
    ){} 


  public async execute({ userId, avatarFilename }: Request): Promise<User> {


    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new AppError('Only authenticated users can change avatars', 401)
    }

    if (user.avatar) {
      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar)
      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath)

      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath)
      }

    }

    user.avatar = avatarFilename

    await this.usersRepository.save(user)

    return user


  }
}


export default UpdateUserAvatarService