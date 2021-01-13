/* eslint-disable no-await-in-loop */
import fetch from 'node-fetch';

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
  // console.log(`${category}: ${data.length} items`);
  // console.log(data[0]);
  return data;
};

export const fetchAvailability = async (manufacturer) => {
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
    // console.log(manufacturer, typeof (data.response), data.response.length);
    if (typeof (data.response) === 'object' && data.response.length > 0) {
      flag = false;
    } else {
      flag = true;
    }
  } while (flag);

  // console.log(data.response);

  return data.response;
};
