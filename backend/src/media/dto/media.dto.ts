export interface ExifData {
  Image?: {
    Make?: string;
    Model?: string;
  };
  Photo?: {
    DateTimeOriginal?: string;
  };
  GPSInfo?: {
    GPSLatitude?: number[];
    GPSLatitudeRef?: string;
    GPSLongitude?: number[];
    GPSLongitudeRef?: string;
    GPSAltitude?: number;
    GPSAltitudeRef?: string;
  };
}

import {
  IsBoolean,
  IsDate,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMediaDTO {
  // =========================
  // OWNERSHIP / FILE
  // =========================

  @IsMongoId()
  userId!: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  originalFileName?: string;

  @IsString()
  @IsOptional()
  fileURL?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  format?: string;

  @IsIn(['Images', 'Videos'])
  mediaType!: 'Images' | 'Videos';

  // =========================
  // DATES
  // =========================

  @IsDate()
  @IsOptional()
  dateTimeOriginal?: Date | null;

  @IsDate()
  @IsOptional()
  backUpDate?: Date | null;

  // =========================
  // IMAGE DIMENSIONS
  // =========================

  @IsNumber()
  @IsOptional()
  fileXDimension?: number;

  @IsNumber()
  @IsOptional()
  fileYDimension?: number;

  @IsNumber()
  @IsOptional()
  megapixels?: number;

  @IsString()
  @IsOptional()
  orientation?: string;

  // =========================
  // CAMERA
  // =========================

  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  software?: string;

  // =========================
  // LENS
  // =========================

  @IsNumber()
  @IsOptional()
  focalLength?: number | null;

  @IsNumber()
  @IsOptional()
  focalLength35mm?: number | null;

  @IsNumber()
  @IsOptional()
  fNumber?: number | null;

  // =========================
  // EXPOSURE
  // =========================

  @IsNumber()
  @IsOptional()
  iso?: number | null;

  @IsString()
  @IsOptional()
  exposureTime?: string | null;

  @IsNumber()
  @IsOptional()
  exposureCompensation?: number | null;

  @IsString()
  @IsOptional()
  exposureProgram?: string | null;

  @IsString()
  @IsOptional()
  meteringMode?: string | null;

  @IsString()
  @IsOptional()
  exposureMode?: string | null;

  // =========================
  // CAMERA SETTINGS
  // =========================

  @IsString()
  @IsOptional()
  whiteBalance?: string | null;

  @IsString()
  @IsOptional()
  flash?: string | null;

  @IsNumber()
  @IsOptional()
  digitalZoomRatio?: number | null;

  // =========================
  // GPS
  // =========================

  @IsNumber()
  @IsOptional()
  gPSLatitude?: number | null;

  @IsNumber()
  @IsOptional()
  gPSLongitude?: number | null;

  @IsNumber()
  @IsOptional()
  gPSAltitude?: number | null;

  // =========================
  // COLOR / IMAGE DATA
  // =========================

  @IsString()
  @IsOptional()
  colorSpace?: string | null;

  @IsNumber()
  @IsOptional()
  bitsPerSample?: number | null;

  @IsNumber()
  @IsOptional()
  colorComponents?: number | null;

  @IsString()
  @IsOptional()
  yCbCrSubSampling?: string | null;

  // =========================
  // UNIQUE IDENTIFICATION
  // =========================

  @IsString()
  @IsOptional()
  imageUniqueID?: string | null;

  // =========================
  // ALBUM
  // =========================

  @IsString()
  @IsOptional()
  fileAlbums?: string | null;

  // =========================
  // SYSTEM
  // =========================

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsBoolean()
  @IsOptional()
  storageCheck?: boolean;
}
