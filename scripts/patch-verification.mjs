import fs from 'node:fs';

// 1. StoreHeader.jsx
{
  let file = 'src/components/home/StoreHeader.jsx';
  let c = fs.readFileSync(file, 'utf8');
  let reg = /<a href="#account"[\s\S]*?<\/a>/;
  if (reg.test(c)) {
    c = c.replace(reg, (match) => `{user ? (\n          ${match.trim()}\n        ) : null}`);
    fs.writeFileSync(file, c, 'utf8');
    console.log('✅ StoreHeader.jsx patched');
  }
}

// 2. MobileBottomNav.jsx
{
  let file = 'src/components/home/MobileBottomNav.jsx';
  let c = fs.readFileSync(file, 'utf8');
  let reg = /<div className="mms-account">[\s\S]*?<\/div>/;
  if (reg.test(c)) {
    c = c.replace(reg, (match) => `{user ? (\n        ${match.trim()}\n        ) : null}`);
    fs.writeFileSync(file, c, 'utf8');
    console.log('✅ MobileBottomNav.jsx patched');
  }
}

// 3. Storefront.jsx
{
  let file = 'src/storefront/Storefront.jsx';
  let c = fs.readFileSync(file, 'utf8');
  let reg = /if \(!live\.current\.user\) \{[\s\S]*?checkout\.openBasket\(\)\s*\}/;
  if (reg.test(c)) {
    c = c.replace(reg, `showToast(\`"\${product.name}" added to basket!\`, 'success')\n        checkout.openBasket()`);
    fs.writeFileSync(file, c, 'utf8');
    console.log('✅ Storefront.jsx patched');
  }
}

// 4. useCheckout.js
{
  let file = 'src/hooks/useCheckout.js';
  let c = fs.readFileSync(file, 'utf8');
  let reg = /const startCheckout = \(\) => \{[\s\S]*?if \(!cartRef\.current\.length\)/;
  if (reg.test(c)) {
    c = c.replace(reg, `const startCheckout = () => {\n      // Guest checkout allowed for verification without forcing login\n      if (!cartRef.current.length)`);
    fs.writeFileSync(file, c, 'utf8');
    console.log('✅ useCheckout.js patched');
  }
}

// 5. server/server.js
{
  let file = 'server/server.js';
  let c = fs.readFileSync(file, 'utf8');
  
  // replace requireAuth() on /api/payments/create-order
  let regPay = /app\.post\('\/api\/payments\/create-order',\s*requireAuth\(\),\s*async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?const user = req\.user;/;
  if (regPay.test(c)) {
    c = c.replace(regPay, (match) => {
      return match
        .replace("app.post('/api/payments/create-order', requireAuth(),", "app.post('/api/payments/create-order',")
        .replace("const user = req.user;", "const user = await getAuthenticatedUser(req);");
    });
    console.log('✅ server.js payments route patched');
  }

  // replace requireAuth() on /api/orders
  let regOrd = /app\.post\('\/api\/orders',\s*requireAuth\(\),\s*async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?const user = req\.user;/;
  if (regOrd.test(c)) {
    c = c.replace(regOrd, (match) => {
      return match
        .replace("app.post('/api/orders', requireAuth(),", "app.post('/api/orders',")
        .replace("const user = req.user;", "const user = await getAuthenticatedUser(req);");
    });
    console.log('✅ server.js orders route patched');
  }

  fs.writeFileSync(file, c, 'utf8');
}
