import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { Request } from 'express';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import * as os from 'os';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async createUserFolder(userData) {
    // Get the created User ID HASH IT
    const hashID = createHash('sha256').update(userData.id).digest('hex');

    //CREATE the user folder in storage path
    const storagePath =
      os.platform() == 'win32'
        ? this.configService.get<string>('STORAGE_PATH_WINDOWS')
        : this.configService.get<string>('STORAGE_PATH_LINUX');

    if (!storagePath) {
      throw new InternalServerErrorException('STORAGE_PATH is not configured');
    }

    // CREATE folder with user ID
    const filePath = join(storagePath, hashID);

    try {
      await mkdir(filePath, { recursive: true });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to create storage folder: ${error?.message}`,
      );
    }

    // Sub Folders for each user folder created
    const folders = [
      'Profile',
      'Images',
      'Thumbnails',
      'Videos',
      'Temp',
      'OriginalImages',
      'OriginalVideos',
    ];

    // Noe CREATE sub Folders for each user folder
    for (const folder of folders) {
      await mkdir(join(filePath, folder), {
        recursive: true,
      });
    }

    return hashID;
  }

  async storeUserImageProfile(
    req: Request,
    folderHashID: string,
    file: Express.Multer.File,
  ) {
    // create Image filename
    const filename = `profile-${Date.now()}${extname(file.originalname)}`;

    // CREATE FILE PATH TO SAVE PROFILE DATA
    //CREATE the user folder in storage path
    const storagePath =
      os.platform() == 'win32'
        ? this.configService.get<string>('STORAGE_PATH_WINDOWS')
        : this.configService.get<string>('STORAGE_PATH_LINUX');

    const profilePath = this.configService.get<string>('STORAGE_PROFILE_PATH');

    const filePath = join(storagePath!, folderHashID, profilePath!);

    const imagePath = join(filePath, filename);

    // CHECK if the file exists.
    try {
      // MAKE SURE FOLDER EXISTS
      await mkdir(filePath, { recursive: true });

      // SAVE FILE IMAGE TO THE PATH
      await writeFile(imagePath, file.buffer);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to create storage folder: ${error.message}`,
      );
    }

    const imageUrl = filename;

    return imageUrl;
  }
}
