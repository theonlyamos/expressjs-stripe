// A reference to Stripe.js
var stripe;

var orderData = {
  amount: 300,
  currency: "usd"
};

const formClass = '.example5';
const example = document.querySelector(formClass);
const form = document.getElementById("card-element")
const error = form.querySelector('.error');
const errorMessage = error.querySelector('.message');

fetch("/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(orderData)
})
  .then(function(result) {
    return result.json();
  })
  .then(function(data) {

    return setupElements(data);
  })
  .then(function({ stripe, card, clientSecret }) {
    document.querySelector("#submit").addEventListener("click", function(evt) {
      evt.preventDefault();
      // Initiate payment when the submit button is clicked
      if (form.reportValidity())
        pay(stripe, card, clientSecret);
    });
});

// Set up Stripe.js and Elements to use in checkout form
var setupElements = function(data) {
  stripe = Stripe(data.publicKey);
  var elements = stripe.elements();
  var style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  };

  var card = elements.create("card", { style: style });
  card.mount("#example5-card");

  return {
    stripe: stripe,
    card: card,
    clientSecret: data.clientSecret
  };
};

/*
 * Calls stripe.handleCardPayment which creates a pop-up modal to
 * prompt the user to enter extra authentication details without leaving your page
 */
var pay = function(stripe, card, clientSecret) {
  changeLoadingState(true);

  // Initiate the payment.
  // If authentication is required, handleCardPayment will automatically display a modal
  stripe.handleCardPayment(clientSecret, card).then(function(result) {
    if (result.error) {
      // Show error to your customer
      showError(result.error.message);
      example.classList.remove('submitted');
    } else {
      // The payment has been processed!
      orderComplete(clientSecret);
    }
  });
};

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
var orderComplete = function(clientSecret) {
  stripe.retrievePaymentIntent(clientSecret).then(function(result) {
    var paymentIntent = result.paymentIntent;
    var paymentIntentJson = JSON.stringify(paymentIntent, null, 2);

    changeLoadingState(false);

    document.querySelector("pre").textContent = paymentIntentJson;
    
  });
};

var showError = function(errorMsgText) {
  changeLoadingState(false);
  error.classList.add('visible');
  errorMessage.innerText = errorMsgText;
  setTimeout(function() {
    errorMessage.textContent = "";
    error.classList.remove('visible');
  }, 10000);
};

// Show a spinner on payment submission
var changeLoadingState = function(isLoading) {
  if (isLoading) {
    example.classList.add('submitting');

  } else {
    example.classList.remove('submitting');
    example.classList.add('submitted');

  }
};

// Hide banner if window is too small
