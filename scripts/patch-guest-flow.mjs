import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

// --- 1. src/hooks/useCheckout.js ---
const checkoutPath = path.join(rootDir, 'src', 'hooks', 'useCheckout.js');
let checkoutCode = fs.readFileSync(checkoutPath, 'utf8');

// A: newDraft mode & saveAddress for guest
checkoutCode = checkoutCode.replace(
  "const newDraft = user => ({ userId: user?.id || '', mode: 'auto', addressId: '', saveAddress: true, payment: 'cod', usePoints: false, fields: initialFields(user) })",
  "const newDraft = user => ({ userId: user?.id || '', mode: user ? 'auto' : 'new', addressId: '', saveAddress: Boolean(user), payment: 'cod', usePoints: false, fields: initialFields(user) })"
);

// B: addresses initial state
checkoutCode = checkoutCode.replace(
  "const [addresses, setAddressesState] = useState(null) // null until loaded",
  "const [addresses, setAddressesState] = useState(() => (user ? null : [])) // null until loaded for signed-in; empty array for guests"
);

// C: continueToPayment: only save address to API if user is signed in
checkoutCode = checkoutCode.replace(
  "if (d.mode !== 'saved' && d.saveAddress) {",
  "if (live.current.user && d.mode !== 'saved' && d.saveAddress) {"
);

// D: remove login blocker on checkout step progression
checkoutCode = checkoutCode.replace(
  /if \(step === 'basket'\) return\r?\n\s*\/\/ Signed out \(or the session expired\): the basket, with the sign-in card\.\r?\n\s*if \(!user\) \{\r?\n\s*actions\.showStep\('basket', \{ replace: true \}\)\r?\n\s*actions\.requireSignIn\(\)\r?\n\s*return\r?\n\s*\}/,
  "if (step === 'basket') return\n    // Guest checkout enabled for verification: no sign-in required"
);

// E: hash listener: don't interrupt active checkout with sign in modal
checkoutCode = checkoutCode.replace(
  "if ((hash === 'login' || hash === 'auth' || redirectMsg) && !live.current.user) {\n      try { sessionStorage.removeItem('sathya_auth_redirect_msg') } catch {}\n      afterPageTransition().then(() => actions.openSignIn(redirectMsg || LINK_LOGIN_MSG))\n    }",
  "if ((hash === 'login' || hash === 'auth' || redirectMsg) && !live.current.user) {\n      try { sessionStorage.removeItem('sathya_auth_redirect_msg') } catch {}\n      if (!live.current.step) afterPageTransition().then(() => actions.openSignIn(redirectMsg || LINK_LOGIN_MSG))\n    }"
);
checkoutCode = checkoutCode.replace(
  "if ((hash === 'login' || hash === 'auth' || redirectMsg) && !live.current.user) {\r\n      try { sessionStorage.removeItem('sathya_auth_redirect_msg') } catch {}\r\n      afterPageTransition().then(() => actions.openSignIn(redirectMsg || LINK_LOGIN_MSG))\r\n    }",
  "if ((hash === 'login' || hash === 'auth' || redirectMsg) && !live.current.user) {\r\n      try { sessionStorage.removeItem('sathya_auth_redirect_msg') } catch {}\r\n      if (!live.current.step) afterPageTransition().then(() => actions.openSignIn(redirectMsg || LINK_LOGIN_MSG))\r\n    }"
);

fs.writeFileSync(checkoutPath, checkoutCode, 'utf8');
console.log('✅ Patched src/hooks/useCheckout.js');

// --- 2. src/storefront/sections/CheckoutSheet.jsx ---
const sheetPath = path.join(rootDir, 'src', 'storefront', 'sections', 'CheckoutSheet.jsx');
let sheetCode = fs.readFileSync(sheetPath, 'utf8');

// A: badges for HSN and GST in cart item
sheetCode = sheetCode.replace(
  "{item.hsnCode && <span className=\"badge badge-blue\" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>HSN: {item.hsnCode}</span>}",
  `{item.hsnCode && <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>HSN: {item.hsnCode}</span>}
              {item.gstRate !== undefined && item.gstRate !== null && <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '1px 6px', background: '#dcfce7', color: '#15803d', borderRadius: '4px' }}>GST: {item.gstRate}%</span>}`
);

// B: formOpen in AddressStep: always open for guests
sheetCode = sheetCode.replace(
  "const formOpen = draft.mode === 'new' || draft.mode === 'edit' || (addresses !== null && !addresses.length)",
  "const formOpen = !checkout.user || draft.mode === 'new' || draft.mode === 'edit' || (addresses !== null && !addresses.length)"
);

// C: saveAddress checkbox: hide for guests
sheetCode = sheetCode.replace(
  `<label className="co-check">
        <input type="checkbox" checked={saveAddress} disabled={busy} onChange={event => actions.setSaveAddress(event.target.checked)} />
        <span>Save this address for future orders</span>
      </label>`,
  `{fields.saveAddressVisible !== false && (
      <label className="co-check">
        <input type="checkbox" checked={saveAddress} disabled={busy} onChange={event => actions.setSaveAddress(event.target.checked)} />
        <span>Save this address for future orders</span>
      </label>
      )}`
);

// Check if CRLF for C
sheetCode = sheetCode.replace(
  `<label className="co-check">\r\n        <input type="checkbox" checked={saveAddress} disabled={busy} onChange={event => actions.setSaveAddress(event.target.checked)} />\r\n        <span>Save this address for future orders</span>\r\n      </label>`,
  `{saveAddress !== false && (
      <label className="co-check">
        <input type="checkbox" checked={saveAddress} disabled={busy} onChange={event => actions.setSaveAddress(event.target.checked)} />
        <span>Save this address for future orders</span>
      </label>
      )}`
);

// D: saved address picker only for signed-in users
sheetCode = sheetCode.replace(
  "const selectedId = draft.mode === 'saved' || draft.mode === 'edit' ? draft.addressId : ''\n  const formOpen =",
  "const isGuest = !checkout.user\n  const selectedId = draft.mode === 'saved' || draft.mode === 'edit' ? draft.addressId : ''\n  const formOpen ="
);
sheetCode = sheetCode.replace(
  "const selectedId = draft.mode === 'saved' || draft.mode === 'edit' ? draft.addressId : ''\r\n  const formOpen =",
  "const isGuest = !checkout.user\r\n  const selectedId = draft.mode === 'saved' || draft.mode === 'edit' ? draft.addressId : ''\r\n  const formOpen ="
);

fs.writeFileSync(sheetPath, sheetCode, 'utf8');
console.log('✅ Patched src/storefront/sections/CheckoutSheet.jsx');

// --- 3. server/server.js ---
const serverPath = path.join(rootDir, 'server', 'server.js');
let serverCode = fs.readFileSync(serverPath, 'utf8');

// A: priceCart lines.push include hsnCode
serverCode = serverCode.replace(
  "lines.push({ id: product.id, name: product.name, image: product.image || '', packSize: pack, selectedPack: pack, qty: r.qty, price, gstRate });",
  "lines.push({ id: product.id, name: product.name, image: product.image || '', packSize: pack, selectedPack: pack, qty: r.qty, price, gstRate, hsnCode: product.hsnCode || '31010099' });"
);

// B: /api/checkout/rewards optional user
serverCode = serverCode.replace(
  "app.post('/api/checkout/rewards', requireAuth(), async (req, res) => {",
  "app.post('/api/checkout/rewards', async (req, res) => {\n    const user = await getAuthenticatedUser(req);\n    if (!user) return res.json({ success: true, data: { welcomeDiscount: 0, pointsDiscount: 0, discount: 0, balance: 0, subtotal: 0, gst: 0 } });"
);

// C: /api/addresses optional user
serverCode = serverCode.replace(
  "app.get('/api/addresses', requireAuth(), async (req, res) => {",
  "app.get('/api/addresses', async (req, res) => {\n  const user = await getAuthenticatedUser(req);\n  if (!user) return res.json({ success: true, data: [] });"
);

fs.writeFileSync(serverPath, serverCode, 'utf8');
console.log('✅ Patched server/server.js');
