import { fetchProductsByCategory, fetchAvailability } from './libs/oldApi';
import { CATEGORIES } from './libs/helpers';
import { saveDataToS3 } from './libs/s3-lib';

export const extractAvailabilityText = (text) => {
  const regex = /<INSTOCKVALUE>(.*?)<\/INSTOCKVALUE>/;
  const result = text.match(regex);
  return result[1];
};

const prepProductsBeforeUpdates = (productsData, availabilityData) => {
  const result = [];

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

  await Promise.all(productsPromises).then(async (allProducts) => {
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

    await Promise.all(availabilityPromises).then(async (allAvailability) => {
      const availabilityData = {};
      for (let i = 0; i < allAvailability.length; i++) {
        allAvailability[i].forEach((item) => {
          // eslint-disable-next-line max-len
          availabilityData[item.id] = extractAvailabilityText(item.DATAPAYLOAD);
        });
      }

      const preparedProducts = prepProductsBeforeUpdates(allProducts, availabilityData);
      // console.log('data to update', preparedProducts.length);

      // save products data to S3
      await saveDataToS3(preparedProducts);
    });
  });
};
