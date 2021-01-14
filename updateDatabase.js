import { fetchProductsByCategory, fetchAvailability } from './libs/oldApi';
import { updateProducts } from './libs/dynamo-lib';
import { CATEGORIES } from './libs/helpers';
import { saveDataToS3 } from './libs/s3-lib';

export const extractAvailabilityText = (text) => {
  const regex = /<INSTOCKVALUE>(.*?)<\/INSTOCKVALUE>/;
  const result = text.match(regex);
  return result[1];
};

const prepProductsBeforeUpdates = (productsData, availabilityData) => {
  const result = [];

  // productsData.forEach((category) => {
  //   category.forEach((product) => {
  //     result.push({
  //       PutRequest: {
  //         Item: {
  //           productId: product.id,
  //           category: product.type,
  //           name: product.name,
  //           color: product.color,
  //           price: product.price,
  //           manufacturer: product.manufacturer,
  //           availability: availabilityData[product.id.toUpperCase()]
  //         }
  //       }
  //     });
  //   });
  // });
  productsData.forEach((category) => {
    category.forEach((product) => {
      result.push({
        productId: product.id,
        category: product.type,
        name: product.name,
        color: product.color,
        price: product.price,
        manufacturer: product.manufacturer,
        availability: availabilityData[product.id.toUpperCase()]
      });
    });
  });

  return result;
};

exports.main = async () => {
  const productsPromises = [];

  CATEGORIES.forEach((category) => {
    const promise = fetchProductsByCategory(category);
    productsPromises.push(promise);
  });

  Promise.all(productsPromises).then((allProducts) => {
    const manufacturers = [];
    allProducts.forEach((arrCategory) => {
      arrCategory.forEach((item) => {
        if (!manufacturers.includes(item.manufacturer)) manufacturers.push(item.manufacturer);
      });
    });
    // console.log(manufacturers);

    const availabilityPromises = [];
    manufacturers.forEach((manufacturer) => {
      const promise = fetchAvailability(manufacturer);
      availabilityPromises.push(promise);
    });

    Promise.all(availabilityPromises).then(async (allAvailability) => {
      const availabilityData = {};
      for (let i = 0; i < allAvailability.length; i++) {
        allAvailability[i].forEach((item) => {
          // eslint-disable-next-line max-len
          availabilityData[item.id] = extractAvailabilityText(item.DATAPAYLOAD);
        });
      }

      const preparedProducts = prepProductsBeforeUpdates(allProducts, availabilityData);

      // necessary to delete the whole database first to avoid redundant products
      // which were removed at remote server within the 5 minute frame

      // update products to dynamoDb
      // await updateProducts(preparedProducts);

      // save products data to S3
      await saveDataToS3(preparedProducts);
    });
  });
};
