// eslint-disable-next-line import/no-extraneous-dependencies
import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const bucketName = 'junior-reaktor-2021-v2-dev-databucket-u2acr8eu05nn';
// const filename = 'products.json';

export const saveDataToS3 = async (products, filename = 'products.json') => {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Body: JSON.stringify(products),
    ContentType: 'application/json; charset=utf-8',
  };

  try {
    await s3.putObject(params).promise();
    console.log('done saving data to S3');
  } catch (err) {
    console.log('error while putting object to S3', err);
    throw new Error({
      message: 'something wrong'
    });
  }
};

export const getDataFromS3 = async (filename = 'products.json') => {
  const params = {
    Bucket: bucketName,
    Key: filename,
  };

  try {
    const data = await s3.getObject(params).promise();
    console.log('got the file');
    return JSON.parse(data.Body);
  } catch (err) {
    console.log('error while getting object from S3', err);
    return null;
  }
};
