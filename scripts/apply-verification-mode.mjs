import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function replaceInFile(relPath, search, replacement) {
  const fullPath = path.join(rootDir, relPath);
  let content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes(search)) {
    console.error(`❌ Search string not found in ${relPath}`);
    return false;
  }
  content = content.replace(search, replacement);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Updated ${relPath}`);
  return true;
}

// 1. Header.jsx - Hide login / account button if not signed in
{
  const fullPath = path.join(rootDir, 'src/storefront/sections/Header.jsx');
  let content = fs.readFileSync(fullPath, 'utf8');
  const target = `<div className="action-item" id="headerAccountBtn"`;
  if (content.includes(target) && !content.includes(`{user ? (`)) {
    content = content.replace(
      target,
      `{user ? (\n          <div className="action-item" id="headerAccountBtn"`
    );
    // Find the end of this div block
    const endTarget = `tabIndex={0} style={{ cursor: 'pointer' }}>`;
    const idx = content.indexOf(endTarget);
    if (idx !== -1) {
      // Find the closing </div> of headerAccountBtn right before cartTrigger
      const cartIdx = content.indexOf(`id="cartTrigger"`);
      const beforeCart = content.slice(0, cartIdx);
      const lastDivIdx = beforeCart.lastIndexOf(`</div>`);
      const secondLastDivIdx = beforeCart.slice(0, lastDivIdx).lastIndexOf(`</div>`);
      if (secondLastDivIdx !== -1) {
        content = content.slice(0, lastDivIdx) + `</div>) : null}` + content.slice(lastDivIdx + 6);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated Header.jsx (hidden account button for guests)`);
      }
    }
  }
}

// 2. StoreHeader.jsx - Hide mobile account icon if not logged in
{
  const fullPath = path.join(rootDir, 'src/components/home/StoreHeader.jsx');
  let content = fs.readFileSync(fullPath, 'utf8');
  const oldCode = `<a href="#account" className="sb-store-action" data-account-open onClick={showAccount} aria-label={user ? 'My account' : 'Sign in'}>
            <i className={user ? 'fa-solid fa-circle-check sb-store-signed-in' : 'fa-regular fa-circle-user'} aria-hidden="true"></i>
          </a>`;
  const newCode = `{user ? (
          <a href="#account" className="sb-store-action" data-account-open onClick={showAccount} aria-label="My account">
            <i className="fa-solid fa-circle-check sb-store-signed-in" aria-hidden="true"></i>
          </a>
        ) : null}`;
  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated StoreHeader.jsx (hidden mobile account icon)`);
  }
}

// 3. MobileBottomNav.jsx - Hide mobile account row if not logged in
{
  const fullPath = path.join(rootDir, 'src/components/home/MobileBottomNav.jsx');
  let content = fs.readFileSync(fullPath, 'utf8');
  const oldCode = `<div className="mms-account">
          <div className="mms-avatar"><i className="fa-solid fa-user" aria-hidden="true"></i></div>
          <div className="mms-account-text">
            <strong>{user ? \`Hi, \${user.name || 'Farmer'}\` : 'Welcome to Sathyam Agro Mart'}</strong>
            <span>{accountSub}</span>
          </div>
          <button type="button" className="mms-account-btn" data-account-open onClick={handleAccountClick}>
            {user ? 'My Account' : 'Sign In'}
          </button>
        </div>`;
  const newCode = `{user ? (
        <div className="mms-account">
          <div className="mms-avatar"><i className="fa-solid fa-user" aria-hidden="true"></i></div>
          <div className="mms-account-text">
            <strong>{user ? \`Hi, \${user.name || 'Farmer'}\` : 'Welcome to Sathyam Agro Mart'}</strong>
            <span>{accountSub}</span>
          </div>
          <button type="button" className="mms-account-btn" data-account-open onClick={handleAccountClick}>
            My Account
          </button>
        </div>
        ) : null}`;
  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated MobileBottomNav.jsx (hidden mobile menu sign in)`);
  }
}

// 4. AllProducts.jsx - Hide mobile header account icon if not logged in
{
  const fullPath = path.join(rootDir, 'src/pages/AllProducts.jsx');
  let content = fs.readFileSync(fullPath, 'utf8');
  const oldCode = `<Link to="/#login" className="mobile-header-icon-btn" aria-label="Account">
              <User size={20} />
            </Link>`;
  const newCode = `{user ? (
            <Link to="/#login" className="mobile-header-icon-btn" aria-label="Account">
              <User size={20} />
            </Link>
            ) : null}`;
  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated AllProducts.jsx (hidden mobile user link)`);
  }
}

// 5. Storefront.jsx - Remove forced sign-in on addToCart
{
  const fullPath = path.join(rootDir, 'src/storefront/Storefront.jsx');
  let content = fs.readFileSync(fullPath, 'utf8');
  const oldCode = `      if (!live.current.user) {
        showToast(\`"\${product.name}" added to cart!\`, 'success')
        openSignIn('Login or Sign Up is mandatory to access your basket and complete checkout.')
      } else {
        showToast(\`"\${product.name}" added to basket!\`, 'success')
        checkout.openBasket()
      }`;
  const newCode = `      // Smooth add to basket without forced login for verification
      showToast(\`"\${product.name}" added to basket!\`, 'success')
      checkout.openBasket()`;
  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated Storefront.jsx (disabled forced login on cart add)`);
  }
}

// 6. useCheckout.js - Allow guest checkout in startCheckout
{
  const fullPath = path.join(rootDir, 'src/hooks/useCheckout.js');
  let content = fs.readFileSync(fullPath, 'utf8');
  const oldCode = `    // Checkout, on the basket step (and "Proceed to checkout" on a product page).
    const startCheckout = () => {
      if (!live.current.user || !hasToken()) {
        if (!live.current.step) showStep('basket')
        requireSignIn()
        return
      }
      if (!cartRef.current.length) {
        showToast('Your basket is empty. Add products from the catalog first.', 'warning')
        return
      }
      showStep('address')
    }`;
  const newCode = `    // Checkout, on the basket step (and "Proceed to checkout" on a product page).
    const startCheckout = () => {
      // Guest checkout allowed for verification without forcing login:
      if (!cartRef.current.length) {
        showToast('Your basket is empty. Add products from the catalog first.', 'warning')
        return
      }
      showStep('address')
    }`;
  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated useCheckout.js (enabled guest checkout)`);
  }
}

// 7. server.js - Make authentication optional on payments/create-order and orders
{
  const fullPath = path.join(rootDir, 'server/server.js');
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace requireAuth() on /api/payments/create-order
  const oldPayRoute = `app.post('/api/payments/create-order', requireAuth(), async (req, res) => {
  try {
    const wait = await rateLimit(\`checkout-ip:\${clientIp(req)}\`, 30, HOUR_MS);
    if (wait) return tooManyRequests(res, wait, 'Too many checkout attempts. Please try again later.');

    const user = req.user;`;
  const newPayRoute = `app.post('/api/payments/create-order', async (req, res) => {
  try {
    const wait = await rateLimit(\`checkout-ip:\${clientIp(req)}\`, 30, HOUR_MS);
    if (wait) return tooManyRequests(res, wait, 'Too many checkout attempts. Please try again later.');

    const user = await getAuthenticatedUser(req);`;
    
  if (content.includes(oldPayRoute)) {
    content = content.replace(oldPayRoute, newPayRoute);
    console.log(`✅ Updated server.js (/api/payments/create-order allows guest payments)`);
  }

  // Replace requireAuth() on /api/orders
  const oldOrderRoute = `app.post('/api/orders', requireAuth(), async (req, res) => {
  try {
    const wait = await rateLimit(\`order-ip:\${clientIp(req)}\`, 20, HOUR_MS);
    if (wait) return tooManyRequests(res, wait, 'Too many orders from this connection. Please try again later.');

    const user = req.user;`;
  const newOrderRoute = `app.post('/api/orders', async (req, res) => {
  try {
    const wait = await rateLimit(\`order-ip:\${clientIp(req)}\`, 20, HOUR_MS);
    if (wait) return tooManyRequests(res, wait, 'Too many orders from this connection. Please try again later.');

    const user = await getAuthenticatedUser(req);`;
    
  if (content.includes(oldOrderRoute)) {
    content = content.replace(oldOrderRoute, newOrderRoute);
    console.log(`✅ Updated server.js (/api/orders allows guest orders)`);
  }

  fs.writeFileSync(fullPath, content, 'utf8');
}

console.log('🎉 Done applying verification mode!');
