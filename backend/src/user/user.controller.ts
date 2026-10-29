import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SingUpDTO } from './dto/signup.dto';
import { UploadService } from './user.UploadService';
import type { Request, Response } from 'express';
import { LogInDTO } from './dto/login.dto';
import { VerificationDTO } from './dto/verification.dto';
import {
  ChangeResetPasswordDTO,
  ResetPasswordDTO,
  ResetPasswordTokenDTO,
} from './dto/resetPassword.dto';
import { UpdatePasswordDTO } from './dto/updatePassword.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MediaService } from 'src/media/media.service';
import { AlbumsDTO } from './dto/album.dto';
import { DeleteFilesDTO } from './dto/file.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userID: string;
  };
}

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private uploadService: UploadService,
    private mediaService: MediaService,
  ) { }

  @Post('signup')
  @UseInterceptors(FileInterceptor('profileImage'))
  async signup(
    @Req() req: Request,
    @Body() data: SingUpDTO,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    //CREATE user DATA
    const createdUser = await this.userService.createUser(data);

    //CREATE User Folder
    const userFolderHashId =
      await this.uploadService.createUserFolder(createdUser);

    // NOW Upload User Image
    const imageURL = await this.uploadService.storeUserImageProfile(
      req,
      userFolderHashId,
      profileImage,
    );

    await this.userService.updateUserImageURL(createdUser.id, imageURL);

    return {
      message: 'Account Created',
      code: 201,
    };
  }

  @Post('login')
  async login(@Body() data: LogInDTO) {
    const userID = await this.userService.logInUser(data);
    const message = `Verification code sent to ${data.emailAddress}`;

    return {
      message: message,
      id: userID,
      code: 201,
    };
  }

  @Post('verifyCode')
  async verifyCode(
    @Body() data: VerificationDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.userService.verifyUser(data, res);

    return {
      message: 'Sucess',
      code: 201,
      data: userData,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.userService.logOutUser(res);
    return { message: 'User logged out', code: 201 };
  }

  @Post('generatePasswordResetLink')
  async generatePasswordResetLink(@Body() data: ResetPasswordDTO) {
    await this.userService.ResetPasswordLinkGenerator(data);

    return {
      message:
        'If an account exists with this email address, a password reset link has been sent. Please check your inbox',
      code: 201,
    };
  }

  @Post('resetPasswordUserData')
  async resetPasswordUserData(@Body() data: ResetPasswordTokenDTO) {
    const userData = await this.userService.ResetPasswordUserData(data);

    return {
      message: userData,
      code: 201,
    };
  }

  @Post('changeResetPassword')
  async changeResetPassword(@Body() data: ChangeResetPasswordDTO) {
    await this.userService.ChangePassword(data);
    return {
      message: 'Password Changed',
      code: 201,
    };
  }

  @Post('updatePassword')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body() data: UpdatePasswordDTO,
    @Req() req,
    @Res() res: Response,
  ) {
    await this.userService.UpdatePassword(data, req.user.userID);
    this.userService.logOutUser(res);

    return res.status(201).json({
      message: 'Password Changed',
      code: 201,
    });
  }

  @Post('createAlbum')
  @UseGuards(JwtAuthGuard)
  async createalbum(@Body() data: AlbumsDTO, @Req() req: AuthenticatedRequest) {
    const albumData = await this.userService.CreateImageAlbums(
      data,
      req.user.userID,
    );

    return {
      message: albumData,
      code: 201,
    };
  }

  @Post('uploadimage')
  @UseGuards(JwtAuthGuard)
  async uploadimage(@Req() req) {
    const data = await this.userService.ReceiveImagesChunks(req);
    const combineChunkData = await this.userService.CombineImagesChunks(data);

    if (combineChunkData) {
      switch (combineChunkData.fileType) {
        case 'Images':
        case 'Album-Images':
          {
            const convertedData =
              await this.userService.ConvertCombineImage(combineChunkData);

            const imageMetadata = await this.userService.GetImageMetaData(
              convertedData!,
            );

            if (!imageMetadata) return null;
            const storeInDatabase =
              await this.userService.StoreImages(imageMetadata);

            if (storeInDatabase) {
              void this.userService.AIGenerateFilesTags(
                storeInDatabase?.userId?.toString() || '',
                storeInDatabase?.fileName,
                'Images',
                storeInDatabase.centerStoragePath!,
              );
            }

            if (
              storeInDatabase &&
              data.data &&
              data?.data?.currentFileNumber >= data?.data?.totalFile
            ) {
              console.log('Chunking , Upload and Chunking Complete');
              return { message: 'Complete', code: 201 };
            }
          }
          break;

        case 'Videos':
        case 'Album-Videos':
          {
            const generateThumbnailData =
              await this.userService.GetVideoFileThumbnails(combineChunkData);

            const videoFileMetaData =
              await this.userService.ReadVideoFileMetaData(
                generateThumbnailData!,
              );

            const storeInDatabase = await this.mediaService.StoreVideoFile(
              videoFileMetaData!,
            );

            void this.userService.ProcessVideoQueue(storeInDatabase!);

            if (storeInDatabase) {
              console.log(storeInDatabase);
              void this.userService.AIGenerateFilesTags(
                storeInDatabase?.userID || '',
                storeInDatabase?.thumbailFileName,
                'Thumbnails',
                storeInDatabase.centerStoragePath,
              );
            }

            if (
              storeInDatabase &&
              data.data &&
              data?.data?.currentFileNumber >= data?.data?.totalFile
            ) {
              console.log('Chunking ,Video Upload and Chunking Complete');
              return { message: 'Complete', code: 201 };
            }
          }

          break;
      }
    }
  }

  @Get('getfiles')
  @UseGuards(JwtAuthGuard)
  async getFilesData(
    @Req() req: AuthenticatedRequest,
    @Query()
    query: { pageNumber: number; PageDataLimit: number; mediaType: string },
  ) {
    const { pageNumber, PageDataLimit, mediaType } = query;

    const filesData = await this.mediaService.GetFilessData(
      req?.user.userID,
      pageNumber,
      PageDataLimit,
      mediaType,
    );
    return { filesData, code: 201 };
  }

  /* not needed anymore
  @Get('getvideos')
  @UseGuards(JwtAuthGuard)
  async getvideosData(@Req() req: AuthenticatedRequest) {
    const imagesData = await this.mediaService.GetVideosData(req?.user.userID);
    return { imagesData, code: 201 };
  }
*/
  @Post('deleteandrestorefiles')
  @UseGuards(JwtAuthGuard)
  async deleteImagefiles(@Body() body: DeleteFilesDTO) {
    await this.mediaService.DeleteAndRestoreFiles(body);
    return { data: 'Action Finished', code: 201 };
  }
}
