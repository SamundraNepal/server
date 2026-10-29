import { IsNotEmpty } from 'class-validator';

export class DeleteFilesDTO {
  @IsNotEmpty()
  fileID!: string;

  @IsNotEmpty()
  methodType!: string;
}
