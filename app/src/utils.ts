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
