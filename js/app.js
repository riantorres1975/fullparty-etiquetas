const API = 'http://127.0.0.1:8000'; 

window.onload = () => {
    loadConfig();
    fetchProducts();
    setupEnterNavigation();
};

function setupEnterNavigation() {
    const sku = document.getElementById('sku');
    const name = document.getElementById('name');
    const price = document.getElementById('price');

    sku.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            if (sku.value.trim() === '') {
                genSku(); 
            } else {
                name.focus();       
            }
        }
    });

    name.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            price.focus();      
        }
    });

    price.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveProduct();      
        }
    });
}

function loadConfig() {
    const savedStoreName = localStorage.getItem('fp_storeName');
    const savedShowStoreName = localStorage.getItem('fp_showStoreName');
    const savedShowPrice = localStorage.getItem('fp_showPrice');

    if (savedStoreName !== null) document.getElementById('storeName').value = savedStoreName;
    if (savedShowStoreName !== null) document.getElementById('showStoreName').checked = savedShowStoreName === 'true';
    if (savedShowPrice !== null) document.getElementById('showPrice').checked = savedShowPrice === 'true';

    toggleStoreInputVisuals(); 
}

function saveConfig() {
    localStorage.setItem('fp_storeName', document.getElementById('storeName').value);
    localStorage.setItem('fp_showStoreName', document.getElementById('showStoreName').checked);
    localStorage.setItem('fp_showPrice', document.getElementById('showPrice').checked);

    toggleStoreInputVisuals(); 
}

function toggleStoreInputVisuals() {
    const isChecked = document.getElementById('showStoreName').checked;
    const input = document.getElementById('storeName');
    input.disabled = !isChecked;
    if (isChecked) {
        input.classList.remove('opacity-50', 'bg-gray-200');
    } else {
        input.classList.add('opacity-50', 'bg-gray-200');
    }
}

async function fetchProducts() {
    const search = document.getElementById('search').value;
    try {
        const res = await fetch(`${API}/products/?search=${search}`);
        const products = await res.json();
        
        const tbody = document.getElementById('table-body');
        const mobileList = document.getElementById('mobile-list');
        
        tbody.innerHTML = ''; 
        mobileList.innerHTML = ''; 

        if(products.length === 0) {
            mobileList.innerHTML = '<p class="text-center text-gray-400 py-6">No hay productos.</p>';
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-400 py-6">No hay productos.</td></tr>';
            return;
        }

        products.forEach(p => {
            const safeName = p.name.replace(/'/g, "\\'");

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-purple-50 cursor-pointer transition border-b border-gray-50';
            tr.onclick = () => loadForm(p.sku, p.name, p.price);
            tr.innerHTML = `
                <td class="p-4 font-mono text-gray-600 font-bold">${p.sku}</td>
                <td class="p-4 font-medium text-gray-800">${p.name}</td>
                <td class="p-4 font-bold text-teal-600 text-lg">$${p.price.toFixed(2)}</td>
                <td class="p-4 flex justify-center gap-2">
                    <button onclick="event.stopPropagation(); loadForm('${p.sku}', '${safeName}', ${p.price})" class="bg-amber-50 border border-amber-200 text-amber-600 px-3 py-2 rounded-lg font-bold hover:bg-amber-100 transition" title="Editar">✏️</button>
                    <button onclick="event.stopPropagation(); printLabel('${p.sku}')" class="bg-teal-50 border border-teal-200 text-teal-600 px-4 py-2 rounded-lg font-bold hover:bg-teal-100 transition" title="Imprimir">🖨</button>
                    
                    <button onclick="event.stopPropagation(); confirmDelete('${p.sku}', this)" class="bg-red-50 border border-red-200 text-red-500 px-3 py-2 rounded-lg font-bold hover:bg-red-100 transition whitespace-nowrap min-w-[40px]" title="Eliminar">🗑</button>
                </td>
            `;
            tbody.appendChild(tr);

            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 active:bg-gray-50 transition';
            card.innerHTML = `
                <div class="flex justify-between items-start" onclick="loadForm('${p.sku}', '${safeName}', ${p.price})">
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg leading-tight">${p.name}</h3>
                        <span class="inline-block mt-1 text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">SKU: ${p.sku}</span>
                    </div>
                    <span class="font-black text-teal-600 text-xl pl-2">$${p.price.toFixed(2)}</span>
                </div>
                <div class="flex gap-2 mt-1 pt-3 border-t border-gray-100">
                    <button onclick="event.stopPropagation(); loadForm('${p.sku}', '${safeName}', ${p.price})" class="flex-1 bg-amber-50 border border-amber-200 text-amber-700 py-2 rounded-lg font-bold text-sm shadow-sm active:bg-amber-100">✏️ Editar</button>
                    <button onclick="event.stopPropagation(); printLabel('${p.sku}')" class="flex-1 bg-teal-50 border border-teal-200 text-teal-700 py-2 rounded-lg font-bold text-sm shadow-sm active:bg-teal-100">🖨 Imprimir</button>
                    
                    <button onclick="event.stopPropagation(); confirmDelete('${p.sku}', this)" class="flex-none bg-red-50 border border-red-200 text-red-500 px-4 py-2 rounded-lg font-bold text-sm shadow-sm active:bg-red-100 whitespace-nowrap">🗑</button>
                </div>
            `;
            mobileList.appendChild(card);
        });
    } catch (error) {
        console.error("Error conectando al servidor Python:", error);
    }
}

function loadForm(sku, name, price) {
    document.getElementById('sku').value = sku;
    document.getElementById('name').value = name;
    document.getElementById('price').value = price;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveProduct() {
    const skuInput = document.getElementById('sku');
    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    
    let sku = skuInput.value.trim();
    let name = nameInput.value.trim();
    const price = priceInput.value;

    if (!name) {
        nameInput.focus();
        return;
    }
    if (!price) {
        priceInput.focus();
        return;
    }

    name = name.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');

    await fetch(`${API}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, name, price: Number(price) })
    });

    skuInput.value = '';
    nameInput.value = '';
    priceInput.value = '';
    
    fetchProducts();
    skuInput.focus();
}

// --- MAGIA DEL BOTÓN DE ELIMINAR INTELIGENTE ---
function confirmDelete(sku, btnElement) {
    // Si ya le había dado clic una vez, lo borramos de verdad
    if (btnElement.dataset.confirming === "true") {
        executeDelete(sku);
    } else {
        // Es el primer clic: Transformamos el botón
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '⚠️ Seguro?';
        btnElement.dataset.confirming = "true";
        
        // Cambiamos colores a rojo peligro
        btnElement.classList.remove('bg-red-50', 'text-red-500', 'border-red-200');
        btnElement.classList.add('bg-red-600', 'text-white', 'border-red-600');
        
        // Le damos 3 segundos antes de que se arrepienta
        setTimeout(() => {
            // Verificamos que el botón no haya desaparecido de la pantalla
            if(btnElement && btnElement.parentElement) {
                btnElement.innerHTML = originalHtml;
                btnElement.dataset.confirming = "false";
                btnElement.classList.remove('bg-red-600', 'text-white', 'border-red-600');
                btnElement.classList.add('bg-red-50', 'text-red-500', 'border-red-200');
            }
        }, 3000);
    }
}

async function executeDelete(sku) {
    await fetch(`${API}/products/${sku}`, { method: 'DELETE' });
    await fetchProducts();
    // Forzamos el cursor para seguir trabajando
    document.getElementById('sku').focus();
}
// ----------------------------------------------

function printLabel(sku) {
    const showPrice = document.getElementById('showPrice').checked;
    const showStoreName = document.getElementById('showStoreName').checked;
    const storeNameInput = document.getElementById('storeName').value.trim();
    
    const finalStoreName = (showStoreName && storeNameInput) ? storeNameInput : " "; 
    
    const url = `${API}/print/label/${sku}?store_name=${encodeURIComponent(finalStoreName)}&show_price=${showPrice}`;
    window.open(url, '_blank');
}

async function genSku() {
    const res = await fetch(`${API}/utils/sku/EAN13`);
    const data = await res.json();
    document.getElementById('sku').value = data.sku;
    
    document.getElementById('name').focus();
}