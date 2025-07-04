import app from './app.js';
import logger from './logs/logger.js';
import 'dotenv/config';
import config from './config/env.js'
import { sequelize } from './database/database.js';

async function main() {
    await sequelize.sync({force: true});
    const port = config.PORT;
    app.listen(port);
    logger.info('Server is running on http://localhost:' + port);
}

main();