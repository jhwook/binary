var createError = require('http-errors');
var bodyParser = require('body-parser')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {getipaddress}=require('./utils/session')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const assetsRouter = require('./routes/assets');
const transactionsRouter = require('./routes/transactions');
const bookmarksRouter = require('./routes/bookmarks');

const LOGGER = console.log;

const cors = require('cors');

var app = express();

// view engine setup
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req,res,next)=>{
LOGGER(	getipaddress(req))
next()
})
app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(function(e, req, res, next){
  console.error(e);
  res.status(e.status || 500);
  res.render('error', {
    message: e.message,
    error: e
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
//app.use(express.multipart());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter)
app.use('/assets', assetsRouter)
app.use('/transactions', transactionsRouter)
app.use('/bookmarks', bookmarksRouter)

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  
  const cron=require('node-cron'),moment=require('moment');
  cron.schedule('*/1 * * * *',()=>{  console.log(moment().format('HH:mm:ss, YYYY-MM-DD') , '@binary' )
  })


module.exports = app;