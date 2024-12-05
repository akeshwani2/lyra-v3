// we name it s3-server.ts because we only want this file to interact with the S3 server
import AWS from 'aws-sdk'
import fs from 'fs' // We need this to write the file to the local machine
export async function downloadFromS3(file_key: string) {
    try {
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        })
        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,

            },
            region: 'us-east-2'
        })
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key
        }
        // Because the params contains the bucket name and the file key, we can use it to download the file from S3. A promise is returned because the file might be large and it might take some time to download.
        const obj = await s3.getObject(params).promise()
        const file_name = `/tmp/pdf-${Date.now()}.pdf`
        fs.writeFileSync(file_name, obj.Body as Buffer)
        return file_name
    } catch (error) {
        console.error('Error downloading from S3:', error)
        return null
    }
}