import { randomUUID } from "crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

interface UploadParams {
  file: File
  folder?: string
}

function getR2Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim()
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim()
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.trim()

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl: publicUrl.replace(/\/$/, ""),
  }
}

function getR2Client(config: NonNullable<ReturnType<typeof getR2Config>>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

function normalizeFileName(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
}

export function hasCloudflareImagesConfig() {
  return Boolean(getR2Config())
}

export async function uploadImageToCloudflare({ file, folder = "uploads" }: UploadParams) {
  const config = getR2Config()

  if (!config) {
    throw new Error("Cloudflare R2 nao esta configurado neste ambiente.")
  }

  const safeName = normalizeFileName(file.name || "arquivo")
  const objectKey = `${folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`
  const client = getR2Client(config)
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: file.type || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    })
  )

  return {
    id: objectKey,
    key: objectKey,
    url: `${config.publicUrl}/${objectKey}`,
    filename: file.name,
  }
}
