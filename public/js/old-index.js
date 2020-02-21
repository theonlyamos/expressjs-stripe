'use strict';

var stripe;
var elements;
const amount = document.getElementById("amount").value;
const plan = document.getElementById("plan").value;
const orderData = {
  amount: amount,
  currency: "usd"
};

const setupElements = function (data) {
  stripe = Stripe(data.publicKey);
  elements = stripe.elements({
    fonts: [{
      cssSrc: 'https://fonts.googleapis.com/css?family=Quicksand',
    }, ],
    // Stripe's examples are localized to specific languages, but if
    // you wish to have Elements automatically detect your user's locale,
    // use `locale: 'auto'` instead.
    locale: window.__exampleLocale,
  });

  var elementStyles = {
    base: {
      color: '#fff',
      fontWeight: 600,
      fontFamily: 'Quicksand, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',

      ':focus': {
        color: '#424770',
      },

      '::placeholder': {
        color: '#9BACC8',
      },

      ':focus::placeholder': {
        color: '#CFD7DF',
      },
    },
    invalid: {
      color: '#fff',
      ':focus': {
        color: '#FA755A',
      },
      '::placeholder': {
        color: '#FFCCA5',
      },
    },
  };

  var elementClasses = {
    focus: 'focus',
    empty: 'empty',
    invalid: 'invalid',
  };

  var cardNumber = elements.create('cardNumber', {
    style: elementStyles,
    classes: elementClasses,
  });
  cardNumber.mount('#example3-card-number');

  var cardExpiry = elements.create('cardExpiry', {
    style: elementStyles,
    classes: elementClasses,
  });
  cardExpiry.mount('#example3-card-expiry');

  var cardCvc = elements.create('cardCvc', {
    style: elementStyles,
    classes: elementClasses,
  });
  cardCvc.mount('#example3-card-cvc');

  return {
    stripe: stripe,
    card: cardNumber,
    clientSecret: data.clientSecret
  };
};

const exampleName = "example3"
var formClass = '.' + exampleName;
var example = document.querySelector(formClass);

var form = example.querySelector('form');
var resetButton = example.querySelector('a.reset');
var error = form.querySelector('.error');
var errorMessage = error.querySelector('.message');

function enableInputs() {
  Array.prototype.forEach.call(
    form.querySelectorAll(
      "input[type='text'], input[type='email'], input[type='tel']"
    ),
    function (input) {
      input.removeAttribute('disabled');
    }
  );
}

function disableInputs() {
  Array.prototype.forEach.call(
    form.querySelectorAll(
      "input[type='text'], input[type='email'], input[type='tel']"
    ),
    function (input) {
      input.setAttribute('disabled', 'true');
    }
  );
}

function triggerBrowserValidation() {
  // The only way to trigger HTML5 form validation UI is to fake a user submit
  // event.
  var submit = document.createElement('input');
  submit.type = 'submit';
  submit.style.display = 'none';
  form.appendChild(submit);
  submit.click();
  submit.remove();
}

// Listen for errors from each Element, and show error messages in the UI.
/*
var savedErrors = {};
elements.forEach(function (element, idx) {
  element.on('change', function (event) {
    if (event.error) {
      error.classList.add('visible');
      savedErrors[idx] = event.error.message;
      errorMessage.innerText = event.error.message;
    } else {
      savedErrors[idx] = null;

      // Loop over the saved errors and find the first one, if any.
      var nextError = Object.keys(savedErrors)
        .sort()
        .reduce(function (maybeFoundError, key) {
          return maybeFoundError || savedErrors[key];
        }, null);

      if (nextError) {
        // Now that they've fixed the current error, show another one.
        errorMessage.innerText = nextError;
      } else {
        // The user fixed the last error; no more errors.
        error.classList.remove('visible');
      }
    }
  });
});
*/

var showError = function(errorMsgText) {
  error.classList.add('visible');
  errorMessage.innerText = errorMsgText;
  setTimeout(function() {
    errorMessage.textContent = "";
    error.classList.remove('visible');
  }, 10000);
};

// Listen on the form's 'submit' handler...
const submitForm = (data) => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
  
    // Trigger HTML5 validation UI on the form if any of the inputs fail
    // validation.
    var plainInputsValid = true;
    Array.prototype.forEach.call(form.querySelectorAll('input'), function (
      input
    ) {
      if (input.checkValidity && !input.checkValidity()) {
        plainInputsValid = false;
        return;
      }
    });
    if (!plainInputsValid) {
      triggerBrowserValidation();
      return;
    }
  
    // Show a loading screen...
    example.classList.add('submitting');
  
    // Disable all inputs.
    disableInputs();
  
    // Gather additional customer data we may have collected in our form.
    var name = form.querySelector('#' + exampleName + '-name');
    var email = form.querySelector('#' + exampleName + '-email');
    var phone = form.querySelector('#' + exampleName + '-phone');
    var address1 = form.querySelector('#' + exampleName + '-address');
    var city = form.querySelector('#' + exampleName + '-city');
    var state = form.querySelector('#' + exampleName + '-state');
    var zip = form.querySelector('#' + exampleName + '-zip');
    var additionalData = {
      name: name ? name.value : undefined,
      email: email ? email.value : undefined,
      phone: phone ? phone.value : undefined,
      line1: address1 ? address1.value : undefined,
      city: city ? city.value : undefined,
      state: state ? state.value : undefined,
      postal_code: zip ? zip.value : undefined,
    };
    data.additionalData = additionalData
    pay(data);
  
    // Use Stripe.js to create a token. We only need to pass in one Element
    // from the Element group in order to create a token. We can also pass
    // in the additional customer data we collected in our form.
  
  
  /*
    stripe.createToken(elements[0], additionalData).then(function (result) {
      // Stop loading!
      example.classList.remove('submitting');
  
      if (result.token) {
        // If we received a token, show the token ID.
        console.log(result)
        example.querySelector('.token').innerText = result.token.id;
        example.classList.add('submitted');
      } else {
        // Otherwise, un-disable inputs.
        enableInputs();
      }
    });
    */
  });
}

var pay = function (data) {
  //changeLoadingState(true);

  // Initiate the payment.
  // If authentication is required, handleCardPayment will automatically display a modal
  /*
  stripe.handleCardPayment(data).then(function (result) {
    console.log(result)
    if (result.error) {
      // Show error to your customer
      
      showError(result.error.message);
      example.classList.remove('submitted');
    } else {
      // The payment has been processed!
      orderComplete(clientSecret);
    }
  });
  */
 var card = data.card
 var additionalData = data.additionalData;
 stripe.confirmCardPayment(data.clientSecret, {
  payment_method: {
    card: card,
    billing_details: {
      name: additionalData.name,
      email: additionalData.email,
      phone: additionalData.phone,
      address: {
        city: additionalData.city,
        country: additionalData.country,
        state: additionalData.state,
        line1: additionalData.line1,
        postal_code: additionalData.postal_code,
      }
    }
  }
}).then(function(result) {
  example.classList.remove('submitting');
  if (result.error) {
    // Show error to your customer (e.g., insufficient funds)
    example.classList.remove('submitted');
    showError(result.error.message);
  } else {
    // The payment has been processed!
    orderComplete(data.clientSecret);
    if (result.paymentIntent.status === 'succeeded') {
      // Show a success message to your customer
      // There's a risk of the customer closing the window before callback
      // execution. Set up a webhook or plugin to listen for the
      // payment_intent.succeeded event that handles any business critical
      // post-payment actions.
      example.classList.add('submitted');
      enableInputs();
    }
  }
});
};

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
var orderComplete = function (clientSecret) {
  stripe.retrievePaymentIntent(clientSecret).then(function (result) {

    var payment_id = result.paymentIntent.payment_method;
    //var paymentIntent = result.paymentIntent;
    //var paymentIntentJson = JSON.stringify(paymentIntent, null, 2);
    console.log(payment_id);
    //changeLoadingState(false);


    fetch("/retrieve-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({pm_id: payment_id})
    })
    .then(function (result) {
      return result.json();
    }).then((response) => {
      var responseJson = JSON.stringify(response, null, 2);
      document.querySelector("pre").textContent = responseJson;
    })
    
    

  });
};

/*
resetButton.addEventListener('click', function (e) {
  e.preventDefault();
  // Resetting the form (instead of setting the value to `''` for each input)
  // helps us clear webkit autofill styles.
  form.reset();

  // Clear each Element.
  elements.forEach(function (element) {
    element.clear();
  });

  // Reset error state as well.
  error.classList.remove('visible');

  // Resetting the form does not un-disable inputs, so we need to do it separately:
  enableInputs();
  example.classList.remove('submitted');
});
*/
fetch("/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(orderData)
})
.then(function (result) {
  return result.json();
})
.then(function (data) {
  return setupElements(data);
})
.then(function ({stripe, card,clientSecret
}) {
  submitForm({stripe, card, clientSecret});
  /*
  document.querySelector("#submit").addEventListener("click", function (evt) {
    evt.preventDefault();
    // Initiate payment when the submit button is clicked
    if (form.reportValidity())
      pay(stripe, card, clientSecret);
  });
  */
});
