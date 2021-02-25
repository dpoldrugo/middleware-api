export function initEnvFile() {
    if (process.env.NODE_ENV && process.env.NODE_ENV.includes('test')) {
        require('dotenv').config({path: `./.env.${process.env.NODE_ENV}`});
    }
}