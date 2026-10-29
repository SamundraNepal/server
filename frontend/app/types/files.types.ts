export interface AlbumsDTO {
  _id: string;
  albumName: string;
  numberOfItems: number;
  isLocked: boolean;
  type: string;
}

export interface AlbumList {
  albumList: AlbumsDTO[];
}

export interface UploadFileDTO {
  file: File[];
}

export interface UploadingFilesDTO {
  id: string;
  file: File;
  progress: number;
  status: string;
}

export interface MediaResponseDTO {
  _id: string;
  // =========================
  // OWNERSHIP / FILE
  // =========================

  userId?: string;

  fileName?: string;

  originalFileName?: string;

  fileURL?: string;

  fileSize?: number;

  thumbnail?: string;

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

  fileDuration?: number;

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

  zone?: string;
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
}

export interface FileDataProps {
  _id: string;
  files: MediaResponseDTO[];
}

export interface MediaPageProps {
  data: FileDataProps[];
  mediaType: string;
  displayName: string;
  albumID: string;
}
