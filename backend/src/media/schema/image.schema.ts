import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ImageDocument = HydratedDocument<Media>;

@Schema({ timestamps: true })
export class Media {
  // =========================
  // OWNERSHIP / FILE
  // =========================

  @Prop({
    type: Types.ObjectId,
    ref: 'user',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    default: 'Memoreis',
  })
  fileName!: string;

  @Prop({
    type: String,
    default: 'Memoreis',
  })
  originalFileName!: string;

  @Prop({
    type: String,
    default: null,
  })
  fileURL!: string | null;

  @Prop({
    type: Number,
    default: 0,
  })
  fileSize!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  convertedFileSize!: number;

  @Prop({
    type: String,
    default: 'Unknown',
  })
  format!: string;

  @Prop({
    type: [String],
    default: null,
  })
  aiTags!: string[] | null;

  @Prop({
    type: String,
    enum: ['Images', 'Videos'],
    required: true,
  })
  mediaType!: 'Images' | 'Videos';

  // =========================
  // DATES
  // =========================

  @Prop({
    type: Date,
    default: null,
  })
  dateTimeOriginal!: Date | null;

  @Prop({
    type: Date,
    default: null,
  })
  backUpDate!: Date | null;

  // =========================
  // GENERAL MEDIA DIMENSIONS
  // =========================

  @Prop({
    type: Number,
    default: 0,
  })
  fileXDimension!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  fileYDimension!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  megapixels!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  orientation!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  fileDuration!: number;

  // =========================
  // CAMERA
  // =========================

  @Prop({
    type: String,
    default: 'Unknown',
  })
  make!: string;

  @Prop({
    type: String,
    default: 'Unknown',
  })
  model!: string;

  @Prop({
    type: String,
    default: 'Unknown',
  })
  software!: string;

  // =========================
  // LENS
  // =========================

  @Prop({
    type: String,
    default: null,
  })
  focalLength!: string | null;

  @Prop({
    type: String,
    default: null,
  })
  focalLength35mm!: string | null;

  @Prop({
    type: Number,
    default: null,
  })
  fNumber!: number | null;

  // =========================
  // EXPOSURE
  // =========================

  @Prop({
    type: Number,
    default: null,
  })
  iso!: number | null;

  @Prop({
    type: String,
    default: null,
  })
  exposureTime!: string | null;

  @Prop({
    type: Number,
    default: null,
  })
  exposureCompensation!: number | null;

  @Prop({
    type: String,
    default: null,
  })
  exposureProgram!: string | null;

  @Prop({
    type: String,
    default: null,
  })
  meteringMode!: string | null;

  @Prop({
    type: String,
    default: null,
  })
  exposureMode!: string | null;

  // =========================
  // CAMERA SETTINGS
  // =========================

  @Prop({
    type: String,
    default: null,
  })
  whiteBalance!: string | null;

  @Prop({
    type: String,
    default: null,
  })
  flash!: string | null;

  @Prop({
    type: Number,
    default: null,
  })
  digitalZoomRatio!: number | null;

  // =========================
  // VIDEO
  // =========================

  @Prop({
    type: String,
    default: null,
  })
  fileTypeExtension!: string | null;

  @Prop({
    type: String,
    default: null,
  })
  mimeType!: string | null;

  @Prop({
    type: Number,
    default: null,
  })
  frameRate!: number | null;

  @Prop({
    type: String,
    default: null,
  })
  codec!: string | null;

  @Prop({
    type: Number,
    default: null,
  })
  avgBitrate!: number | null;

  @Prop({
    type: Number,
    default: null,
  })
  bitDepth!: number | null;

  @Prop({
    type: Number,
    default: null,
  })
  rotation!: number | null;

  // =========================
  // AUDIO
  // =========================

  @Prop({
    type: String,
    default: null,
  })
  audioFormat!: string | null;

  // =========================
  // COLOR
  // =========================

  @Prop({
    type: String,
    default: null,
  })
  colorProfiles!: string | null;

  @Prop({
    type: String,
    default: null,
  })
  colorPrimaries!: string | null;

  @Prop({
    type: String,
    default: null,
  })
  colorSpace!: string | null;

  @Prop({
    type: Number,
    default: null,
  })
  bitsPerSample!: number | null;

  @Prop({
    type: Number,
    default: null,
  })
  colorComponents!: number | null;

  @Prop({
    type: String,
    default: null,
  })
  yCbCrSubSampling!: string | null;

  // =========================
  // GPS
  // =========================

  @Prop({
    type: Number,
    default: null,
    index: true,
  })
  gPSLatitude!: number | null;

  @Prop({
    type: Number,
    default: null,
    index: true,
  })
  gPSLongitude!: number | null;

  @Prop({
    type: Number,
    default: null,
  })
  gPSAltitude!: number | null;

  @Prop({
    type: String,
    default: null,
  })
  gpsCoordinates!: string | null;

  @Prop({
    type: String,
    default: null,
  })
  zone!: string | null;

  // =========================
  // ALBUM
  // =========================

  @Prop({
    type: String,
    default: null,
    index: true,
  })
  fileAlbums!: string | null;

  // =========================
  // SYSTEM
  // =========================

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted!: boolean;
}

export const fileSchema = SchemaFactory.createForClass(Media);
