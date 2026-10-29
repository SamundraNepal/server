import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/user/schema/users.schema';
import { AdminUpdateUserDTO, GoogleUserDTO } from './dto/googleuser.dto';
import { createHash, randomBytes, randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UploadService } from 'src/user/user.UploadService';
import { Media } from 'src/media/schema/image.schema';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import { join } from 'path';
import fs from 'fs';
import { rm } from 'fs/promises';

type AlbumCount = {
  _id: Types.ObjectId;
  count: number;
};

type TotalMediaSize = {
  totalSize: number;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private emailService: EmailService,
    private uploadService: UploadService,
    private configService: ConfigService,

    @InjectModel(Media.name)
    private mediaModel: Model<Media>,
  ) {}

  async createGoogleUser(data: GoogleUserDTO) {
    const googleId = await this.userModel.findOne({
      googleId: data.googleId,
    });

    if (!googleId) {
      const emailUser = await this.userModel.findOne({
        emailAddress: data.emailAddress.toUpperCase(),
      });

      const isAdminAccount =
        this.configService.get<string>('ADMIN_EMAIL')?.toUpperCase() ===
        data.emailAddress.toUpperCase();
      // Create new user
      if (!emailUser) {
        const createUser = await this.userModel.create({
          firstName: data.firstName,
          lastName: data.lastName,
          googleId: data.googleId,
          imageLink: data.image,
          emailAddress: data.emailAddress.toUpperCase(),
          authProvider: 'google',
          isAdmin: isAdminAccount,
          isUserActive: isAdminAccount, // if admin then no need for approval
        });

        // Create folder for this user's storage
        await this.uploadService.createUserFolder(createUser);

        // Check if user is approved
        if (!createUser.isUserActive) {
          return {
            approved: false,
            verificationToken: null,
          };
        }

        const userIdentifyToken = await this.CreateHashAndSendEmail(createUser);

        return {
          approved: true,
          verificationToken: userIdentifyToken,
        };
      } else {
        // User exists by email, connect Google account
        emailUser.googleId = data.googleId;
        emailUser.authProvider = 'google';

        await emailUser.save();

        // Check if user is approved
        if (!emailUser.isUserActive) {
          return {
            approved: false,
            verificationToken: null,
          };
        }

        const userIdentifyToken = await this.CreateHashAndSendEmail(emailUser);

        return {
          approved: true,
          verificationToken: userIdentifyToken,
        };
      }
    } else {
      // Google account already exists

      // Check if user is approved
      if (!googleId.isUserActive) {
        return {
          approved: false,
          verificationToken: null,
        };
      }

      const userIdentifyToken = await this.CreateHashAndSendEmail(googleId);

      return {
        approved: true,
        verificationToken: userIdentifyToken,
      };
    }
  }

  async CreateHashAndSendEmail(user: any) {
    // Now Create SIX DIGIT AUTH CODE
    const verificationCode = randomInt(100000, 1000000).toString();

    console.log(verificationCode);
    // now send email to the user email
    await this.emailService.sendVerificationCode({
      emailAddress: user.emailAddress.toLocaleLowerCase(),
      userName: user.firstName,
      otp: verificationCode,
    });

    // HASH the number for Security
    const hashCode = await bcrypt.hash(verificationCode, 10);

    // THIS sets the token expiry time.
    const verificationCodeExpiryDate = new Date(Date.now() + 5 * 60 * 1000);

    // CREATE verifications token to identify the user later for OTP
    const verificationToken = randomBytes(32).toString('hex');

    user.oneTimeVerificationToken = hashCode;
    user.oneTimeVerificationTokenExpire = verificationCodeExpiryDate;
    user.userVerificationToken = verificationToken;

    // Save the Data to database
    await user.save();

    return verificationToken;
  }

  async UserData(userID: string) {
    const userData = await this.userModel.findById(userID);

    if (!userData) {
      throw new BadRequestException({ message: 'Invalid user data' });
    }

    const imageAlbumIds = userData.photoAlbums.map((album) =>
      album._id?.toString(),
    );
    const videoAlbumIds = userData.videoAlbums.map((album) =>
      album._id?.toString(),
    );

    const albumIds = [...imageAlbumIds, ...videoAlbumIds];

    const mediaCounts = await this.mediaModel.aggregate<AlbumCount>([
      {
        $match: {
          userId: userID,
          fileAlbums: { $in: albumIds },
          mediaType: { $in: ['Images', 'Videos'] },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$fileAlbums',
          count: { $sum: 1 },
        },
      },
    ]);
    // Put the counts back into the albums
    userData.photoAlbums = userData.photoAlbums.map((album) => {
      const albumCount = mediaCounts.find(
        (item) => item._id.toString() === album._id?.toString(),
      );

      return {
        ...album,
        numberOfItems: albumCount?.count ?? 0,
      };
    });

    // Put the counts back into the albums
    userData.videoAlbums = userData.videoAlbums.map((album) => {
      const albumCount = mediaCounts.find(
        (item) => item._id.toString() === album._id?.toString(),
      );

      return {
        ...album,
        numberOfItems: albumCount?.count ?? 0,
      };
    });

    // save updated user
    await userData.save();

    // now get user data total file size

    const totalMediaFileSize = await this.mediaModel.aggregate<TotalMediaSize>([
      {
        $match: {
          userId: userID,
        },
      },

      {
        $group: {
          _id: '$totalMediaSize',
          totalSize: { $sum: `$fileSize` },
        },
      },
    ]);

    const totalSize = totalMediaFileSize[0]?.totalSize ?? 0;
    return {
      firstName: userData.firstName,
      lastName: userData.lastName,
      emailAddress: userData.emailAddress,
      imageLink: userData.imageLink,
      authProvider: userData.authProvider,
      photoAlbums: userData.photoAlbums,
      videoAlbums: userData.videoAlbums,
      strorage: userData.storage,
      userStorageComsumeSize: totalSize,
      isAdmin: userData.isAdmin,
    };
  }

  async getAdminDatas(userID: string) {
    if (!userID) {
      throw new BadRequestException({ message: 'No user data' });
    }

    const userData = await this.userModel
      .find()
      .select(
        '_id firstName lastName emailAddress imageLink storage isUserActive',
      )
      .lean();

    return userData;
  }

  async adminUserUpdate(data: AdminUpdateUserDTO) {
    const userData = await this.userModel.findById(data._id);

    if (!userData) {
      throw new BadRequestException({
        message: 'User not valid',
        id: data._id,
      });
    }

    if (data.isDelete) {
      const hashID = createHash('sha256').update(userData.id).digest('hex');

      //CREATE the user folder in storage path
      const storagePath =
        os.platform() == 'win32'
          ? this.configService.get<string>('STORAGE_PATH_WINDOWS')
          : this.configService.get<string>('STORAGE_PATH_LINUX');

      if (!storagePath) {
        throw new InternalServerErrorException(
          'STORAGE_PATH is not configured',
        );
      }

      // CREATE folder with user ID
      const filePath = join(storagePath, hashID);

      const exists = fs.existsSync(filePath);

      if (exists) {
        console.log('Folder Deleted');
        await rm(filePath, { recursive: true, force: true });
      } else {
        console.log('Path does not exist');
      }

      console.log('user Deleted');

      await userData.deleteOne();

      // notify the account holder
      await this.emailService.sendAccountDeletion({
        emailAddress: userData.emailAddress.toLocaleLowerCase(),
        userName: userData.firstName,
      });

      return userData.id;
    }

    if (userData.isAdmin) {
      if (!data.isUserActive) {
        console.log('Admin cant be inActive');
        throw new BadRequestException({
          message: 'Admin cant be inActive',
          id: data._id,
        });
      }
    }

    if (data.storage <= 0) {
      console.log('Storage cant be less than or 0 ');
      throw new BadRequestException({
        message: 'Storage cant be less than or 0',
        id: data._id,
      });
    }

    userData.storage = data.storage;
    userData.isUserActive = data.isUserActive;

    // notify the account holder
    switch (userData.isUserActive) {
      case true:
        await this.emailService.sendAccountActivation({
          emailAddress: userData.emailAddress.toLocaleLowerCase(),
          userName: userData.firstName,
          storage: userData.storage,
        });
        break;

      case false:
        await this.emailService.sendAccountDeActivation({
          emailAddress: userData.emailAddress.toLocaleLowerCase(),
          userName: userData.firstName,
        });
        break;
    }

    await userData.save();

    return userData.id;
  }
}
