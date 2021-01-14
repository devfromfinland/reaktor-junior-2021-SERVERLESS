// import { getProducts } from './libs/dynamo-lib';
import { getDataFromS3 } from './libs/s3-lib';

exports.main = async (event) => {
  const { category } = event.pathParameters;

  // todo: check category
  // console.log('category', category);

  // get data from dynamoDb
  // const data = await getProducts(category);

  // get data from S3
  const data = await getDataFromS3();
  // console.log('data', typeof data, data.length);
  const filteredData = data.filter((item) => item.category === category);

  return {
    statusCode: 200,
    body: JSON.stringify(filteredData),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};
