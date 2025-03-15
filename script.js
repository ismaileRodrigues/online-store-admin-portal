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

function showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'flex'; // Mostrar o loader
    }
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none'; // Ocultar o loader
    }
}

function loadProducts() {
    showLoading(); // Mostrar o loader antes de carregar os produtos
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
        hideError();
    })
    .catch(error => {
        console.error('Error loading products:', error);
        displayError('Erro ao carregar produtos. Tente novamente mais tarde.');
    })
    .finally(() => {
        hideLoading(); // Ocultar o loader após carregar os produtos
    });
}

function renderProducts() {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';
    products.forEach((product) => {
        console.log('Rendering product:', product);
        const imageUrl = product.image;
        console.log('Image URL:', imageUrl);
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Preço: R$ ${product.price.toFixed(2)}</p>
            <button onclick="confirmDeleteProduct('${product._id}')">Excluir Produto</button>
        `;
        productsContainer.appendChild(productElement);
    });
}

function addProduct() {
    showLoading(); // Mostrar o loader antes de adicionar o produto
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
        hideError();
    })
    .catch(error => {
        console.error('Erro ao adicionar produto:', error);
        displayError('Erro ao adicionar o produto. Verifique os dados e tente novamente.');
    })
    .finally(() => {
        hideLoading(); // Ocultar o loader após adicionar o produto
    });
}

function confirmDeleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        deleteProduct(id);
    }
}

function deleteProduct(id) {
    showLoading(); // Mostrar o loader antes de excluir o produto
    console.log('Deleting product with ID:', id);
    fetch(`https://online-store-backend-vw45.onrender.com/api/products/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        products = products.filter(product => product._id !== id);
        renderProducts();
        hideError();
    })
    .catch(error => {
        console.error('Erro ao excluir produto:', error);
        displayError('Erro ao excluir o produto. Tente novamente.');
    })
    .finally(() => {
        hideLoading(); // Ocultar o loader após excluir o produto
    });
}
