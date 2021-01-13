// eslint-disable-next-line import/no-extraneous-dependencies
import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const getProducts = async (category) => {
  const readParams = {
    TableName: process.env.productTableName,
    KeyConditionExpression: 'category = :category',
    ExpressionAttributeValues: {
      ':category': category,
    },
  };

  const result = await dynamoDb.query(readParams).promise();

  return result.Items;
};

const prepProductsBeforeUpdates = (products) => {
  const result = [];
  products.forEach((product) => {
    result.push({
      PutRequest: {
        Item: {
          productId: product.id,
          category: product.type,
          name: product.name,
          color: product.color,
          price: product.price,
          manufacturer: product.manufacturer
        }
      }
    });
  });
  return result;
};

export const updateProducts = async (products) => {
  // try with first 3 products
  const preparedProducts = prepProductsBeforeUpdates(products);

  const batchUpdateParams = {
    RequestItems: {
      [process.env.productTableName]: preparedProducts
    }
  };

  try {
    const result = await dynamoDb.batchWrite(batchUpdateParams).promise();

    // todo: re-submit unprocessed items
    console.log('unprocessedItems', result.UnprocessedItems);
  } catch (err) {
    console.log('error', err);
  }
};
