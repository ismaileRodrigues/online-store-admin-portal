document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    document.getElementById('addProductForm').addEventListener('submit', (event) => {
        event.preventDefault();
        addProduct();
    });
});

let products = [];

function displayError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    const errorElement = document.getElementById('error');
    errorElement.style.display = 'none';
}

function loadProducts() {
    fetch('https://online-store-backend-vw45.onrender.com/api/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        products = data;
        renderProducts();
        hideError(); // Oculta qualquer erro anterior ao carregar com sucesso
    })
    .catch(error => {
        console.error('Error loading products:', error);
        displayError('Erro ao carregar produtos. Tente novamente mais tarde.');
    });
}

function renderProducts() {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';
    products.forEach((product) => {
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
            <img src="https://online-store-backend-vw45.onrender.com${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Preço: R$ ${product.price.toFixed(2)}</p>
            <button onclick="deleteProduct(${product.id})">Excluir Produto</button>
        `;
        productsContainer.appendChild(productElement);
    });
}

function addProduct() {
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('image', document.getElementById('productImage').files[0]);

    fetch('https://online-store-backend-vw45.onrender.com/api/products', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(product => {
        products.push(product);
        renderProducts();
        document.getElementById('addProductForm').reset();
        hideError(); // Oculta erros ao adicionar com sucesso
    })
    .catch(error => {
        console.error('Erro ao adicionar produto:', error);
        displayError('Erro ao adicionar o produto. Verifique os dados e tente novamente.');
    });
}

function deleteProduct(id) {
    fetch(`https://online-store-backend-vw45.onrender.com/api/products/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        products = products.filter(product => product.id !== id);
        renderProducts();
        hideError(); // Oculta erros ao excluir com sucesso
    })
    .catch(error => {
        console.error('Erro ao excluir produto:', error);
        displayError('Erro ao excluir o produto. Tente novamente.');
    });
}
