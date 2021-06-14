function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p id="book-quantity" class="is-size-6">Disponível em estoque: <span>${book.quantity}</span></p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button button-buy is-success is-fullwidth" data-id="${book.id}">Comprar</button>
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(id, cep) {
    fetch('http://localhost:3000/shipping/' + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');

    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                });

                document.querySelectorAll('.button-shipping').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                        calculateShipping(id, cep);
                    });
                });

                document.querySelectorAll('.button-buy').forEach((btn) => {
                    const quantity = data.find(book => book.id === parseInt(btn.getAttribute('data-id'))).quantity;
                    btn.innerHTML = "Comprar";
                    if (quantity === 0) {
                        btn.setAttribute('disabled', true);
                        btn.innerHTML = "Indisponível";
                    }
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const buyedBook = JSON.stringify({
                            id: id,
                            quantity: 1,
                        });
                        fetch('http://localhost:3000/product/buy', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: buyedBook
                        }).then((res) => {
                            if (res.ok) {
                                return res.json();
                            }
                            throw res.statusText;
                        }).then(res => {
                            const quantity = parseInt(document.getElementById('book-quantity').children[0].innerHTML) - 1;
                            document.getElementById('book-quantity').innerHTML = `Disponível em estoque: <span>${quantity}</span>`;
                            if (quantity === 0) {
                                e.target.setAttribute('disabled', true);
                            }
                            swal('Compra de livro', res.message, 'success');
                        });
                    });
                });
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
});
