const grpc = require('@grpc/grpc-js');
const fs = require('fs');
const path = require('path');

const protoLoader = require('@grpc/proto-loader');
const products = require('./products.json');

const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do InventoryService
server.addService(inventoryProto.InventoryService.service, {
    searchAllProducts: (_, callback) => {
        callback(null, {
            products: products,
        });
    },
    SearchProductByID: (payload, callback) => {
        callback(null,
            products.find((product) => product.id == payload.request.id)
        );
    },
    BuyProduct: (product, callback) => {
        const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'products.json')));
        const idx = products.findIndex(productJson => productJson.id == product.request.id);
        if (product.request.quantity <= 0) {
            return callback(null, { message: "Quantidade inválida!" });
        }
        if (products[idx].quantity >= product.request.quantity) {
            products[idx].quantity -= product.request.quantity;
            fs.writeFileSync(path.resolve(__dirname, './products.json'), JSON.stringify(products, null, 4));
            return callback(null, { message: "Sua compra foi realizada com sucesso!" });
        } else {
            return callback(null, { message: "Quantidade não disponível no estoque!" });
        }
    },
    IncreaseProducts: (product, callback) => {
        const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'products.json')));
        const idx = products.findIndex(productJson => productJson.id == product.request.id);
        if (product.request.quantity <= 0) {
            return callback(null, { message: "Quantidade inválida!" });
        }
        products[idx].quantity += product.request.quantity;
        fs.writeFileSync(path.resolve(__dirname, './products.json'), JSON.stringify(products, null, 4));
        return callback(null, { message: "Estoque alterado com sucesso!" });
    }
});

server.bindAsync('127.0.0.1:3002', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Inventory Service running at http://127.0.0.1:3002');
    server.start();
});
