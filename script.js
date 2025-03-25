document.addEventListener('DOMContentLoaded', async () => {
    showLoading();
    await Promise.all([loadProducts(), loadCategories()]);
    hideLoading();

    const toggleStore = document.getElementById('toggle-store');

    // Carregar o estado inicial do backend
    try {
        const response = await fetch('https://online-store-backend-vw45.onrender.com/api/store-status');
        const data = await response.json();
        toggleStore.checked = data.status === 'open';
    } catch (error) {
        console.error('Erro ao carregar o estado inicial da loja:', error);
    }

    toggleStore.addEventListener('change', async function() {
        const newStatus = toggleStore.checked ? 'open' : 'closed';

        try {
            await fetch('https://online-store-backend-vw45.onrender.com/api/store-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (newStatus === 'open') {
                openStore();
            } else {
                closeStore();
            }
        } catch (error) {
            console.error('Erro ao atualizar o estado da loja:', error);
        }
    });

    // Atualizar o estado da loja baseado no estado inicial
    const storeStatus = toggleStore.checked ? 'open' : 'closed';
    if (storeStatus === 'open') {
        openStore();
    } else {
        closeStore();
    }

    document.getElementById('addProductForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        await addProduct();
    });
});

function openStore() {
    // Lógica para mostrar produtos
    document.querySelectorAll('.product').forEach(product => {
        product.style.display = 'block';
    });
}

function closeStore() {
    // Lógica para esconder produtos
    document.querySelectorAll('.product').forEach(product => {
        product.style.display = 'none';
    });
}

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

async function loadProducts() {
    try {
        const response = await fetch('https://online-store-backend-vw45.onrender.com/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        products = await response.json();
        renderProducts();
        hideError();
    } catch (error) {
        console.error('Error loading products:', error);
        displayError('Erro ao carregar produtos. Tente novamente mais tarde.');
    }
}

async function loadCategories() {
    try {
        const response = await fetch('https://online-store-backend-vw45.onrender.com/api/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        categories = await response.json();
        updateCategoryOptions();
        displayCategories();
        hideError();
    } catch (error) {
        console.error('Error loading categories:', error);
        displayError('Erro ao carregar categorias. Tente novamente mais tarde.');
    }
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
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <p>${product.description}</p>
                <p>Preço: R$ ${product.price.toFixed(2)}</p>
                <button onclick="confirmDeleteProduct('${product._id}')">Excluir Produto</button>
            `;
            categoryDiv.appendChild(productDiv);
        });
    });
}

async function addProduct() {
    showLoading();
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('image', document.getElementById('productImage').files[0]);
    formData.append('category', document.getElementById('productCategory').value);

    try {
        const response = await fetch('https://online-store-backend-vw45.onrender.com/api/products', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const product = await response.json();
        products.push(product);
        renderProducts();
        document.getElementById('addProductForm').reset();
        hideError();
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        displayError('Erro ao adicionar o produto. Verifique os dados e tente novamente.');
    } finally {
        hideLoading();
    }
}

async function confirmDeleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        await deleteProduct(id);
    }
}

async function deleteProduct(id) {
    showLoading();
    try {
        const response = await fetch(`https://online-store-backend-vw45.onrender.com/api/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        products = products.filter(product => product._id !== id);
        renderProducts();
        hideError();
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        displayError('Erro ao excluir o produto. Tente novamente.');
    } finally {
        hideLoading();
    }
}

async function addCategory() {
    showLoading();
    const newCategoryName = document.getElementById('newCategoryName').value.trim();
    if (!newCategoryName) {
        hideLoading();
        return displayError('Por favor, insira o nome da categoria.');
    }

    try {
        const response = await fetch('https://online-store-backend-vw45.onrender.com/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newCategoryName })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        await loadCategories(); // Recarrega a lista de categorias
        document.getElementById('manageCategoriesForm').reset();
        hideError();
    } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        displayError(error.message.includes('já existe') ? 'Esta categoria já existe.' : 'Erro ao adicionar categoria.');
    } finally {
        hideLoading();
    }
}

async function removeCategory(category) {
    if (confirm('Tem certeza que deseja remover esta categoria? Isso afetará os produtos associados.')) {
        showLoading();
        try {
            const response = await fetch(`https://online-store-backend-vw45.onrender.com/api/categories/${category}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            products = products.map(product => {
                if (product.category === category) {
                    product.category = '';
                }
                return product;
            });
            await loadCategories(); // Recarrega a lista de categorias
            renderProducts();
            hideError();
        } catch (error) {
            console.error('Erro ao remover categoria:', error);
            displayError('Erro ao remover categoria.');
        } finally {
            hideLoading();
        }
    }
}
