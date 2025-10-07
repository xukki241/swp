/**
 * Convert BigInt values to strings in objects
 * This is needed because JSON.stringify cannot serialize BigInt
 * @param {*} obj - Object to convert
 * @returns {*} Object with BigInt converted to strings
 */
export const serializeBigInt = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeBigInt(item));
  }

  if (typeof obj === "object") {
    const serialized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeBigInt(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
};

/**
 * Convert BigInt IDs in response data
 * @param {Object|Array} data - Data to convert
 * @returns {Object|Array} Converted data
 */
export const convertBigIntIds = (data) => {
  return serializeBigInt(data);
};
