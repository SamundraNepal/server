import { IsNotEmpty } from 'class-validator';

export class AddFileToAlbumDTO {
  @IsNotEmpty()
  albumID!: string;
  @IsNotEmpty()
  fileId!: string;
  @IsNotEmpty()
  method!: string;
}
