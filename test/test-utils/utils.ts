export function initEnvFile() {
    if (process.env.NODE_ENV === 'test') {
        require('dotenv').config({path: `./.env.${process.env.NODE_ENV}`});
    }
}