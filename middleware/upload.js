import multer from 'multer';
import aws from '@aws-sdk/client-s3';
import path from 'path';
import sharp from 'sharp';
import { config } from '../config.js';

const SIZE_1MB = 1024 * 1024;
const MAX_FILE_SIZE = {
  PROFILE: 2 * SIZE_1MB,
  MEDIA: 512 * SIZE_1MB,
};
const ALLOWED_FILE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
};
const s3 = new aws.S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

const optimizeImage = async (buffer, isProfile = false) => {
  try {
    if (isProfile) {
      return sharp(buffer)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    const metadata = await sharp(buffer).metadata();
    if (metadata.format === 'gif') {
      return buffer;
    }

    return sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    console.error('이미지 최적화 실패:', error);
    throw new Error('이미지 최적화에 실패했습니다.');
  }
};

const createUploadMiddleware = (type = 'media') => {
  const maxSize =
    type === 'profile' ? MAX_FILE_SIZE.PROFILE : MAX_FILE_SIZE.MEDIA;

  return multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_FILE_TYPES[file.mimetype]) {
        return cb(new Error('지원하지 않는 파일 형식입니다.'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: maxSize },
  }).single('image');
};

export const uploadProfile = createUploadMiddleware('profile');
export const uploadMedia = createUploadMiddleware('media');

export const handleUpload =
  (type = 'media') =>
  (req, res, next) => {
    const upload = type === 'profile' ? uploadProfile : uploadMedia;

    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxMB = type === 'profile' ? 2 : 512;
          return res.status(413).json({
            message: `파일 크기는 ${maxMB}MB를 초과할 수 없습니다.`,
            data: null,
          });
        }
        return res.status(400).json({
          message: '파일 업로드 중 오류가 발생했습니다.',
          data: null,
        });
      }
      if (err) {
        return res.status(400).json({
          message: err.message,
          data: null,
        });
      }
      next();
    });
  };

export const uploadS3 = async (file, isProfile = false) => {
  try {
    const optimizedBuffer = await optimizeImage(file.buffer, isProfile);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = ALLOWED_FILE_TYPES[file.mimetype];
    const key = `images/${file.fieldname}-${uniqueSuffix}${ext}`;

    const params = {
      Bucket: config.s3.bucketName,
      Key: key,
      Body: optimizedBuffer,
      ContentType: file.mimetype,
    };

    await s3.send(new aws.PutObjectCommand(params));
    return `/${key}`;
  } catch (error) {
    console.error('S3 업로드 실패:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
};
