document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();

    document.getElementById('addProductForm').addEventListener('submit', (event) => {
        event.preventDefault();
        addProduct();
    });
});

let products = [];
let categories = [];

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
        loadingElement.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

function loadProducts() {
    showLoading();
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
        hideLoading();
    });
}

function loadCategories() {
    showLoading();
    fetch('https://online-store-backend-vw45.onrender.com/api/categories', {
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
        categories = data;
        updateCategoryOptions();
        displayCategories();
        hideError();
    })
    .catch(error => {
        console.error('Error loading categories:', error);
        displayError('Erro ao carregar categorias. Tente novamente mais tarde.');
    })
    .finally(() => {
        hideLoading();
    });
}

function updateCategoryOptions() {
    const productCategorySelect = document.getElementById('productCategory');
    productCategorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.replace('-', ' ');
        productCategorySelect.appendChild(option);
    });
}

function displayCategories() {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-item');
        categoryItem.innerHTML = `
            <input type="text" value="${category.replace('-', ' ')}" data-category="${category}" readonly>
            <button class="remove-btn" onclick="removeCategory('${category}')">Remover</button>
        `;
        categoriesList.appendChild(categoryItem);
    });
}

function renderProducts() {
    const productsDiv = document.getElementById('products');
    productsDiv.innerHTML = '';

    const productsByCategory = {};
    products.forEach(product => {
        const category = product.category || 'sem-categoria';
        if (!productsByCategory[category]) {
            productsByCategory[category] = [];
        }
        productsByCategory[category].push(product);
    });

    Object.keys(productsByCategory).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');
        categoryDiv.innerHTML = `<h3>${category.replace('-', ' ')}</h3>`;
        productsDiv.appendChild(categoryDiv);

        productsByCategory[category].forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p>Preço: R$ ${product.price.toFixed(2)}</p>
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <button onclick="confirmDeleteProduct('${product._id}')">Excluir Produto</button>
            `;
            categoryDiv.appendChild(productDiv);
        });
    });
}

function addProduct() {
    showLoading();
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('image', document.getElementById('productImage').files[0]);
    formData.append('category', document.getElementById('productCategory').value);

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
        hideLoading();
    });
}

function confirmDeleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        deleteProduct(id);
    }
}

function deleteProduct(id) {
    showLoading();
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
        hideLoading();
    });
}

function addCategory() {
    showLoading();
    const newCategoryName = document.getElementById('newCategoryName').value.trim();
    if (!newCategoryName) {
        hideLoading();
        return displayError('Por favor, insira o nome da categoria.');
    }

    fetch('https://online-store-backend-vw45.onrender.com/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName })
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(() => {
        loadCategories(); // Recarrega a lista de categorias
        document.getElementById('manageCategoriesForm').reset();
        hideError();
    })
    .catch(error => {
        console.error('Erro ao adicionar categoria:', error);
        displayError(error.message.includes('já existe') ? 'Esta categoria já existe.' : 'Erro ao adicionar categoria.');
    })
    .finally(() => {
        hideLoading();
    });
}

function removeCategory(category) {
    if (confirm('Tem certeza que deseja remover esta categoria? Isso afetará os produtos associados.')) {
        showLoading();
        fetch(`https://online-store-backend-vw45.onrender.com/api/categories/${category}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            products = products.map(product => {
                if (product.category === category) {
                    product.category = '';
                }
                return product;
            });
            loadCategories(); // Recarrega a lista de categorias
            renderProducts();
            hideError();
        })
        .catch(error => {
            console.error('Erro ao remover categoria:', error);
            displayError('Erro ao remover categoria.');
        })
        .finally(() => {
            hideLoading();
        });
    }
}
