export class CombineChunksDTO {
  fileSignature!: string;
  fileId!: string;
  fileName!: string;
  totalChunks!: string;
  chunkPath!: number;
  userID!: string;
  status!: string;
}

export interface ReceiveImagesResult {
  message: string;
  data?: {
    fileType: string;
    albumID: string;
    totalFile: number;
    currentFileNumber: number;
    fileSignature: string;
    fileId: string;
    fileName: string;
    totalChunks: number;
    userPath: string;
    centerStoragePath: string;
    userID: string;
    status: string;
  };
  code: number;
}

export interface CombineFileChunks {
  fileType: string;
  albumID: string;
  totalFile: number;
  currentFileNumber: number;
  fileSignature: string;
  fileId: string;
  fileName: string;
  totalChunks: number;
  userPath: string;
  centerStoragePath: string;
  userID: string;
  status: string;
}

export class ConvertCombineImageFileDTO {
  outputpath!: string;
  albumID!: string;

  totalFile!: number;

  currentFileNumber!: number;

  fileSignature!: string;

  fileId!: string;

  fileName!: string;

  totalChunks!: number;

  userPath!: string;

  centerStoragePath!: string;

  userID!: string;

  status!: string;
  extension!: string;
}

export class GetImageMetaDataDTO {
  originalImagePath!: string;
  convertedImagePath!: string;
  albumID!: string;

  totalFile!: number;

  currentFileNumber!: number;

  fileSignature!: string;

  fileId!: string;

  fileName!: string;

  totalChunks!: number;

  userPath!: string;

  centerStoragePath!: string;

  userID!: string;

  status!: string;
}

export class StoreImagesDTO {
  // =========================
  // OWNERSHIP / FILE
  // =========================

  userId?: string;

  fileName?: string;

  originalFileName?: string;

  fileURL?: string;

  fileSize?: number;

  convertedFileSize?: number;

  format?: string;

  mediaType?: string;

  // =========================
  // DATES
  // =========================

  dateTimeOriginal?: Date | null;

  backUpDate?: Date | null;

  // =========================
  // IMAGE DIMENSIONS
  // =========================

  fileXDimension?: number;

  fileYDimension?: number;

  megapixels?: number;

  orientation?: number;

  // =========================
  // CAMERA
  // =========================

  make?: string;

  model?: string;

  software?: string;

  // =========================
  // LENS
  // =========================

  focalLength?: string | null;

  focalLength35mm?: string | null;

  fNumber?: number | null;

  // =========================
  // EXPOSURE
  // =========================

  iso?: number | null;

  exposureTime?: string | null;

  exposureCompensation?: number | null;

  exposureProgram?: string | null;

  meteringMode?: string | null;

  exposureMode?: string | null;

  // =========================
  // CAMERA SETTINGS
  // =========================

  whiteBalance?: string | null;

  flash?: string | null;

  digitalZoomRatio?: number | null;

  // =========================
  // GPS
  // =========================

  gPSLatitude?: number | null;

  gPSLongitude?: number | null;

  gPSAltitude?: number | null;

  // =========================
  // COLOR / IMAGE DATA
  // =========================

  colorSpace?: string | null;

  bitsPerSample?: number | null;

  colorComponents?: number | null;

  yCbCrSubSampling?: string | null;

  // =========================
  // ALBUM
  // =========================

  fileAlbums?: string | null;

  // =========================
  // SYSTEM
  // =========================

  isDeleted?: boolean;

  storageCheck?: boolean;

  originalImagePath?: string;
  convertedImagePath?: string;
  albumID?: string;
  totalFile?: number;
  currentFileNumber?: number;
  fileSignature?: string;
  fileId?: string;
  totalChunks?: number;
  userPath?: string;
  userID?: string;
  status?: string;
  centerStoragePath?: string;
}

// video processing

export class GenerateVideoThumbnailDTO {
  outputpath!: string;
  albumID!: string;

  totalFile!: number;

  currentFileNumber!: number;

  fileSignature!: string;

  fileId!: string;

  fileName!: string;

  totalChunks!: number;

  userPath!: string;

  centerStoragePath!: string;

  userID!: string;

  status!: string;
  extension!: string;
}

export class ReadVideoFIleMetaDataDTO {
  outputpath!: string;
  albumID!: string;

  totalFile!: number;

  currentFileNumber!: number;

  fileSignature!: string;

  fileId!: string;

  fileName!: string;

  totalChunks!: number;

  userPath!: string;

  centerStoragePath!: string;

  userID!: string;

  status!: string;
  extension!: string;

  thumbnailFolder!: string;
}

export class StoreVideoFileDTO {
  outputpath!: string;

  albumID!: string;

  totalFile!: number;

  currentFileNumber!: number;

  fileSignature!: string;

  fileId!: string;

  fileName!: string;

  totalChunks!: number;

  userPath!: string;

  centerStoragePath!: string;

  userID!: string;

  status!: string;

  extension!: string;

  thumbnailFolder!: string;

  // =========================
  // OWNERSHIP / FILE
  // =========================

  userId?: string;

  originalFileName?: string;

  fileURL?: string;

  fileSize?: number;

  convertedFileSize?: number;

  format?: string;

  mediaType?: string;

  fileDuration?: number;

  fileTypeExtension?: string | null;

  mimeType?: string | null;

  // =========================
  // DATES
  // =========================

  dateTimeOriginal?: Date | null;

  backUpDate?: Date | null;

  // =========================
  // VIDEO / MEDIA DIMENSIONS
  // =========================

  fileXDimension?: number;

  fileYDimension?: number;

  megapixels?: number;

  orientation?: number;

  // =========================
  // CAMERA
  // =========================

  make?: string;

  model?: string;

  software?: string;

  // =========================
  // LENS
  // =========================

  focalLength?: string | null;

  focalLength35mm?: string | null;

  fNumber?: number | null;

  // =========================
  // EXPOSURE
  // =========================

  iso?: number | null;

  exposureTime?: string | null;

  exposureCompensation?: number | null;

  exposureProgram?: string | null;

  meteringMode?: string | null;

  exposureMode?: string | null;

  // =========================
  // CAMERA SETTINGS
  // =========================

  whiteBalance?: string | null;

  flash?: string | null;

  digitalZoomRatio?: number | null;

  // =========================
  // VIDEO
  // =========================

  frameRate?: number | null;

  codec?: string | null;

  avgBitrate?: number | null;

  bitDepth?: number | null;

  rotation?: number | null;

  // =========================
  // AUDIO
  // =========================

  audioFormat?: string | null;

  // =========================
  // GPS
  // =========================

  gPSLatitude?: number | null;

  gPSLongitude?: number | null;

  gPSAltitude?: number | null;

  gpsCoordinates?: string | null;

  zone?: string | null;

  // =========================
  // COLOR / IMAGE DATA
  // =========================

  colorProfiles?: string | null;

  colorPrimaries?: string | null;

  colorSpace?: string | null;

  bitsPerSample?: number | null;

  colorComponents?: number | null;

  yCbCrSubSampling?: string | null;

  // =========================
  // ALBUM
  // =========================

  fileAlbums?: string | null;

  // =========================
  // SYSTEM
  // =========================

  isDeleted?: boolean;

  storageCheck?: boolean;
}
