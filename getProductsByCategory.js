import { fetchProductsByCategory } from './libs/oldApi';
import { getProducts, updateProducts } from './libs/dynamo-lib';

exports.main = async (event) => {
  let body = null;
  const { category } = event.pathParameters;

  // todo: check category
  // console.log('category', category);

  // get data from dynamoDb
  const data = await getProducts(category);

  if (!data || data.length === 0) {
    // fetch data from old API
    const remoteData = await fetchProductsByCategory(category);
    body = remoteData;

    // update to dynamoDb
    // console.log('from old API', remoteData.length);
    await updateProducts(remoteData);
  } else {
    body = data;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};
