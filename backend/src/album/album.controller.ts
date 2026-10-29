import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AddFileToAlbumDTO } from './dto/albums.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userID: string;
  };
}

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  // add album password

  // remove album password

  // add file to album

  // remove file from the album

  // delete album -> will cause all the album photo to be kicked out of the album -> but will not delete them

  @Post('addfiletoalbum')
  @UseGuards(JwtAuthGuard)
  async create(@Body() addFileToAlbumDTO: AddFileToAlbumDTO) {
    return await this.albumService.addFileToAlbum(addFileToAlbumDTO);
  }

  @Post('getalbumfiles')
  @UseGuards(JwtAuthGuard)
  async get(
    @Req() req: AuthenticatedRequest,
    @Body() body: { albumID: string },
  ) {
    const { albumFiles, albumData } = await this.albumService.getAlbumFiles(
      req.user.userID,
      body.albumID,
    );

    return { data: { albumFiles, albumData }, code: 201 };
  }

  @Post('createalbumpassword')
  @UseGuards(JwtAuthGuard)
  async createalbumpassword(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: { albumID: string; password: string; confirmPassword: string },
  ) {
    await this.albumService.setAlbumPassword(
      req.user.userID,
      body.albumID,
      body.password,
      body.confirmPassword,
    );

    return { data: 'Password Created Sucessfully', code: 201 };
  }

  @Post('unlockalbum')
  @UseGuards(JwtAuthGuard)
  async unlockalbum(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      albumID: string;
      password: string;
      confirmPassword: string;
      methodType: string;
      type: string;
    },
  ) {
    await this.albumService.unLockAlbum(
      req.user.userID,
      body.albumID,
      body.password,
      body.methodType,
      body.type,
    );

    return { data: 'UnlockAlbum Sucessfully', code: 201 };
  }
}
