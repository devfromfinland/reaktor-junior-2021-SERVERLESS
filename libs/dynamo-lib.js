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

export const updateProducts = async (products) => {
  let count = 0;
  while (count < products.length) {
    const arrItems = products.slice(count, count + 25);
    // console.log('arrItems', arrItems.length);
    count += 25;

    const batchUpdateParams = {
      RequestItems: {
        [process.env.productTableName]: arrItems
      }
    };

    dynamoDb.batchWrite(batchUpdateParams, (err, data) => {
      if (err) console.log('error while updating products');
    });
  }
};
