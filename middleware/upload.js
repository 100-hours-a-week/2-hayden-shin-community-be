import multer from 'multer';
import aws from '@aws-sdk/client-s3';
import path from 'path';
import { config } from '../config.js';

// S3 설정
const s3 = new aws.S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

const storage = multer.memoryStorage();

// 업로드 미들웨어
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

// S3 업로드 함수
export const uploadS3 = async (file) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname);
  const key = `images/${file.fieldname}-${uniqueSuffix}${ext}`;

  const params = {
    Bucket: config.s3.bucketName,
    Key: key,
    Body: file.buffer,
    // ACL: 'public-read',
    ContentType: file.mimetype,
  };

  await s3.send(new aws.PutObjectCommand(params));
  return `/${key}`;
};
