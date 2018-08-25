/**
 * Check is environment is development
 * @return {boolean}
 */
export const isDevelopment = (): boolean => {
    const env = process.env.NODE_ENV.toLowerCase();
    return env === 'dev' || env === 'development';
};

/**
 * Check is environment is production
 * @return {boolean}
 */
export const isProduction = (): boolean => {
    const env = process.env.NODE_ENV.toLowerCase();
    return env === 'prod' || env === 'production';
};

/**
 * Generates random string with given length
 * @param length String length
 */
export const generateRandomString = (length: number): string => {
    let string = "";
    while (string.length < length) {
        string += (Math.random() + 1).toString(36).substring(7);
    }
    return string.slice(0, length);
};
