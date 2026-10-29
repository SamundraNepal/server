import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './schema/users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SingUpDTO } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { LogInDTO } from './dto/login.dto';
import { createHash, randomBytes, randomInt } from 'crypto';
import { VerificationDTO } from './dto/verification.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import {
  ChangeResetPasswordDTO,
  ResetPasswordDTO,
  ResetPasswordTokenDTO,
} from './dto/resetPassword.dto';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { UpdatePasswordDTO } from './dto/updatePassword.dto';
import Path from 'path';
import { rename } from 'fs/promises';
import { MediaService } from 'src/media/media.service';
import { Media } from 'src/media/schema/image.schema';
import { AlbumsDTO } from './dto/album.dto';
import {
  ConvertCombineImageFileDTO,
  GenerateVideoThumbnailDTO,
  GetImageMetaDataDTO,
  ReadVideoFIleMetaDataDTO,
  ReceiveImagesResult,
  StoreImagesDTO,
  StoreVideoFileDTO,
} from './dto/uploadFile.dto';
import { AIService } from 'src/ai/ai.service';
import * as os from 'os';
import path from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    private mediaService: MediaService,
    private aiService: AIService,
    @InjectModel(Media.name)
    private imageModel: Model<Media>,
  ) { }

  // THIS IS TO CREATE USER
  async createUser(data: SingUpDTO) {
    // 1st) UPPERCASE THE EMAIL ADDRESS FOR CONSITENCY
    data.emailAddress = data.emailAddress.toUpperCase();

    //1st check if the user already exits or not
    const existingUser = await this.userModel.findOne({
      emailAddress: data.emailAddress,
    });

    if (existingUser) {
      throw new BadRequestException({ message: 'User Email already exists' });
    }

    // 1st) Check if password matches or not
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException({ message: 'Passwords do not match' });
    }

    // 2nd) Convert the password to hash
    const hashPassword = await bcrypt.hash(data.password, 12);
    data.password = hashPassword;

    // 3RD CREATE user database
    const userData = await this.userModel.create(data);

    const isAdminAccount =
      this.configService.get<string>('ADMIN_EMAIL')?.toUpperCase() ===
      data.emailAddress.toUpperCase();

    // if admin no need for activation///
    userData.isAdmin = isAdminAccount;
    userData.isUserActive = isAdminAccount;
    await userData.save();

    return userData;
  }

  async updateUserImageURL(userID: string, imageURL: string) {
    return await this.userModel.findByIdAndUpdate(
      userID,
      { imageLink: imageURL },
      { returnDocument: 'after' },
    );
  }

  // THIS IS TO LOG IN USERS
  async logInUser(data: LogInDTO) {
    // 1st) UPPERCASE THE EMAIL ADDRESS FOR CONSITENCY
    data.emailAddress = data.emailAddress.toUpperCase();

    const user = await this.userModel.findOne({
      emailAddress: data.emailAddress,
    });

    if (!user) {
      throw new BadRequestException({
        message: 'Email Or Password is incorrect',
      });
    }

    // Google-only account
    if (!user.password) {
      throw new BadRequestException({
        message:
          'This account uses Google Sign-In. Please continue with Google.',
      });
    }

    // 2ND verify the password
    const isPasswordValid = await bcrypt.compare(
      data.password, // password user typed
      user.password, // hashed password from DB
    );

    if (!isPasswordValid) {
      throw new BadRequestException({
        message: 'Email or Password is incorrect',
      });
    }

    if (!user.isUserActive) {
      throw new BadRequestException({
        message:
          'You are not authorized to access this resource. Please contact an administrator.',
        code: 404,
      });
    }

    // Now Create SIX DIGIT AUTH CODE
    const verificationCode = randomInt(100000, 1000000).toString();

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

  // THIS verify user verifications code
  async verifyUser(data: VerificationDTO, res: Response) {
    const user = await this.userModel.findOne({
      userVerificationToken: data.verificationToken,
    });

    if (!user) {
      throw new BadRequestException({ message: 'Invalid Verification Code' });
    }
    if (!user.oneTimeVerificationTokenExpire) {
      throw new BadRequestException('Verification token expired');
    }

    if (user.oneTimeVerificationTokenExpire < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    //1st check if the token has date expired or not
    if (new Date() > user.oneTimeVerificationTokenExpire) {
      throw new BadRequestException({
        message: 'Verifications code expired',
        code: 400,
      });
    }

    // 2nd verify the token.
    const tokenMatch = await bcrypt.compare(
      data.authCode,
      user.oneTimeVerificationToken!,
    );

    if (!tokenMatch) {
      throw new BadRequestException({
        message: 'Invalid verification code',
        code: 400,
      });
    }

    // Null the verifications code and verifications time.
    user.userVerificationToken = null;
    user.oneTimeVerificationTokenExpire = null;
    user.oneTimeVerificationToken = null;

    await user.save();

    // Create Cookies now

    // 1ST JWT TOKEN
    const jwtToken = this.jwtService.sign({ userID: user.id.toString() });

    // 2ND Create cookies

    res.cookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      photoAlbum: user.photoAlbums,
      videoAlbum: user.videoAlbums,
      storage: user.storage,
      image: user.imageLink,
    };
  }

  logOutUser(res: Response) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  }

  // This generates password link
  async ResetPasswordLinkGenerator(data: ResetPasswordDTO) {
    // 1st) UPPERCASE THE EMAIL ADDRESS FOR CONSITENCY
    data.emailAddress = data.emailAddress.toUpperCase();

    const user = await this.userModel.findOne({
      emailAddress: data.emailAddress,
    });

    if (!user) {
      throw new BadRequestException({
        message: 'Invalid Email',
      });
    }

    // generate a password reset link now

    //1st reset token
    const passwordResetToken = randomBytes(32).toString('hex');

    const hashPasswordResetTokne = createHash('sha256')
      .update(passwordResetToken)
      .digest('hex');

    //2nd password reset token expire date
    const passwordResetExpireDate = new Date(Date.now() + 5 * 60 * 1000);

    user.passwordResetToken = hashPasswordResetTokne;
    user.passwordResetExpire = passwordResetExpireDate;

    await user.save();

    // Generate password Reset link

    const passwordResetLink = `${this.configService.get<string>('FRONTEND_DOMAIN_RESET_PASSWORD')}?resetToken=${hashPasswordResetTokne}`;

    // Send the Email to the user now
    await this.emailService.sendPasswordResetLink({
      emailAddress: user.emailAddress.toLocaleLowerCase(),
      userName: user.firstName,
      resetLink: passwordResetLink,
    });
  }

  async ResetPasswordUserData(data: ResetPasswordTokenDTO) {
    const user = await this.userModel.findOne({
      passwordResetToken: data.resetToken,
    });

    if (!user) {
      throw new BadRequestException({
        message: 'User does not exits',
      });
    }

    if (!user.passwordResetExpire) {
      throw new BadRequestException('Verification token expired');
    }

    //1st check if the token has date expired or not
    if (new Date() > user.passwordResetExpire) {
      throw new BadRequestException({
        message: 'Verifications token expired',
        code: 400,
      });
    }

    const userData = {
      firstName: user.firstName,
      emailAddress: user.emailAddress,
      imageLink: user.imageLink,
    };

    return userData;
  }

  async ChangePassword(data: ChangeResetPasswordDTO) {
    const user = await this.userModel.findOne({
      emailAddress: data.emailAddress.toUpperCase(),
    });

    if (!user) {
      throw new BadRequestException({ message: 'User Does not exits' });
    }

    // 1st) Check if password matches or not
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException({ message: 'Passwords do not match' });
    }

    // 2nd) Convert the password to hash
    const hashPassword = await bcrypt.hash(data.password, 12);
    data.password = hashPassword;

    // change password
    user.password = data.password;

    // make the token and  password expire null
    user.passwordResetToken = '';
    user.passwordResetExpire = null;
    user.passwordChangedAt = new Date(Date.now());

    await user.save();
  }

  async UpdatePassword(data: UpdatePasswordDTO, userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException({
        message: 'Invalid User',
      });
    }

    if (data.newPassword != data.confirmPassword) {
      throw new BadRequestException({
        message: 'Passwword did not match',
      });
    }

    const previousPasswordValid = await bcrypt.compare(
      data.previousPassword,
      user.password,
    );

    if (!previousPasswordValid) {
      throw new BadRequestException({
        message: 'incorrect old password',
      });
    }

    // hash new password
    const hashPassword = await bcrypt.hash(data.newPassword, 10);

    // save it to database
    user.password = hashPassword;
    user.passwordChangedAt = new Date(Date.now());
    await user.save();
  }

  async CreateImageAlbums(data: AlbumsDTO, userID: string) {
    // get user first
    const user = await this.userModel.findById(userID);

    if (!user) {
      throw new BadRequestException({
        message: 'Invalid User',
      });
    }

    // we check if the user album name exits or not...
    const albumNameExists =
      data.mediaType === 'Images'
        ? user.photoAlbums.some((el) => el.albumName === data.albumName)
        : user.videoAlbums.some((el) => el.albumName === data.albumName);
    if (albumNameExists) {
      throw new BadRequestException({
        message: 'Album name Already exits',
      });
    }

    switch (data.mediaType) {
      case 'Images':
        user.photoAlbums.push({
          albumName: data.albumName,
          isLocked: data.isLocked,
          albumPassword: '',
          numberOfItems: 0,
          type: 'Images',
        });
        break;

      case 'Videos':
        user.videoAlbums.push({
          albumName: data.albumName,
          isLocked: data.isLocked,
          albumPassword: '',
          numberOfItems: 0,
          type: 'Videos',
        });
        break;
    }

    await user.save();

    return data.mediaType == 'Images' ? user.photoAlbums : user.videoAlbums;
  }

  // Upload image service

  //1st receive chunks..
  async ReceiveImagesChunks(req: any) {
    return await this.mediaService.ReceiveFileChunks(req);
  }

  //2nd combine the chunks..
  async CombineImagesChunks(data: ReceiveImagesResult) {
    if (!data.data) return;

    const combineFileData = data.data;

    return await this.mediaService.CombineFileChunks(combineFileData);
  }

  //3rd convert the chunks in mp4
  async ConvertCombineImage(data: ConvertCombineImageFileDTO) {
    if (!data) return null;

    // save outputPath
    const convertedFileName = `${data.fileId}.jpg`;
    const outputPath = Path.join(
      data.centerStoragePath,
      'Images',
      convertedFileName.toLowerCase(),
    );

    // first is the image that needs conversion path and second is the actual image converted path
    const convertedImagePath = await this.mediaService.convertImageFile(
      data.outputpath,
      outputPath,
    );

    // if converted path is not been return then dont move the combine image form the temp folder
    if (!convertedImagePath) return null;

    // move out the original image  path out if this temp folder  to original image
    const fileName = `${data.fileId}${data.extension}`;
    const originalImagePath = Path.join(
      data.centerStoragePath,
      'OriginalImages',
      fileName.toLowerCase(),
    );

    await rename(data.outputpath, originalImagePath);

    console.log('🟢 Imaged moved to original image folder!');

    console.log('Original extension:', data.extension);
    console.log('Temporary file:', data.outputpath);
    console.log('Destination file:', originalImagePath);

    return {
      originalImagePath,
      convertedImagePath,
      ...data,
    };
  }

  //4th

  async GetImageMetaData(data: GetImageMetaDataDTO) {
    if (!data) return null;

    const metadata = await this.mediaService.ReadImageFileMetaData(
      data.originalImagePath,
      data.convertedImagePath,
    );

    return { ...metadata, ...data };
  }

  //5th store it in db
  async StoreImages(imageData: StoreImagesDTO) {
    if (!imageData) return;

    const imageName = Path.basename(imageData.convertedImagePath!);
    const originalFileName = Path.basename(imageData.originalImagePath!);

    const fileURL = imageName;
    const userID = imageData.userID;

    const imageSchemaData = await this.imageModel.create({
      // =========================
      // OWNERSHIP / FILE
      // =========================

      userId: userID,
      fileName: imageName.toLowerCase(),
      originalFileName: originalFileName.toLowerCase(),
      fileURL: fileURL.toLowerCase(),
      fileSize: imageData.fileSize,
      convertedFileSize: imageData.convertedFileSize,

      format: imageData.format,
      mediaType: 'Images',

      // =========================
      // DATES
      // =========================

      dateTimeOriginal: imageData.dateTimeOriginal ?? Date.now(),
      backUpDate: Date.now(),

      // =========================
      // IMAGE DIMENSIONS
      // =========================

      fileXDimension: imageData.fileXDimension,
      fileYDimension: imageData.fileYDimension,
      megapixels: imageData.megapixels,
      orientation: imageData.orientation,

      // =========================
      // CAMERA
      // =========================

      make: imageData.make,
      model: imageData.model,
      software: imageData.software,

      // =========================
      // LENS
      // =========================

      focalLength: imageData.focalLength,
      focalLength35mm: imageData.focalLength35mm,
      fNumber: imageData.fNumber,

      // =========================
      // EXPOSURE
      // =========================

      iso: imageData.iso,
      exposureTime: imageData.exposureTime,
      exposureCompensation: imageData.exposureCompensation,
      exposureProgram: imageData.exposureProgram,
      meteringMode: imageData.meteringMode,
      exposureMode: imageData.exposureMode,

      // =========================
      // CAMERA SETTINGS
      // =========================

      whiteBalance: imageData.whiteBalance,
      flash: imageData.flash,
      digitalZoomRatio: imageData.digitalZoomRatio,

      // =========================
      // GPS
      // =========================

      gPSLatitude: imageData.gPSLatitude,
      gPSLongitude: imageData.gPSLongitude,
      gPSAltitude: imageData.gPSAltitude,

      // =========================
      // COLOR / IMAGE DATA
      // =========================

      colorSpace: imageData.colorSpace,
      bitsPerSample: imageData.bitsPerSample,
      colorComponents: imageData.colorComponents,
      yCbCrSubSampling: imageData.yCbCrSubSampling,

      // =========================
      // ALBUM
      // =========================

      fileAlbums: imageData.albumID,

      // =========================
      // SYSTEM
      // =========================

      isDeleted: imageData.isDeleted,
    });

    return {
      ...imageSchemaData.toObject(),
      centerStoragePath: imageData.centerStoragePath,
    };
  }

  // for video file processing
  async GetVideoFileThumbnails(data: GenerateVideoThumbnailDTO) {
    if (!data) return;

    return await this.mediaService.GenerateVideoThumbnails(data);
  }

  async ReadVideoFileMetaData(data: ReadVideoFIleMetaDataDTO) {
    if (!data) return;

    return this.mediaService.ReadVideoFileMetaData(data);
  }

  async StoreVideoFiles(data: ReadVideoFIleMetaDataDTO) {
    if (!data) return;

    return this.mediaService.StoreVideoFile(data);
  }

  async ConvertVideoFiles(data: ReadVideoFIleMetaDataDTO) {
    if (!data) return;

    return await this.mediaService.ConvertVideoFile(data);
  }

  private videoQueue: StoreVideoFileDTO[] = [];
  private isProcessing = false;

  public async ProcessVideoQueue(data: ReadVideoFIleMetaDataDTO) {
    this.videoQueue.push(data);

    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.videoQueue.length > 0) {
        const video = this.videoQueue.shift();

        if (!video) continue;

        try {
          console.log(
            `Starting conversion. Remaining: ${this.videoQueue.length}`,
          );

          await this.ConvertVideoFiles(video);
          console.log('Video conversion finished');
        } catch (error) {
          console.error('Video conversion failed:', error);
        }
      }
    } finally {
      console.log('All video files conversion finished');
      this.isProcessing = false;
    }
  }

  // AI files tag Generator

  private aiTagQueue: {
    userID: string;
    fileName: string;
    type: string;
    filePath: string;
  }[] = [];

  private isProcessingAiTags = false;

  async AIGenerateFilesTags(
    userID: string,
    fileName: string,
    type: string,
    filePath: string,
  ) {
    if (!userID || !fileName) {
      throw new BadRequestException({
        message: 'User ID or File name not supplied',
      });
    }

    const fileData = await this.imageModel.findOne({
      userId: userID,
      fileName: fileName,
    });

    if (!fileData) {
      throw new BadRequestException({
        message: 'File does not exist',
      });
    }

    // Add the job to the queue
    this.aiTagQueue.push({
      userID,
      fileName,
      type,
      filePath,
    });

    console.log(
      `AI tagging queued: ${fileName}. Queue size: ${this.aiTagQueue.length}`,
    );

    // Start the worker if it isn't already running
    void this.processAiTagQueue();

    return {
      message: 'AI tagging added to queue',
      fileName,
    };
  }

  private async processAiTagQueue(): Promise<void> {
    if (this.isProcessingAiTags) {
      return;
    }

    this.isProcessingAiTags = true;

    try {
      while (this.aiTagQueue.length > 0) {
        const job = this.aiTagQueue.shift()!;

        try {
          console.log(`AI tagging started: ${job.fileName}`);

          const fileData = await this.imageModel.findOne({
            userId: job.userID,
            fileName: job.fileName,
          });

          if (!fileData) {
            console.log(`File no longer exists: ${job.fileName}`);
            continue;
          }

          if (fileData.aiTags != null) {
            console.log(`no need for for ai generation`);
            continue;
          }

          const storagePath = path.join(job.filePath, job.type, job.fileName);
          console.log(storagePath);

          // Wait for Qwen to finish this image
          const tags = await this.aiService.generateTags(storagePath);

          // Save the tags before moving to the next job
          fileData.aiTags = tags ?? null;
          await fileData.save();

          console.log(`AI tagging finished: ${job.fileName}`);
          console.log('AI Tags created :', tags);
          console.log('Reamining Queue length : ', this.aiTagQueue.length);
        } catch (error) {
          console.error(`AI tagging failed for ${job.fileName}:`, error);

          // Continue processing the remaining jobs
        }
      }
    } finally {
      this.isProcessingAiTags = false;

      // Start another worker if jobs arrived at the end
      if (this.aiTagQueue.length > 0) {
        void this.processAiTagQueue();
      }
    }
  }
}
