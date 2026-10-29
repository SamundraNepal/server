import { PartialType } from '@nestjs/mapped-types';
import { AddFileToAlbumDTO } from './albums.dto';

export class UpdateAlbumDto extends PartialType(AddFileToAlbumDTO) {}
