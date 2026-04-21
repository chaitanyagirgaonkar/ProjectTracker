require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const DB_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 5000);
const MAX_DB_RETRIES = Number(process.env.DB_RETRY_MAX_ATTEMPTS || 0);

let retryCount = 0;

const startServer = async () => {
	try {
		await connectDB();

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		retryCount += 1;
		console.error(
			`Failed to start server: ${error.message}. Retry ${retryCount}${MAX_DB_RETRIES > 0 ? `/${MAX_DB_RETRIES}` : ''} in ${DB_RETRY_DELAY_MS}ms`,
		);

		if (MAX_DB_RETRIES > 0 && retryCount >= MAX_DB_RETRIES) {
			console.error('Max DB retry attempts reached. Exiting process.');
			process.exit(1);
		}

		setTimeout(startServer, DB_RETRY_DELAY_MS);
	}
};

startServer();
