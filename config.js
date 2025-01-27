import dotenv from 'dotenv';
dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

export const config = {
  session: {
    secretKey: required('SESSION_SECRET'),
    expiresInSec: parseInt(required('SESSION_EXPIRES_SEC', 86400)),
  },
  bcrypt: {
    saltRounds: parseInt(required('BCRYPT_SALT_ROUNDS', 10)),
  },
  url: {
    clientUrl: required('CLIENT_URL'),
  },
  host: {
    port: parseInt(required('HOST_PORT', 3000)),
  },
  db: {
    host: required('DB_HOST'),
    user: required('DB_USER'),
    database: required('DB_DATABASE'),
    password: required('DB_PASSWORD'),
  },
  s3: {
    cdnUrl: required('CDN_URL'),
    bucketName: required('S3_BUCKET_NAME'),
    accessKeyId: required('S3_ACCESS_KEY_ID'),
    secretAccessKey: required('S3_SECRET_ACCESS_KEY'),
    region: required('S3_BUCKET_REGION'),
  },
};
