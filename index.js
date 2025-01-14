//https://nodejs.org/dist/latest-v10.x/docs/api/fs.html
//https://github.com/datanonymous/alexkopayment1/blob/master/index.js

const express = require('express');
const app = express();
const SquareConnect = require('square-connect');
const {
  TransactionsApi,
  OrdersApi,
  LocationsApi
} = require('square-connect');
const defaultClient = SquareConnect.ApiClient.instance;
const crypto = require('crypto');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env.ACCESS_TOKEN;

const transactionsApi = new TransactionsApi();
const ordersApi = new OrdersApi();
const locationsApi = new LocationsApi();



app.post('/chargeForAlex', async (request, response) => {
  const requestBody = request.body;
  const locations = await locationsApi.listLocations();
  const locationId = locations.locations[0].id;

  const createOrderRequest = {
    idempotency_key: crypto.randomBytes(12).toString('hex'),
    order: {
      line_items: [
        {
          name: "Pay Alex Ko $1.01 🐞",
          quantity: "1",
          base_price_money: {
            amount: 101,
            currency: "USD"
          }
        }
      ]
    }
  }
  
  const order = await ordersApi.createOrder(locationId, createOrderRequest);

  try {
    const chargeBody = {
      "idempotency_key": crypto.randomBytes(12).toString('hex'),
      "card_nonce": requestBody.nonce,
      "amount_money": {
        ...order.order.total_money,
      },
      "order_id": order.order.id
    };
    const transaction = await transactionsApi.charge(locationId, chargeBody);
    console.log(transaction.transaction);
 
    response.status(200).json(transaction.transaction);
  } catch (e) {
    delete e.response.req.headers;
    delete e.response.req._headers;
    console.log(
      `[Error] Status:${e.status}, Messages: ${JSON.stringify((JSON.parse(e.response.text)).errors, null, 2)}`);

    const { errors } = (JSON.parse(e.response.text));

    switch(errors[0].code) {
        case "CARD_DECLINED":
          response.status(400).send({
              errorMessage: "Card declined. Please re-enter card information."
          })
          break;
        case "VERIFY_CVV_FAILURE":
          response.status(400).send({
              errorMessage: "Invalid CVV. Please re-enter card information."
          })
          break;
        case "VERIFY_AVS_FAILURE":
          response.status(400).send({
              errorMessage: "Invalid Postal Code. Please re-enter card information."
          })
          break;
        case "INVALID_EXPIRATION":
          response.status(400).send({
              errorMessage: "Invalid expiration date. Please re-enter card information."
          })
          break;
        case "CARD_TOKEN_USED":
          response.status(400).send({
              errorMessage: "Card token already used; Please try re-entering card details."
          })
          break;
        case "INVALID_CARD":
          response.status(400).send({
              errorMessage: "Invalid card number; Please try re-entering card details."
          })
          break;
        default:
          response.status(400).send({
              errorMessage: "Payment error. Please contact support if issue persists."
          })
          break;
    }
  }
});

// // listen for requests :)
// const listener = app.listen(process.env.PORT, function() {
//   console.log('Your app is listening on port ' + listener.address().port);
// });



//HOW DO I GET THIS TO .POST MULTIPLE ITEMS?
////////////////////////////////////////////////////////////////////////////////////////////////
//error
//https://dashboard.heroku.com/apps/alexkopayment1/logs
//2019-09-10T22:34:18.758775+00:00 heroku[router]: at=error code=H10 desc="App crashed" method=POST path="/charge5dollars" host=alexkopayment1.herokuapp.com request_id=b4b2249c-fd6c-47ff-aa01-20e466655e6c fwd="75.189.195.253" dyno= connect= service= status=503 bytes= protocol=https



app.post('/charge5dollars', async (request, response) => {
  const requestBody = request.body;
  const locations = await locationsApi.listLocations();
  const locationId = locations.locations[0].id;

  const createOrderRequest = {
    idempotency_key: crypto.randomBytes(12).toString('hex'),
    order: {
      line_items: [
        {
          name: "Pay Alex Ko $5.00 🐞",
          quantity: "1",
          base_price_money: {
            amount: 500,
            currency: "USD"
          }
        }
      ]
    }
  }
  
  const order = await ordersApi.createOrder(locationId, createOrderRequest);

  try {
    const chargeBody = {
      "idempotency_key": crypto.randomBytes(12).toString('hex'),
      "card_nonce": requestBody.nonce,
      "amount_money": {
        ...order.order.total_money,
      },
      "order_id": order.order.id
    };
    const transaction = await transactionsApi.charge(locationId, chargeBody);
    console.log(transaction.transaction);

    response.status(200).json(transaction.transaction);
  } catch (e) {
    delete e.response.req.headers;
    delete e.response.req._headers;
    console.log(
      `[Error] Status:${e.status}, Messages: ${JSON.stringify((JSON.parse(e.response.text)).errors, null, 2)}`);

    const { errors } = (JSON.parse(e.response.text));

    switch(errors[0].code) {
        case "CARD_DECLINED":
          response.status(400).send({
              errorMessage: "Card declined. Please re-enter card information."
          })
          break;
        case "VERIFY_CVV_FAILURE":
          response.status(400).send({
              errorMessage: "Invalid CVV. Please re-enter card information."
          })
          break;
        case "VERIFY_AVS_FAILURE":
          response.status(400).send({
              errorMessage: "Invalid Postal Code. Please re-enter card information."
          })
          break;
        case "INVALID_EXPIRATION":
          response.status(400).send({
              errorMessage: "Invalid expiration date. Please re-enter card information."
          })
          break;
        case "CARD_TOKEN_USED":
          response.status(400).send({
              errorMessage: "Card token already used; Please try re-entering card details."
          })
          break;
        case "INVALID_CARD":
          response.status(400).send({
              errorMessage: "Invalid card number; Please try re-entering card details."
          })
          break;
        default:
          response.status(400).send({
              errorMessage: "Payment error. Please contact support if issue persists."
          })
          break;
    }
  }
});


// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
