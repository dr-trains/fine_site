const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');
const path = require('path');

const storage = new Storage();

const bucketName = process.env.GCLOUD_STORAGE_BUCKET;
if (!bucketName) {
  throw new Error('GCLOUD_STORAGE_BUCKET environment variable is not set.');
}
const bucket = storage.bucket(bucketName);

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

function gcsUpload(req, res, next) {
  if (!req.file) {
    return next();
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const extension = path.extname(req.file.originalname);
  const blobName = `uploads/${req.file.fieldname}-${uniqueSuffix}${extension}`;
  const blob = bucket.file(blobName);

  const blobStream = blob.createWriteStream({
    resumable: false,
    gzip: true,
  });

  blobStream.on('error', (err) => {
    req.file.gcsError = err;
    next(err);
  });

  blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    req.file.gcsUrl = publicUrl;
    req.file.gcsName = blob.name;
    next();
  });

  blobStream.end(req.file.buffer);
}

module.exports = { multer, gcsUpload }; 