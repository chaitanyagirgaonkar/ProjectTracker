const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const projectRoutes = require('./routes/projectRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
	res.status(200).json({ message: 'API is running' });
});

app.use('/api/projects', projectRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
