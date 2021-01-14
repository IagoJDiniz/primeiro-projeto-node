import User from '../infra/typeorm/entities/User'
import path from 'path'
import AppError from '@shared/errors/AppError'
import fs from 'fs'
import uploadConfig from '@config/upload'
import IUsersRepository from '../repositories/IUsersRepository'
import { injectable, inject } from 'tsyringe'
import IStorageProvider from '@shared/container/providers/StorageProvider/models/IStorageProvider'


interface Request {
  userId: string,
  avatarFilename: string
}

@injectable()
class UpdateUserAvatarService {

  constructor(
    @inject('UsersRepository')
    private usersRepository:IUsersRepository,

    @inject('StorageProvider')
    private storageProvider:IStorageProvider
    ){} 


  public async execute({ userId, avatarFilename }: Request): Promise<User> {


    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new AppError('Only authenticated users can change avatars', 401)
    }

    if (user.avatar) {
     await this.storageProvider.deleteFile(user.avatar);

    }

    const filename = await this.storageProvider.saveFile(avatarFilename)

    user.avatar = filename

    await this.usersRepository.save(user)

    return user


  }
}


export default UpdateUserAvatarService