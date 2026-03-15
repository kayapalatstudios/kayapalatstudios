// --- 1. SETTINGS SHEET URL ---
// 👇 YAHAN APNA 'Kayapalat - Settings' WALA CSV LINK DAALEIN 👇
const SETTINGS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_Kg5XqFgNVxYoH3SP0BazuL8R22pYdDv0FJ0XZomAFEeuTKCdVKxAkgV8_8D7MjpguNAbYb8vN8ga/pub?gid=575328564&single=true&output=csv"; 

// --- 2. EXISTING PRODUCT SHEETS ---
const FASHION_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_Kg5XqFgNVxYoH3SP0BazuL8R22pYdDv0FJ0XZomAFEeuTKCdVKxAkgV8_8D7MjpguNAbYb8vN8ga/pub?gid=0&single=true&output=csv";
const FURNISHINGS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_Kg5XqFgNVxYoH3SP0BazuL8R22pYdDv0FJ0XZomAFEeuTKCdVKxAkgV8_8D7MjpguNAbYb8vN8ga/pub?gid=809165328&single=true&output=csv";

let fashionProducts = [];
let furnishingsProducts = [];
let siteSettings = {};

// --- 3. ADVANCED MAGICAL PRELOADER ---
const introVideo = document.getElementById('introVideo');
let preloaderTriggered = false; 

if(introVideo) {
    // ✨ FIX: Video khatam hone se theek 0.1s pehle pause kar do taaki Black Screen na aaye
    introVideo.addEventListener('timeupdate', () => {
        if (introVideo.duration && introVideo.currentTime >= introVideo.duration - 0.1) {
            if(!preloaderTriggered) {
                preloaderTriggered = true;
                introVideo.pause(); // Video yahin freeze ho jayegi
                
                // 2 second ka freeze time
                setTimeout(() => {
                    animateToLogo();
                }, 2000); 
            }
        }
    });
    introVideo.onerror = () => { hidePreloader(); };
}

// Fallback: Agar video na chale
setTimeout(() => { 
    if(!preloaderTriggered && document.getElementById('preloader')) hidePreloader(); 
}, 15000);


function animateToLogo() {
    preloaderTriggered = true;
    const preloader = document.getElementById('preloader');
    const video = document.getElementById('introVideo');
    const logo = document.getElementById('headerLogo');

    if(preloader && video && logo) {
        const logoRect = logo.getBoundingClientRect();
        
        // Coordinates and Scale
        const moveX = logoRect.left + (logoRect.width / 2) - (window.innerWidth / 2);
        const moveY = logoRect.top + (logoRect.height / 2) - (window.innerHeight / 2);
        const scaleSize = logoRect.width / window.innerWidth;

        // Background turant clear karo taaki website dikhe
        preloader.style.backgroundColor = 'transparent'; 

        // ✨ THE MAGICAL ANIMATION ✨
        // 1.5s ka smooth flight aur end mein ja kar fade out hona
        video.style.transition = 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease 1.2s, border-radius 1.5s ease, filter 1.5s ease'; 
        
        // Udte time video thodi round hogi aur chamkegi (Glow effect)
        video.style.borderRadius = '30%'; 
        video.style.filter = 'drop-shadow(0px 0px 25px rgba(200, 107, 71, 0.8))'; 
        
        // Logo ki taraf fly karna with slight magical tilt (5deg)
        video.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scaleSize}) rotate(5deg)`;
        video.style.opacity = '0'; // Ye 1.2s delay ke baad hi apply hoga, pehle nahi

        // Animation khatam hone par safai
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 1500);
    } else {
        hidePreloader(); 
    }
}

function hidePreloader() {
    preloaderTriggered = true;
    const preloader = document.getElementById('preloader');
    if(preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 800);
    }
}

// --- 4. DATA FETCHING & RENDERING LOGIC ---

async function fetchData(url, type) {
    if(!url) return type === 'settings' ? {} : [];
    try {
        const response = await fetch(url);
        const data = await response.text();
        return type === 'settings' ? parseSettingsCSV(data) : parseProductsCSV(data);
    } catch (error) { return type === 'settings' ? {} : []; }
}

function parseSettingsCSV(str) {
    const settings = {};
    const rows = str.split('\n');
    if(rows.length < 2) return settings;
    for(let i=1; i<rows.length; i++) {
        if(!rows[i].trim()) continue;
        let currentline = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if(currentline.length >= 2) {
            let key = currentline[0].trim().toUpperCase();
            let val = currentline[1].trim();
            if(val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1).replace(/""/g, '"');
            settings[key] = val;
        }
    }
    return settings;
}

function parseProductsCSV(str) {
    const result = [];
    const rows = str.split('\n');
    if(rows.length < 2) return result;
    const headers = rows[0].split(',').map(h => h.trim().toUpperCase());
    for(let i=1; i<rows.length; i++) {
        if(!rows[i].trim()) continue;
        let currentline = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const obj = {};
        for(let j=0; j<headers.length; j++){
            let val = currentline[j] ? currentline[j].trim() : '';
            if(val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1).replace(/""/g, '"');
            let h = headers[j];
            if(h === "ID") obj.id = val;
            if(h === "CATEGORY") obj.category = val;
            if(h === "NAME") obj.name = val;
            if(h === "PRICE") obj.price = parseInt(val.replace(/[^0-9]/g, '')) || 0;
            if(h === "SIZE" || h === "SIZES") obj.sizes = val; 
            if(h === "DESCRIPTION" || h === "DESC") obj.desc = val;
            if(h === "IMAGE_MAIN") obj.img = val;
            if(h === "IMAGE_HOVER") obj.hoverImg = val;
        }
        if(obj.id) result.push(obj);
    }
    return result;
}

function applySiteSettings() {
    if(siteSettings['HERO_IMAGE']) {
        document.getElementById('dynamicHeroBg').style.backgroundImage = `url('${siteSettings['HERO_IMAGE']}')`;
    }
    if(siteSettings['MARQUEE_TEXT']) {
        const mText = siteSettings['MARQUEE_TEXT'] + ' &nbsp; ✨ &nbsp; ';
        document.getElementById('dynamicMarquee').innerHTML = mText.repeat(5);
    }
}

window.addEventListener('load', async () => {
    try {
        siteSettings = await fetchData(SETTINGS_URL, 'settings');
        applySiteSettings();

        fashionProducts = await fetchData(FASHION_URL, 'products');
        furnishingsProducts = await fetchData(FURNISHINGS_URL, 'products');

        renderCards('fashionGrid', fashionProducts);
        renderCards('furnishingsGrid', furnishingsProducts);
        
        let featured = [];
        if(fashionProducts.length > 0) featured.push(fashionProducts[0]);
        if(furnishingsProducts.length > 0) featured.push(furnishingsProducts[0]);
        if(fashionProducts.length > 1) featured.push(fashionProducts[1]);
        renderCards('featuredGrid', featured);

        updateCart();
    } catch(e) { console.log("Error loading", e); hidePreloader(); }
});

window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if(window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
});

function toggleMobileMenu() {
    document.getElementById('navbar').classList.toggle('open');
    document.querySelector('.hamburger').classList.toggle('open');
}

function openPage(page) {
    closeAll();
    document.getElementById('navbar').classList.remove('open');
    document.querySelector('.hamburger').classList.remove('open');
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(page).classList.add("active");
    document.querySelectorAll("nav a").forEach(link => link.classList.remove("active-link"));
    let activeLink = document.querySelector(`nav a[data-target="${page}"]`);
    if(activeLink) activeLink.classList.add("active-link");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterCategory(category, type, btnElement) {
    const parent = document.getElementById(`${type === 'fashion' ? 'fashion-categories' : 'furnishings-categories'}`);
    parent.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    let data = type === 'fashion' ? fashionProducts : furnishingsProducts;
    if(category !== 'All') data = data.filter(p => p.category === category);
    renderCards(type === 'fashion' ? 'fashionGrid' : 'furnishingsGrid', data);
}

function renderCards(containerId, products) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if(!products || products.length === 0) return;
    products.forEach(p => {
        const hoverHtml = p.hoverImg ? `<img class="img-hover" src="${p.hoverImg}">` : '';
        const displayPrice = p.price !== undefined ? p.price.toLocaleString('en-IN') : '0';
        container.innerHTML += `
            <div class="card" onclick="openPopup('${p.id}')">
                <div class="img-container">
                    <img class="img-main" src="${p.img}">
                    ${hoverHtml}
                </div>
                <div class="card-content">
                    <h3>${p.name || 'Item'}</h3>
                    <p class="price">₹${displayPrice}</p>
                </div>
            </div>`;
    });
}

function openPopup(id) {
    const product = [...fashionProducts, ...furnishingsProducts].find(item => item.id === id);
    if(!product) return;
    document.getElementById('overlay').classList.add("active");
    document.getElementById('productPopup').classList.add("active");
    document.getElementById('popupImg').src = product.img;
    document.getElementById('popupName').innerText = product.name;
    document.getElementById('popupPrice').innerText = "₹" + (product.price !== undefined ? product.price.toLocaleString('en-IN') : '0');
    document.getElementById('popupDesc').innerText = product.desc;
    const sizesContainer = document.getElementById('popupSizes');
    sizesContainer.innerHTML = '';
    if(product.sizes) {
        product.sizes.split(',').map(s => s.trim()).forEach((size, index) => {
            sizesContainer.innerHTML += `<button class="size-btn ${index === 0 ? 'selected' : ''}" onclick="selectSize(this)">${size}</button>`;
        });
    }
    document.getElementById('popupCartBtn').onclick = () => { addToCart(product.id, product.name, product.price, product.img); closeAll(); toggleCart(); }
}

function selectSize(element) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');
}

function closeAll() {
    document.getElementById('cartBox').classList.remove("active");
    document.getElementById('productPopup').classList.remove("active");
    document.getElementById('overlay').classList.remove("active");
}

function toggleCart() {
    document.getElementById('navbar').classList.remove('open');
    document.querySelector('.hamburger').classList.remove('open');
    document.getElementById('overlay').classList.toggle("active");
    document.getElementById('cartBox').classList.toggle("active");
}

function getCart() { return JSON.parse(localStorage.getItem("kpCartBoho")) || []; }
function saveCart(cart) { localStorage.setItem("kpCartBoho", JSON.stringify(cart)); updateCart(); }
function addToCart(id, name, price, img) {
    let cart = getCart();
    let item = cart.find(i => i.id === id);
    if(item) item.qty++;
    else cart.push({ id, name: name, price: price, img, qty: 1 });
    saveCart(cart);
}

function updateCart() {
    let cart = getCart();
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = "";
    let total = 0, count = 0;
    if(cart.length === 0) { cartItems.innerHTML = `<p style="color:var(--text-muted); margin-top:30px;">Your bag is empty.</p>`; } 
    else {
        cart.forEach((i, index) => {
            total += i.price * i.qty; count += i.qty;
            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${i.img}">
                    <div class="cart-item-details">
                        <h4>${i.name}</h4>
                        <p style="color:var(--accent); font-size:14px; margin:5px 0;">₹${i.price.toLocaleString('en-IN')}</p>
                        <p style="font-size:13px; color: var(--text-muted);">Qty: ${i.qty}</p>
                        <button onclick="removeItem(${index})" style="background:none; border:none; text-decoration:underline; color:#999; cursor:pointer; margin-top:10px;">Remove</button>
                    </div>
                </div>`;
        });
    }
    document.getElementById('cartTotal').innerText = "₹" + total.toLocaleString('en-IN');
    document.getElementById('cartCount').innerText = `(${count})`;
}
function removeItem(index) { let cart = getCart(); cart.splice(index, 1); saveCart(cart); }
