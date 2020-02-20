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
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    }
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get("/stripe-key", (req, res) => {
  res.send({ publishableKey: keyPublishable });
});

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

app.post("/create-payment-intent", async(req, res) =>{
  const orderData = req.body;
  console.log(orderData);
  const paymentIntent = await stripe.paymentIntents.create(orderData);
  res.json({publicKey: keyPublishable, clientSecret: paymentIntent.client_secret})
})

app.post("/pay", async (req, res) => {
  const { paymentMethodId, paymentIntentId, items, currency, useStripeSdk } = req.body;

  const orderAmount = 25;

  try {
    let intent;
    if (paymentMethodId) {
      // Create new PaymentIntent with a PaymentMethod ID from the client.
      intent = await stripe.paymentIntents.create({
        amount: orderAmount,
        currency: currency,
        payment_method: paymentMethodId,
        confirmation_method: "manual",
        confirm: true,
        // If a mobile client passes `useStripeSdk`, set `use_stripe_sdk=true`
        // to take advantage of new authentication features in mobile SDKs
        //use_stripe_sdk: useStripeSdk,
      });
      // After create, if the PaymentIntent's status is succeeded, fulfill the order.
    } else if (paymentIntentId) {
      // Confirm the PaymentIntent to finalize payment after handling a required action
      // on the client.
      intent = await stripe.paymentIntents.confirm(paymentIntentId);
      // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
    }
    res.send(generateResponse(intent));
  } catch (e) {
    // Handle "hard declines" e.g. insufficient funds, expired card, etc
    // See https://stripe.com/docs/declines/codes for more
    res.send({ error: e.message });
  }
});

const generateResponse = intent => {
  // Generate a response based on the intent's status
  switch (intent.status) {
    case "requires_action":
    case "requires_source_action":
      // Card requires authentication
      return {
        requiresAction: true,
        clientSecret: intent.client_secret
      };
    case "requires_payment_method":
    case "requires_source":
      // Card was not properly authenticated, suggest a new payment method
      return {
        error: "Your card was denied, please provide a new payment method"
      };
    case "succeeded":
      // Payment is complete, authentication not required
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      console.log("💰 Payment received!");
      return { clientSecret: intent.client_secret };
  }
};

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
