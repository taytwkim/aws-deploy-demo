const dotenv = require('dotenv');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

dotenv.config();

const bucketName = process.env.BUCKET_NAME
const region = process.env.BUCKET_REGION
const accessKeyId = process.env.BUCKET_ACCESS_KEY
const secretAccessKey = process.env.BUCKET_SECRET_KEY

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

function uploadFile(fileBuffer, fileName, mimetype) {
  const params = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype
  }
  return s3.send(new PutObjectCommand(params));
}

function deleteFile(fileName) {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  }
  return s3.send(new DeleteObjectCommand(params));
}

async function getImageSignedUrl(key) {
  const params = {
    Bucket: bucketName,
    Key: key
  }
  const command = new GetObjectCommand(params);
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url
}

module.exports = { uploadFile, deleteFile, getImageSignedUrl };