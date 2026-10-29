import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import convert from 'heic-convert';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  promises as fs,
} from 'fs';
import path, * as Path from 'path';
import { rename, unlink } from 'fs/promises';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import Busboy from 'busboy';
import { Media } from './schema/image.schema';
import { User } from 'src/user/schema/users.schema';
import * as os from 'os';
import { Request } from 'express';
import {
  CombineFileChunks,
  GenerateVideoThumbnailDTO,
  ReadVideoFIleMetaDataDTO,
  ReceiveImagesResult,
  StoreVideoFileDTO,
} from 'src/user/dto/uploadFile.dto';
import { DeleteFilesDTO } from 'src/user/dto/file.dto';
import { ExifDateTime, exiftool } from 'exiftool-vendored';
import Ffmpeg from 'fluent-ffmpeg';

interface AuthenticatedRequest extends Request {
  user: {
    userID: string;
  };
}

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Media.name)
    private mediaModel: Model<Media>,
    private configService: ConfigService,
  ) {}

  async ReceiveFileChunks(req: AuthenticatedRequest) {
    const userId = req.user.userID;

    const userModel = await this.userModel.findById(userId);

    if (!userModel) {
      throw new BadRequestException({ message: 'User Id does not exists' });
    }

    // we get storage early on
    // check Storage first
    // get user storage in bytes
    const userStorageInBytes = Number(userModel.storage) * 1024 ** 3;
    // get all the currentStorageSize
    const totalMediaCount = await this.mediaModel.aggregate<{ count: number }>([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $count: 'count',
      },
    ]);
    const currentStorageCount = totalMediaCount[0]?.count ?? 0;

    const storagePath =
      os.platform() == 'win32'
        ? this.configService.get<string>('STORAGE_PATH_WINDOWS')
        : this.configService.get<string>('STORAGE_PATH_LINUX');

    const hashID = createHash('sha256').update(userId).digest('hex');
    if (!storagePath) {
      throw new BadRequestException({
        message: 'STORAGE_PATH is not configured',
      });
    }
    const storageCenterPath = Path.join(storagePath, hashID);
    const userPath = Path.join(storagePath, hashID, 'Temp');

    if (!existsSync(userPath)) {
      throw new BadRequestException({
        message: 'Path does not exists',
      });
    }
    let fileType: string;
    let fileSignature: string;
    let fileId: string;
    let fileName: string;
    let chunkIndex: number;
    let totalChunks: number;
    let currentFileNumber: number;
    let totalFile: number;
    let albumID: string;
    let fileSize: number;

    const bb = Busboy({
      headers: req.headers,
    });

    return new Promise<ReceiveImagesResult>((resolve, reject) => {
      bb.on('field', (name, value) => {
        switch (name) {
          case 'fileSize':
            fileSize = Number(value);
            break;

          case 'fileType':
            fileType = value;
            break;

          case 'AlbumID':
            albumID = value;
            break;

          case 'TotalFile':
            totalFile = Number(value);
            break;

          case 'CurrentFileNumber':
            currentFileNumber = Number(value);
            break;

          case 'fileId':
            fileId = value;
            break;

          case 'fileSignature': {
            const hashFileSignature = createHash('sha256')
              .update(value)
              .digest('hex');
            fileSignature = hashFileSignature;
            break;
          }
          case 'fileName':
            fileName = value;

            break;

          case 'chunkIndex':
            chunkIndex = Number(value);
            break;

          case 'totalChunks':
            totalChunks = Number(value);
            break;
        }
      });

      bb.on('file', (name, file) => {
        // Prevention here

        // check storage here
        const convertMBToBytes = Number(fileSize) * 1024 * 1024;

        if (currentStorageCount + convertMBToBytes > userStorageInBytes) {
          console.log('Storage Exceeds');
          new BadRequestException({ message: 'Storage limit Exceed' });
        }

        // if file is not the following type reject it
        const extension = Path.extname(fileName).toLowerCase();
        switch (fileType) {
          case 'Images':
          case 'Album-Images':
            {
              const allowedExtensions = [
                '.jpg',
                '.jpeg',
                '.png',
                '.webp',
                '.heic',
                '.heif',
              ];

              if (!allowedExtensions.includes(extension)) {
                file.resume();

                console.log('Not a valid image type');
                reject(
                  new BadRequestException({
                    message: 'Only image files are allowed',
                    code: 400,
                  }),
                );

                return;
              }
            }
            break;
          case 'Videos':
          case 'Album-Videos':
            {
              const allowedExtensions = [
                '.mp4',
                '.mov',
                '.avi',
                '.mkv',
                '.webm',
                '.m4v',
                '.wmv',
                '.flv',
                '.3gp',
                '.mpeg',
                '.mpg',
              ];

              if (!allowedExtensions.includes(extension)) {
                file.resume();

                console.log('Not a valid image type');
                reject(
                  new BadRequestException({
                    message: 'Only image files are allowed',
                    code: 400,
                  }),
                );

                return;
              }
            }
            break;
        }

        file.on('error', reject);

        // Avoid writing in the disk

        const diskSession = userModel.uploadSession.find(
          (session) => session.fileSignature == fileSignature,
        );

        if (diskSession && diskSession.uploadedChunks.includes(chunkIndex)) {
          console.log(`Chunk ${chunkIndex} already exists`);

          // throw incoming chunk away
          file.resume();

          resolve({
            message: `Chunk ${chunkIndex} already exists`,
            code: 200,
          });

          return; // dont write it
        }

        // If this is an existing upload session,
        // use its original fileId.

        if (diskSession) {
          fileId = diskSession.fileId;
        }

        // Don't create the filename until the metadata is available.
        const chunkPath = Path.join(userPath, `${fileId}-chunk-${chunkIndex}`);

        const writeStream = createWriteStream(chunkPath);
        file.pipe(writeStream);

        writeStream.on('finish', () => {
          void (async () => {
            try {
              let session = userModel.uploadSession.find(
                (session) => session.fileSignature === fileSignature,
              );

              if (!session) {
                session = {
                  fileSignature,
                  fileId,
                  totalChunks,
                  uploadedChunks: [chunkIndex],
                };

                userModel.uploadSession.push(session);
              } else {
                if (!session.uploadedChunks.includes(chunkIndex)) {
                  session.uploadedChunks.push(chunkIndex);
                }
              }

              await userModel.save();

              console.log(`Chunk ${chunkIndex} saved out of ${totalChunks}`);

              if (session.uploadedChunks.length === totalChunks) {
                resolve({
                  message: 'uploaded successfully',
                  data: {
                    fileType,
                    albumID,
                    totalFile,
                    currentFileNumber,
                    fileSignature,
                    fileId,
                    fileName,
                    totalChunks,
                    userPath,
                    centerStoragePath: storageCenterPath,
                    userID: userId,
                    status: 'complete',
                  },
                  code: 201,
                });

                return;
              }

              resolve({
                message: `Chunk ${chunkIndex} uploaded successfully ${session.uploadedChunks.length}`,
                code: 201,
              });
            } catch (error) {
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          })();
        });

        writeStream.on('error', (error) => {
          reject(error);
          console.error('Failed to save chunk:', error);
        });
      });

      bb.on('error', (error: unknown) => {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error(String(error)));
        }
      });

      // VERY IMPORTANT
      req.pipe(bb);
    });
  }

  async CombineFileChunks(combineFileData: CombineFileChunks) {
    const extension = Path.extname(combineFileData.fileName);
    const outputpath = Path.join(
      combineFileData.userPath,
      `${combineFileData.fileId}-combined${extension}`,
    );

    const writeStream = createWriteStream(outputpath);

    for (let i = 0; i < combineFileData.totalChunks; i++) {
      const chunksPath = Path.join(
        combineFileData.userPath,
        `${combineFileData.fileId}-chunk-${i}`,
      );

      await new Promise<void>((resolve, reject) => {
        const readStream = createReadStream(chunksPath);
        readStream.on('error', reject);
        readStream.on('end', resolve);

        // Don't close the output stream after each chunk
        readStream.pipe(writeStream, {
          end: false,
        });
      });
    }

    // All chunks have been written
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);

      writeStream.end();
    });

    console.log(`Combined file: ${outputpath}`);

    // delete the older paths
    for (let i = 0; i < combineFileData.totalChunks; i++) {
      const chunksPath = Path.join(
        combineFileData.userPath,
        `${combineFileData.fileId}-chunk-${i}`,
      );

      await unlink(chunksPath);
    }

    // delete the upload session saved in the database
    const user = await this.userModel.findById(combineFileData.userID);

    if (!user) {
      throw new BadRequestException({ message: 'User does not exists' });
    }

    const uploadSessionData = user.uploadSession.find(
      (session) => session.fileSignature == combineFileData.fileSignature,
    );

    if (uploadSessionData) {
      user.uploadSession = user.uploadSession.filter(
        (session) => session.fileSignature !== combineFileData.fileSignature,
      );
    }

    await user.save();

    return {
      outputpath,
      ...combineFileData,
      extension,
    };
  }

  async convertImageFile(inputPath: string, outputPath: string) {
    const extension = Path.extname(inputPath).toLowerCase();

    if (extension === '.heic' || extension === '.heif') {
      console.log('🟡 HEIC Conversion starting...');
      const inputBuffer = await fs.readFile(inputPath);

      const outputBuffer = await convert({
        buffer: inputBuffer!,
        format: 'JPEG',
        quality: 0.3,
      });

      await fs.writeFile(outputPath, outputBuffer);
    } else {
      console.log('🟡 Conversion starting...');

      const inputBuffer = await fs.readFile(inputPath);

      await sharp(inputBuffer)
        .rotate()
        .jpeg({ quality: 30, mozjpeg: true })
        .toFile(outputPath);
    }

    console.log('🟢 Conversion finished!');

    return outputPath;
  }

  async ReadImageFileMetaData(inputPath: string, convertedPath: string) {
    if (!inputPath || !convertedPath) return;

    // Original image metadata
    const metadata = await exiftool.read(inputPath);
    const statsOriginal = await fs.stat(inputPath);
    const statsConverted = await fs.stat(convertedPath);

    const mediaData = {
      make: metadata.Make,
      model: metadata.Model,
      software: metadata.Software,

      format: metadata.MIMEType,

      fileSize: statsOriginal.size ?? 0,
      convertedFileSize: statsConverted.size ?? 0,

      dateTimeOriginal:
        metadata.DateTimeOriginal instanceof ExifDateTime
          ? metadata.DateTimeOriginal.toDate()
          : null,
      fileXDimension: metadata.ImageWidth,
      fileYDimension: metadata.ImageHeight,

      megapixels: metadata.Megapixels,

      orientation: metadata.Orientation,

      focalLength: metadata.FocalLength,
      focalLength35mm: metadata.FocalLengthIn35mmFormat,
      fNumber: metadata.FNumber,

      iso: metadata.ISO,
      exposureTime: metadata.ExposureTime,
      exposureCompensation: this.toNumberOrNull(metadata.ExposureCompensation),
      exposureProgram: metadata.ExposureProgram?.toString(),
      meteringMode: metadata.MeteringMode?.toString(),
      exposureMode: metadata.ExposureMode,

      whiteBalance: metadata.WhiteBalance?.toString(),
      flash: metadata.Flash?.toString(),
      digitalZoomRatio: metadata.DigitalZoomRatio,

      gPSLatitude: this.toNumberOrNull(metadata.GPSLatitude),
      gPSLongitude: this.toNumberOrNull(metadata.GPSLongitude),
      gPSAltitude: this.toNumberOrNull(metadata.GPSAltitude),

      colorSpace: metadata.ColorSpace?.toString(),
      bitsPerSample: metadata.BitsPerSample,
      colorComponents: metadata.ColorComponents,
      yCbCrSubSampling: metadata.YCbCrSubSampling,

      imageUniqueID: metadata.ImageUniqueID,
    };

    return mediaData;
  }

  //converts the LAT and LONG and ALTITUDE into numbers

  private toNumberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  };

  // get images data
  async GetFilessData(
    userID: string,
    pageNumber: number,
    PageDataLimit: number,
    mediaType: string,
  ) {
    const page = Number(pageNumber);
    const limit = Number(PageDataLimit);

    const skip = (page - 1) * limit;

    const data = await this.mediaModel.aggregate([
      {
        $match: {
          userId: userID,
          isDeleted: false,
          mediaType: mediaType,

          $or: [
            { fileAlbums: '' },
            { fileAlbums: null },
            { fileAlbums: { $exists: false } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,

          // FILE
          originalFileName:1,
          fileName: 1,
          fileURL: 1,
          convertedFileSize: 1,
          fileSize: 1,
          format: 1,
          mediaType: 1,
          fileDuration: 1,
          zone: 1,
          // DATES
          backUpDate: 1,
          dateTimeOriginal: 1,

          // IMAGE DIMENSIONS
          fileXDimension: 1,
          fileYDimension: 1,
          megapixels: 1,
          orientation: 1,

          // CAMERA
          make: 1,
          model: 1,
          software: 1,

          // LENS
          focalLength: 1,
          focalLength35mm: 1,
          fNumber: 1,

          // EXPOSURE
          iso: 1,
          exposureTime: 1,
          exposureCompensation: 1,
          exposureProgram: 1,
          meteringMode: 1,
          exposureMode: 1,

          // CAMERA SETTINGS
          whiteBalance: 1,
          flash: 1,
          digitalZoomRatio: 1,

          // GPS
          gPSLatitude: 1,
          gPSLongitude: 1,
          gPSAltitude: 1,

          // COLOR / IMAGE DATA
          colorSpace: 1,
          bitsPerSample: 1,
          colorComponents: 1,
          yCbCrSubSampling: 1,
          imageUniqueID: 1,

          // ALBUM
          fileAlbums: 1,
        },
      },
      { $sort: { dateTimeOriginal: -1 } },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$dateTimeOriginal',
            },
          },
          files: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    return { data };
  }

  async GetVideosData(userID: string) {
    const page = 1;
    const limit = 50;

    const skip = (page - 1) * limit;

    const data = await this.mediaModel.aggregate([
      {
        $match: {
          userId: userID,
          isDeleted: false,
          mediaType: 'Videos',

          $or: [
            { fileAlbums: '' },
            { fileAlbums: null },
            { fileAlbums: { $exists: false } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,

          // FILE
          originalFileName:1,
          fileName: 1,
          fileURL: 1,
          convertedFileSize: 1,
          fileSize: 1,
          format: 1,
          mediaType: 1,
          thumbnail: 1,
          // DATES
          backUpDate: 1,
          dateTimeOriginal: 1,
          fileDuration: 1,
          // IMAGE DIMENSIONS
          fileXDimension: 1,
          fileYDimension: 1,
          megapixels: 1,
          orientation: 1,

          // CAMERA
          make: 1,
          model: 1,
          software: 1,

          // LENS
          focalLength: 1,
          focalLength35mm: 1,
          fNumber: 1,

          // EXPOSURE
          iso: 1,
          exposureTime: 1,
          exposureCompensation: 1,
          exposureProgram: 1,
          meteringMode: 1,
          exposureMode: 1,

          // CAMERA SETTINGS
          whiteBalance: 1,
          flash: 1,
          digitalZoomRatio: 1,

          // GPS
          gPSLatitude: 1,
          gPSLongitude: 1,
          gPSAltitude: 1,
          zone: 1,

          // COLOR / IMAGE DATA
          colorSpace: 1,
          bitsPerSample: 1,
          colorComponents: 1,
          yCbCrSubSampling: 1,
          imageUniqueID: 1,

          // ALBUM
          fileAlbums: 1,
        },
      },
      { $sort: { dateTimeOriginal: -1 } },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$dateTimeOriginal',
            },
          },
          files: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    return { data };
  }

  async DeleteAndRestoreFiles(fileID: DeleteFilesDTO) {
    if (!fileID.fileID) {
      throw new BadRequestException({
        message: 'No image file ID found',
      });
    }
    const mediaFile = await this.mediaModel.findById(fileID.fileID);
    if (!mediaFile) {
      throw new BadRequestException({ message: 'No Image found' });
    }

    switch (fileID.methodType) {
      case 'DELETE':
        // this will delete file temopary and will be saved in trash
        mediaFile.isDeleted = true;
        mediaFile.fileAlbums = '';
        await mediaFile.save();
        break;

      case 'RESTORE':
        mediaFile.isDeleted = false;
        await mediaFile.save();

        break;

      case 'PDELETE':
        {
          // get Storage path
          const storagePath =
            os.platform() == 'win32'
              ? this.configService.get<string>('STORAGE_PATH_WINDOWS')
              : this.configService.get<string>('STORAGE_PATH_LINUX');

          if (!storagePath) {
            throw new BadRequestException({
              message: 'STORAGE_PATH is not configured',
            });
          }
          // hash the path to match user specefic folder id
          const hashID = createHash('sha256')
            .update(mediaFile.userId.toString())
            .digest('hex');

          // first find the folder...
          // find the file...
          // delete the file both converted and original file...
          const originalFilePath = Path.join(
            storagePath,
            hashID,
            `${mediaFile.mediaType === 'Images' ? 'OriginalImages' : 'OriginalVideos'}`,
            mediaFile.originalFileName,
          );

          const convertedFilePath = Path.join(
            storagePath,
            hashID,
            mediaFile.mediaType,
            mediaFile.fileURL!,
          );
          console.log(convertedFilePath);

          if (!existsSync(convertedFilePath)) {
            console.log('Converted file Path does not exists');
            throw new BadRequestException({
              message: 'Converted file Path does not exists',
            });
          }

          if (!existsSync(originalFilePath)) {
            console.log('original file Path does not exists');

            throw new BadRequestException({
              message: 'original file path Path does not exists',
            });
          }

          try {
            await unlink(convertedFilePath);
            await unlink(originalFilePath);

            // delete thumnail as well if its video type
            if (mediaFile.mediaType === 'Videos') {
              const thumbnailPath = Path.join(
                storagePath,
                hashID,
                'Thumbnails',
                mediaFile.fileName,
              );

              if (!existsSync(thumbnailPath)) {
                console.log('Thumbnail file Path does not exists');

                throw new BadRequestException({
                  message: 'Thumbnail file path Path does not exists',
                });
              }

              await unlink(thumbnailPath);
            }
            await mediaFile.deleteOne();

            console.log(
              `${mediaFile.userId.toString()} File deleted Permanently`,
            );
          } catch (error) {
            console.log('Failed to delete file:', error);
          }
        }

        break;
    }
  }

  // get deleted files

  async getDeletedFiles(userID: string) {
    if (!userID) {
      throw new BadRequestException({ message: 'Invalid user ID' });
    }

    const mediaFiles = await this.mediaModel.aggregate([
      {
        $match: {
          userId: userID,
          isDeleted: true,
          mediaType: { $in: ['Images', 'Videos'] },
        },
      },

      {
        $project: {
          _id: 1,
          userId: 1,

          // FILE
          originalFileName:1,
          fileName: 1,
          fileURL: 1,
          convertedFileSize: 1,
          fileSize: 1,
          format: 1,
          mediaType: 1,

          // DATES
          backUpDate: 1,
          dateTimeOriginal: 1,

          // IMAGE DIMENSIONS
          fileXDimension: 1,
          fileYDimension: 1,
          megapixels: 1,
          orientation: 1,

          // CAMERA
          make: 1,
          model: 1,
          software: 1,

          // LENS
          focalLength: 1,
          focalLength35mm: 1,
          fNumber: 1,

          // EXPOSURE
          iso: 1,
          exposureTime: 1,
          exposureCompensation: 1,
          exposureProgram: 1,
          meteringMode: 1,
          exposureMode: 1,

          // CAMERA SETTINGS
          whiteBalance: 1,
          flash: 1,
          digitalZoomRatio: 1,

          // GPS
          gPSLatitude: 1,
          gPSLongitude: 1,
          gPSAltitude: 1,

          // COLOR / IMAGE DATA
          colorSpace: 1,
          bitsPerSample: 1,
          colorComponents: 1,
          yCbCrSubSampling: 1,
          imageUniqueID: 1,

          // ALBUM
          fileAlbums: 1,
        },
      },
      { $sort: { dateTimeOriginal: -1 } },

      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$dateTimeOriginal',
            },
          },
          files: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    return { mediaFiles };
  }

  // for video Processing

  async GenerateVideoThumbnails(data: GenerateVideoThumbnailDTO) {
    const thumbnailName = (`${data.fileId}.jpg`).toLowerCase();
    const thumbnailFolder = path.join(data.centerStoragePath, 'Thumbnails');

    if (os.platform() == 'win32') {
      Ffmpeg.setFfmpegPath(
        'C:\\Users\\samun\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe',
      );
    } else {
      Ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
    }

    await new Promise<void>((resolve, reject) => {
      Ffmpeg(data.outputpath)
        .screenshots({
          timestamps: ['00:00:02'],
          filename: thumbnailName,
          folder: thumbnailFolder,
          size: '640x?',
        })
        .on('end', () => {
          console.log(
            'Thumbnail generated:',
            'Name:',
            thumbnailName,
            'path :',
            thumbnailFolder,
          );
          resolve();
        })
        .on('error', (error, stdout, stderr) => {
          console.error('FFmpeg ERROR:', error);
          console.error('FFmpeg STDOUT:', stdout);
          console.error('FFmpeg STDERR:', stderr);

          reject(error);
        });
    });

    return { ...data, thumbnailFolder };
  }

  async ReadVideoFileMetaData(data: ReadVideoFIleMetaDataDTO) {
    const metadata = await exiftool.read(data.outputpath);
    const statsOriginal = await fs.stat(data.outputpath);

    const mediaData = {
      // =========================
      // FILE
      // =========================
      fileName: metadata.FileName,
      fileType: metadata.FileType,
      fileTypeExtension: metadata.FileTypeExtension,
      mimeType: metadata.MIMEType,

      fileSize: statsOriginal.size ?? 0,
      convertedFileSize: 0,

      // =========================
      // DEVICE
      // =========================
      make: metadata.Model ?? metadata.Author ?? 'Unknown',
      software: metadata.Software ?? 'Unknown',

      // =========================
      // VIDEO
      // =========================
      format: metadata.MIMEType,

      fileXDimension: metadata.ImageWidth ?? 0,
      fileYDimension: metadata.ImageHeight ?? 0,

      megapixels: metadata.Megapixels ?? 0,

      fileDuration: Number(metadata.Duration) || 0,

      frameRate: Number(metadata.VideoFrameRate) || 0,

      codec: metadata.CompressorID ?? null,

      avgBitrate: Number(metadata.AvgBitrate) || 0,

      bitDepth: metadata.BitDepth ?? null,

      rotation: metadata.Rotation ?? null,

      // =========================
      // DATE / TIME
      // =========================
      dateTimeOriginal:
        metadata.CreateDate instanceof ExifDateTime
          ? metadata.CreateDate.toDate()
          : null,

      // =========================
      // LOCATION
      // =========================
      gPSLatitude: this.toNumberOrNull(metadata.GPSLatitude),
      gPSLongitude: this.toNumberOrNull(metadata.GPSLongitude),
      gPSAltitude: this.toNumberOrNull(metadata.GPSAltitude),

      gpsCoordinates: metadata.GPSCoordinates ?? null,
      zone: metadata.zone ?? metadata.zoneSource ?? null,

      // =========================
      // AUDIO
      // =========================
      audioFormat: metadata.AudioFormat ?? null,

      // =========================
      // COLOR
      // =========================
      colorProfiles: metadata.ColorProfiles ?? null,
      colorPrimaries: metadata.ColorPrimaries ?? null,
    };

    return { ...mediaData, ...data };
  }

  async StoreVideoFile(data: StoreVideoFileDTO) {
    if (!data) return;

    const fileName = `${data.fileId}.jpg`;
    const videoSchemaData = await this.mediaModel.create({
      // =========================
      // OWNERSHIP / FILE
      // =========================

      userId: data.userID,

      fileName: fileName.toLowerCase(),
      originalFileName: data.fileName.toLowerCase(),

      fileURL: null,

      fileSize: data.fileSize,
      convertedFileSize: data.convertedFileSize ?? 0,

      format: data.format,
      mediaType: 'Videos',

      fileDuration: data.fileDuration ?? 0,

      // =========================
      // DATES
      // =========================

      dateTimeOriginal: data.dateTimeOriginal ?? Date.now(),
      backUpDate: Date.now(),

      // =========================
      // VIDEO DIMENSIONS
      // =========================

      fileXDimension: data.fileXDimension ?? 0,
      fileYDimension: data.fileYDimension ?? 0,
      megapixels: data.megapixels ?? 0,
      orientation: data.orientation ?? 0,

      // =========================
      // CAMERA / DEVICE
      // =========================

      make: data.make ?? 'Unknown',
      model: data.model ?? 'Unknown',
      software: data.software ?? 'Unknown',

      // =========================
      // LENS
      // =========================

      focalLength: data.focalLength ?? null,
      focalLength35mm: data.focalLength35mm ?? null,
      fNumber: data.fNumber ?? null,

      // =========================
      // EXPOSURE
      // =========================

      iso: data.iso ?? null,
      exposureTime: data.exposureTime ?? null,
      exposureCompensation: data.exposureCompensation ?? null,
      exposureProgram: data.exposureProgram ?? null,
      meteringMode: data.meteringMode ?? null,
      exposureMode: data.exposureMode ?? null,

      // =========================
      // CAMERA SETTINGS
      // =========================

      whiteBalance: data.whiteBalance ?? null,
      flash: data.flash ?? null,
      digitalZoomRatio: data.digitalZoomRatio ?? null,

      // =========================
      // VIDEO
      // =========================

      fileTypeExtension: data.fileTypeExtension ?? '',
      mimeType: data.mimeType ?? null,

      frameRate: data.frameRate ?? null,
      codec: data.codec ?? null,
      avgBitrate: data.avgBitrate ?? 0,
      bitDepth: data.bitDepth ?? null,
      rotation: data.rotation ?? null,

      // =========================
      // AUDIO
      // =========================

      audioFormat: data.audioFormat ?? null,

      // =========================
      // COLOR
      // =========================

      colorProfiles: data.colorProfiles ?? null,
      colorPrimaries: data.colorPrimaries ?? null,

      colorSpace: data.colorSpace ?? null,
      bitsPerSample: data.bitsPerSample ?? null,
      colorComponents: data.colorComponents ?? null,
      yCbCrSubSampling: data.yCbCrSubSampling ?? null,

      // =========================
      // GPS
      // =========================

      gPSLatitude: data.gPSLatitude ?? 0,
      gPSLongitude: data.gPSLongitude ?? 0,
      gPSAltitude: data.gPSAltitude ?? 0,

      gpsCoordinates: data.gpsCoordinates ?? null,
      zone: data.zone ?? null,

      // =========================
      // ALBUM
      // =========================

      fileAlbums: data.albumID ?? null,

      // =========================
      // SYSTEM
      // =========================

      isDeleted: data.isDeleted ?? false,
    });

    data.fileName = videoSchemaData._id.toString();

    return { ...data, thumbailFileName: videoSchemaData.fileName };
  }

  async ConvertVideoFile(data: StoreVideoFileDTO) {

    const fileName = (`${data.fileId}.mp4`).toLowerCase();
    const convertedStorePath = path.join(
      data.centerStoragePath,
      'Videos',
      fileName,
    );
    const originalStorePath = path.join(
      data.centerStoragePath,
      'OriginalVideos',
      fileName,
    );

    // find the document first
    const updateVideoSchema = await this.mediaModel.findById(data.fileName);

    await new Promise<void>((resolve, reject) => {
      Ffmpeg(data.outputpath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .output(convertedStorePath)
        .outputOptions([
          '-crf 26',
          '-preset medium',
          '-vf scale=-2:1080',
          '-movflags +faststart',
        ])

        .on('end', () => {
          if (!updateVideoSchema) {
            resolve();
            return;
          }

          // read the file for it size only
          // work on this

          void (async () => {
            try {
              const statsOriginal = await fs.stat(convertedStorePath);

              updateVideoSchema.fileURL = fileName;
              updateVideoSchema.originalFileName = fileName;
              updateVideoSchema.convertedFileSize =
                Number(statsOriginal.size) | 0;

              await updateVideoSchema.save();

              console.log('Database updated');

              resolve();
            } catch (error: any) {
              reject(error);
            }
          })();
        })
        .on('error', (error, stdout, stderr) => {
          console.error('FFmpeg ERROR:', error);
          console.error('FFmpeg STDOUT:', stdout);
          console.error('FFmpeg STDERR:', stderr);

          reject(error);
        })
        .run();
    });

    await rename(data.outputpath, originalStorePath);
  }

  // find search file
  async GetSearchFiles(
    searchText: string,
    mediaType: string,
    userID: string,
    pageNumber: number,
    PageDataLimit: number,
    albumId: string,
  ) {
    if (!userID) {
      throw new BadRequestException({ message: 'Invalid user' });
    }

    const media =
      mediaType === 'Images' || mediaType === 'Album-Images'
        ? 'Images'
        : 'Videos';

    // filter this words out
    const stopWords = [
      'with',
      'the',
      'a',
      'an',
      'in',
      'on',
      'of',
      'this',
      'is',
    ];

    const searchTags = searchText
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word && !stopWords.includes(word));

    if (searchTags.length === 0) {
      return [];
    }

    const page = Number(pageNumber);
    const limit = Number(PageDataLimit);
    const skip = (page - 1) * limit;

    const data = await this.mediaModel.aggregate([
      {
        $match: {
          userId: userID,
          isDeleted: false,
          mediaType: media,

          $or: [{ fileAlbums: albumId }],
        },
      },

      // Normalize stored tags to lowercase
      {
        $addFields: {
          normalizedAiTags: {
            $map: {
              input: { $ifNull: ['$aiTags', []] },
              as: 'tag',
              in: { $toLower: '$$tag' },
            },
          },
        },
      },

      // Calculate how many search tags each file matches
      {
        $addFields: {
          matchScore: {
            $size: {
              $setIntersection: ['$normalizedAiTags', searchTags],
            },
          },
        },
      },

      // Exclude files without matching tags
      {
        $match: {
          matchScore: { $gt: 0 },
        },
      },

      // Best matches first; newest first for ties
      {
        $sort: {
          matchScore: -1,
          dateTimeOriginal: -1,
        },
      },

      // Pagination applies to ranked files
      { $skip: skip },
      { $limit: limit },

      {
        $project: {
          _id: 1,
          userId: 1,

          // FILE
          originalFileName:1,
          fileName: 1,
          fileURL: 1,
          convertedFileSize: 1,
          fileSize: 1,
          format: 1,
          mediaType: 1,
          fileDuration: 1,
          zone: 1,

          // DATES
          backUpDate: 1,
          dateTimeOriginal: 1,

          // IMAGE DIMENSIONS
          fileXDimension: 1,
          fileYDimension: 1,
          megapixels: 1,
          orientation: 1,

          // CAMERA
          make: 1,
          model: 1,
          software: 1,

          // LENS
          focalLength: 1,
          focalLength35mm: 1,
          fNumber: 1,

          // EXPOSURE
          iso: 1,
          exposureTime: 1,
          exposureCompensation: 1,
          exposureProgram: 1,
          meteringMode: 1,
          exposureMode: 1,

          // CAMERA SETTINGS
          whiteBalance: 1,
          flash: 1,
          digitalZoomRatio: 1,

          // GPS
          gPSLatitude: 1,
          gPSLongitude: 1,
          gPSAltitude: 1,

          // COLOR / IMAGE DATA
          colorSpace: 1,
          bitsPerSample: 1,
          colorComponents: 1,
          yCbCrSubSampling: 1,
          imageUniqueID: 1,

          // ALBUM
          fileAlbums: 1,

          // AI TAGS
          aiTags: 1,
        },
      },

      // Group files by date, preserving your existing response structure
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$dateTimeOriginal',
            },
          },
          files: { $push: '$$ROOT' },
        },
      },

      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    return { data };
  }
}
