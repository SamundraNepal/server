import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDB = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    default: new Date(),
  })
  accountCreatedDate!: string;

  @Prop({
    required: true,
    enum: ['local', 'google'],
    default: 'local',
  })
  authProvider!: 'local' | 'google';

  @Prop({
    required: true,
    default: false,
  })
  isAdmin!: boolean;

  @Prop({
    required: true,
  })
  firstName!: string;

  @Prop({
    required: false,
  })
  lastName!: string;

  @Prop({
    required: true,
    unique: true,
  })
  emailAddress!: string;

  @Prop({
    required: false,
    sparse: true,
    unique: true,
  })
  googleId?: string;

  @Prop({
    required: false,
  })
  password!: string;

  @Prop({
    required: false,
  })
  imageLink!: string;

  @Prop({
    type: [
      {
        albumName: {
          type: String,
          default: '',
        },
        isLocked: {
          type: Boolean,
          default: false,
        },
        albumPassword: {
          type: String,
          default: '',
        },

        numberOfItems: {
          type: Number,
          default: 0,
        },

        type: {
          type: String,
          enum: ['Images', 'Videos'],
          default: 'Videos',
        },
      },
    ],
  })
  videoAlbums!: {
    _id?: Types.ObjectId;
    albumName: string;
    isLocked: boolean;
    albumPassword: string;
    numberOfItems: number;
    type: string;
  }[];

  @Prop({
    default: 1,
  })
  storage!: number;

  @Prop({
    default: false,
  })
  isUserActive!: boolean;

  @Prop({
    type: [
      {
        albumName: {
          type: String,
          default: '',
        },
        isLocked: {
          type: Boolean,
          default: false,
        },
        albumPassword: {
          type: String,
          default: '',
        },

        numberOfItems: {
          type: Number,
          default: 0,
        },

        type: {
          type: String,
          enum: ['Images', 'Videos'],
          default: 'Images',
        },
      },
    ],
  })
  photoAlbums!: {
    _id?: Types.ObjectId;
    albumName: string;
    isLocked: boolean;
    albumPassword: string;
    numberOfItems: number;
    type: string;
  }[];

  // Tracks upload session

  // Tracks upload sessions
  @Prop({
    type: [
      {
        fileSignature: {
          type: String,
          required: true,
        },
        fileId: {
          type: String,
          required: true,
        },
        totalChunks: {
          type: Number,
          required: true,
        },
        uploadedChunks: {
          type: [Number],
          default: [],
        },
      },
    ],
    default: [],
  })
  uploadSession!: {
    fileSignature: string;
    fileId: string;
    totalChunks: number;
    uploadedChunks: number[];
  }[];

  //  FOR OTP AND VERIFICATIONS
  @Prop({ type: String, default: null })
  userVerificationToken!: string | null;
  @Prop({ type: String, default: null })
  oneTimeVerificationToken!: string | null;
  @Prop({ type: Date, default: null })
  oneTimeVerificationTokenExpire!: Date | null;

  // PASSWORD RECOVERY AND CHANGE
  @Prop({ default: null })
  passwordResetToken!: string;
  @Prop({ type: Date, default: null })
  passwordResetExpire!: Date | null;
  @Prop({ type: Date, default: null })
  passwordChangedAt!: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
