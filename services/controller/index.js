const express = require('express');
const bodyParser = require('body-parser');

const shipping = require('./shipping');
const inventory = require('./inventory');
const cors = require('cors');

const app = express();
app.use(cors());

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

app.get('/product/:id', (req, res, next) => {
    inventory.SearchProductByID({ id: req.params.id }, (err, product) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(product);
        }
    });
});

app.put('/product/buy', bodyParser.json(), (req, res, next) => {
    inventory.BuyProduct({ id: req.body.id, quantity: req.body.quantity }, (err, product) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json({ message: product.message });
        }
    });
});

app.put('/product/add', bodyParser.json(), (req, res, next) => {
    inventory.IncreaseProducts({ id: req.body.id, quantity: req.body.quantity }, (err, product) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json({ message: product.message });
        }
    });
});

/**
 * Inicia o router
 */
app.listen(3000, () => {
    console.log('Controller Service running on http://localhost:3000');
});
