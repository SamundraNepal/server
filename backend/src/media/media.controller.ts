import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import type { Response } from 'express';
import path from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import * as os from 'os';
import { MediaService } from './media.service';

interface AuthenticatedRequest extends Request {
  user: {
    userID: string;
  };
}

@Controller('media')
export class MediaController {
  constructor(
    private configService: ConfigService,
    private mediaService: MediaService,
  ) { }

  @Get('profileimage/:imageId')
  @UseGuards(JwtAuthGuard)
  getprofileimage(
    @Param('imageId') imageId: string,
    @Query() query: { id: string },
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { id } = query;

    const userID = req.user.userID;

    const hashID = createHash('sha256').update(id ?? userID).digest('hex');
    const storagePath =
      os.platform() == 'win32'
        ? this.configService.get<string>('STORAGE_PATH_WINDOWS')
        : this.configService.get<string>('STORAGE_PATH_LINUX');


    const serverFileName = path.join(storagePath!, hashID, 'Profile', imageId);

    console.log('Serving:', serverFileName);

    return res.sendFile(serverFileName);
  }

  @Get('images/:imageId')
  @UseGuards(JwtAuthGuard)
  getUserImagePipe(
    @Param('imageId') imageId: string,
    @Query() query: { type: string; original: string },
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { type, original } = query;
    const isOriginal = original === 'true';
    const userID = req?.user?.userID;
    const hashID = createHash('sha256').update(userID).digest('hex');
    const storagePath =
      os.platform() == 'win32'
        ? this.configService.get<string>('STORAGE_PATH_WINDOWS')
        : this.configService.get<string>('STORAGE_PATH_LINUX');

    const serverFolder =
      type === 'Images'
        ? isOriginal
          ? 'OriginalImages'
          : 'Images'
        : type === 'Videos'
          ? 'Thumbnails'
          : undefined;

    if (!serverFolder) return;

    const serverFileName = path.join(
      storagePath!,
      hashID,
      serverFolder,
      imageId,
    );

    console.log('Serving:', serverFileName);

    return res.sendFile(serverFileName);
  }

  @Get('videos/:imageId')
  @UseGuards(JwtAuthGuard)
  getUserVideoStreamPipe(
    @Param('imageId') imageId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const userID = req?.user?.userID;
    const hashID = createHash('sha256').update(userID).digest('hex');
    const storagePath =
      os.platform() == 'win32'
        ? this.configService.get<string>('STORAGE_PATH_WINDOWS')
        : this.configService.get<string>('STORAGE_PATH_LINUX');

    const serverFileName = path.join(storagePath!, hashID, 'Videos', imageId);

    console.log('Serving:', serverFileName);

    return res.sendFile(serverFileName);
  }

  @Get('gettrashfiles')
  @UseGuards(JwtAuthGuard)
  async gettrashfile(@Req() req: AuthenticatedRequest) {
    const files = await this.mediaService.getDeletedFiles(req.user.userID);
    return {
      files,
      code: 201,
    };
  }

  @Post('getsearchfiles')
  @UseGuards(JwtAuthGuard)
  async getsearchfiles(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      searchText: string;
      albumID: string;
    },
    @Query()
    query: { pageNumber: number; PageDataLimit: number; mediaType: string },
  ) {
    const filesData = await this.mediaService.GetSearchFiles(
      body.searchText,
      query.mediaType,
      req.user.userID,
      query.pageNumber,
      query.PageDataLimit,
      body.albumID,
    );

    return { filesData, code: 201 };
  }
}
