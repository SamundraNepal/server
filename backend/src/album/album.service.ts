import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { AddFileToAlbumDTO } from './dto/albums.dto';
import { Media } from 'src/media/schema/image.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/users.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AlbumService {
  constructor(
    @InjectModel(Media.name)
    private imageModel: Model<Media>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}
  async addFileToAlbum(addFileToAlbum: AddFileToAlbumDTO) {
    const { albumID, fileId, method } = addFileToAlbum;

    if (!fileId) {
      throw new BadGatewayException({
        message: 'Failed to add image to the album',
        statusCode: 502,
      });
    }
    if (!albumID) {
      throw new BadGatewayException({
        message: 'Failed to add image to the album',
        statusCode: 502,
      });
    }

    const findImage = await this.imageModel.findById(fileId);

    if (!findImage) {
      throw new BadGatewayException({
        message: 'Failed to add image to the album',
        statusCode: 502,
      });
    }

    // 1st we check if the photo has same album or not

    if (findImage.fileAlbums == albumID) {
      throw new BadGatewayException({
        message: 'Image is already in the album ',
        statusCode: 502,
      });
    }

    // we add the abbum id here
    // when user try to add new album this will replace that album id with new one
    if (method === 'add') {
      findImage.fileAlbums = albumID;
    } else {
      findImage.fileAlbums = '';
    }

    // we save it / update the database
    await findImage.save();
    return { message: 'Photo is added to the album', statusCode: 201 };
  }

  async getAlbumFiles(userID: string, albumId: string) {
    if (!albumId) {
      throw new BadRequestException({ message: 'album does not exists' });
    }

    const user = await this.userModel.findById(userID);

    if (!user) {
      throw new BadRequestException({ message: 'User Does not exists' });
    }

    const albumData = [...user.photoAlbums, ...user.videoAlbums].find(
      (album) => album._id?.toString() === albumId,
    );

    const albumFiles = await this.imageModel.aggregate([
      {
        $match: {
          userId: userID,
          fileAlbums: albumId,
          mediaType: albumData?.type,
          isDeleted: false,
        },
      },

      {
        $project: {
          _id: 1,
          userId: 1,

          // FILE
          fileName: 1,
          fileURL: 1,
          convertedFileSize: 1,
          fileSize: 1,
          format: 1,
          mediaType: 1,

          // DATES
          backUpDate: 1,
          dateTimeOriginal: 1,

          // IMAGE DIMENSIONS
          fileXDimension: 1,
          fileYDimension: 1,
          megapixels: 1,
          orientation: 1,

          // CAMERA
          make: 1,
          model: 1,
          software: 1,

          // LENS
          focalLength: 1,
          focalLength35mm: 1,
          fNumber: 1,

          // EXPOSURE
          iso: 1,
          exposureTime: 1,
          exposureCompensation: 1,
          exposureProgram: 1,
          meteringMode: 1,
          exposureMode: 1,

          // CAMERA SETTINGS
          whiteBalance: 1,
          flash: 1,
          digitalZoomRatio: 1,

          // GPS
          gPSLatitude: 1,
          gPSLongitude: 1,
          gPSAltitude: 1,

          // COLOR / IMAGE DATA
          colorSpace: 1,
          bitsPerSample: 1,
          colorComponents: 1,
          yCbCrSubSampling: 1,
          imageUniqueID: 1,

          // ALBUM
          fileAlbums: 1,
        },
      },
      { $sort: { dateTimeOriginal: -1 } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$dateTimeOriginal' },
          },
          files: { $push: '$$ROOT' },
        },
      },

      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    /*const albumFilesCount = await this.imageModel.countDocuments({
      userId: userID,
      fileAlbums: albumId,
      mediaType: 'image',
      isDeleted: false,
    });*/

    return { albumFiles, albumData };
  }

  // this set password for the album
  async setAlbumPassword(
    userID: string,
    albumID: string,
    password: string,
    confirmPassword: string,
  ) {
    if (!userID) {
      throw new BadRequestException({ message: 'Invalid user ID' });
    }

    if (!albumID) {
      throw new BadRequestException({ message: 'Invalid album ID' });
    }

    if (password !== confirmPassword) {
      throw new BadRequestException({ message: 'Password does not match' });
    }

    const user = await this.userModel.findById(userID);

    if (!user) {
      throw new BadRequestException({ message: 'User does not exists' });
    }

    // find the album id now
    const albumExists = [...user.photoAlbums, ...user.videoAlbums].find(
      (albums) => albums._id?.toString() == albumID,
    );

    if (!albumExists) {
      throw new BadRequestException({ message: 'Album does not exists' });
    }

    // hash the password now..
    const passwordHash = await bcrypt.hash(password, 12);

    // save the hash password to the album database
    albumExists.albumPassword = passwordHash;
    albumExists.isLocked = true;

    await user.save();
  }

  // this unlocks album and clear its password as well
  // this also handles delete album as well
  async unLockAlbum(
    userID: string,
    albumID: string,
    password: string,
    methodType: string,
    type: string,
  ) {
    if (!userID) {
      throw new BadRequestException({ message: 'Invalid user ID' });
    }

    if (!albumID) {
      throw new BadRequestException({ message: 'Invalid album ID' });
    }

    const user = await this.userModel.findById(userID);

    if (!user) {
      throw new BadRequestException({ message: 'User does not exists' });
    }

    const albumExists =
      type === 'Images'
        ? user.photoAlbums.find((album) => album._id?.toString() === albumID)
        : user.videoAlbums.find((album) => album._id?.toString() === albumID);

    if (!albumExists) {
      throw new BadRequestException({ message: 'Album does not exists' });
    }

    const requiredPassword = albumExists.albumPassword;

    if (requiredPassword) {
      const passwordMatch = await bcrypt.compare(
        password,
        albumExists.albumPassword,
      );

      if (!passwordMatch) {
        throw new BadRequestException({ message: 'Password does not match' });
      }
    }

    switch (methodType) {
      case 'CLEAR':
        albumExists.albumPassword = '';
        albumExists.isLocked = false;
        await user.save();
        break;

      case 'DELETE':
        // this removes the album with this id and keep the rest
        if (type === 'Images') {
          user.photoAlbums = user.photoAlbums.filter(
            (album) => album._id?.toString() !== albumID.toString(),
          );
        } else {
          user.videoAlbums = user.videoAlbums.filter(
            (album) => album._id?.toString() !== albumID.toString(),
          );
        }

        albumExists.isLocked = false;

        // also find all the photo inside that album and move it to trash
        await this.imageModel.updateMany(
          {
            userId: userID,
            fileAlbums: albumID,
          },
          {
            $set: {
              fileAlbums: '',
              isDeleted: true,
            },
          },
        );

        // save the user data
        await user.save();
        break;
    }
  }
}
