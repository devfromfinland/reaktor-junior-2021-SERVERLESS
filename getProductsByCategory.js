import { getProducts } from './libs/dynamo-lib';

exports.main = async (event) => {
  const { category } = event.pathParameters;

  // todo: check category
  // console.log('category', category);

  // get data from dynamoDb
  const data = await getProducts(category);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};
