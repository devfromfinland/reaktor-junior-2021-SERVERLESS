/* eslint-disable no-await-in-loop */
import fetch from 'node-fetch';
import { CATEGORIES, MANUFACTURERS } from './helpers';

export const API_BASE_URL = 'https://bad-api-assignment.reaktor.com/v2';
const FORCE_ERROR = false;
const errorHeader = {
  'x-force-error-mode': 'all'
};

export const fetchProductsByCategory = async (category) => {
  const res = FORCE_ERROR
    ? await fetch(`${API_BASE_URL}/products/${category}`, {
      headers: errorHeader
    })
    : await fetch(`${API_BASE_URL}/products/${category}`);
  const data = await res.json();
  console.log(data[0]);
  return data;
};

const getAvailabilityByManufacturer = async (manufacturer) => {
  let flag = true;
  let res = null;
  let data = null;

  // todo: limit number of retries
  do {
    res = FORCE_ERROR
      ? await fetch(`${API_BASE_URL}/availability/${manufacturer}`, {
        headers: errorHeader
      })
      : await fetch(`${API_BASE_URL}/availability/${manufacturer}`);

    data = await res.json();
    console.log(manufacturer, typeof (data.response), data.response.length);
    if (typeof (data.response) === 'object' && data.response.length > 0) {
      flag = false;
    }
  } while (flag);

  console.log(data.response);

  return data;
};

const fetchAllData = async () => {
  const data = {
    categories: {},
    manufacturers: {}
  };

  CATEGORIES.forEach(async (category) => {
    try {
      data.categories[category] = await fetchProductsByCategory(category);
    } catch (err) {
      console.log('error while fetching products', err);
    }
  });

  MANUFACTURERS.forEach(async (manufacturer) => {
    try {
      data.manufacturers[manufacturer] = await getAvailabilityByManufacturer(manufacturer);
    } catch (err) {
      console.log('error while fetching availability', err);
    }
  });

  return data;
};
