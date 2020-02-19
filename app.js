const createError = require('http-errors');
const express = require('express');
const path = require('path');
const pug = require('pug');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const keyPublishable = 'pk_test_wlPj0KvFkjym9mrxbootdYVL00AzjkpcAe';
const keySecret = 'sk_test_jLrSf2i1YLL4ZGKRMNY5ZeAn00sWXiuSJW';

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const stripe = require('stripe')(keySecret);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post("/charge", function(req, res) {

    let amount = 5*100; // 500 cents means $5

    // create a customer
    stripe.customers.create({
        email: req.body.stripeEmail, // customer email, which user need to enter while making payment
        source: req.body.stripeToken // token for the given card
    })
    .then(customer =>
        stripe.charges.create({ // charge the customer
        amount,
        description: "Sample Charge",
            currency: "usd",
            customer: customer.id
        }))
    .then(charge => 
        res.render("charge")
    )
    .catch((error) => {
      console.log(error.type);
    }); // render the charge view: views/charge.pug

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
