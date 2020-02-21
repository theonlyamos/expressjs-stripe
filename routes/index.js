var express = require('express');
var router = express.Router();
require("dotenv").config()

const keyPublishable = process.env.STRIPE_PUB_KEY;
const keySecret = process.env.STRIPE_SECRET_KEY;

const stripe = require('stripe')(keySecret);

/* GET home page. */
router.get('/', function(req, res, next) {
  stripe.plans.list(
    {limit: 3},
    function(err, plans) {
      // asynchronously called
      if (err)
        return res.render('error.pug')
      res.render('index', { title: 'Express', plans: plans.data});
    }
  );
});

router.post('/', function(req, res, next) {
  const plan_id = req.body.pid;
  stripe.plans.retrieve(
    plan_id,
    function(err, plan) {
      // asynchronously called
      res.render('checkout', { title: 'Express', plan: plan_id, amount: plan.amount});
    }
  );
  
});

module.exports = router;
