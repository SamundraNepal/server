import { IsNotEmpty } from 'class-validator';

export class AlbumsDTO {
  @IsNotEmpty()
  mediaType!: string;
  @IsNotEmpty()
  albumName!: string;
  numberOfItems!: number;
  isLocked!: boolean;
}
