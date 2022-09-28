const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const userRoute = require('./routes/users');
const urlRoute = require('./routes/url');
const redirectRoute = require('./routes/redirect');
const connectDB = require('./DB/connect');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./utils/globalErrors.js');
const catchAsync = require('./utils/catchAsync.js');

const app = express();
// any origin can access the resource
app.use(cors({
    origin: '*'
}));
// for parsing application/json
app.use(express.json());

//1 Global middlewares
// Set security HTTP headers
app.use(helmet());

//Limit requests from same ip
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this ip, please try again in an hour',
});
app.use('/api', limiter);

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss(html code attack)
app.use(xss());

app.use('/api/v1/users', userRoute);
app.use('/api/v1/url', urlRoute);
app.use('/', redirectRoute);
app.get('/home', function (req, res) {
	res.send({ message : 'Welcome to the Url Shortener Application!'});
  
  });

app.all('*', (req, res, next) => {
	//   const err = new Error(`Can't find ${req.originalUrl} on this server`)
	//   err.status = "fail"
	//   err.statusCode = 404
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

const port = process.env.PORT || 4000;
const start = catchAsync(async () => {
	await connectDB(process.env.MONGO_URI);

	app.listen(port, () => {
		console.log(`Server is listening on port ${port}...`);
	});
});

app.use(globalErrorHandler);
start();
