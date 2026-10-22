import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

// --- 2. src/storefront/sections/CheckoutSheet.jsx ---
const sheetPath = path.join(rootDir, 'src', 'storefront', 'sections', 'CheckoutSheet.jsx');
let sheetCode = fs.readFileSync(sheetPath, 'utf8');

// Ensure HSN and GST badges are shown in cart item
if (!sheetCode.includes('GST: {item.gstRate}%')) {
  sheetCode = sheetCode.replace(
    "{item.hsnCode && <span className=\"badge badge-blue\" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>HSN: {item.hsnCode}</span>}",
    `{item.hsnCode && <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>HSN: {item.hsnCode}</span>}
              {item.gstRate !== undefined && item.gstRate !== null && <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '1px 6px', background: '#dcfce7', color: '#15803d', borderRadius: '4px' }}>GST: {item.gstRate}%</span>}`
  );
}

// Ensure saved address cards are only rendered if NOT a guest
const leadOld = `<p className="co-lead">Choose a saved address or add a new one.</p>`;
const leadNew = `<p className="co-lead">{isGuest ? 'Enter your delivery address below:' : 'Choose a saved address or add a new one.'}</p>`;
if (sheetCode.includes(leadOld)) {
  sheetCode = sheetCode.replace(leadOld, leadNew);
}

const cardsOld = `{addresses === null ? (`;
const cardsNew = `{!isGuest && (addresses === null ? (`;
if (sheetCode.includes(cardsOld) && !sheetCode.includes(cardsNew)) {
  sheetCode = sheetCode.replace(cardsOld, cardsNew);
  // close the {!isGuest && ( ... )}
  const endOld = `            </label>\n          </div>\n        )}`;
  const endNew = `            </label>\n          </div>\n        ))}`;
  const endOldCRLF = `            </label>\r\n          </div>\r\n        )}`;
  const endNewCRLF = `            </label>\r\n          </div>\r\n        ))}`;
  if (sheetCode.includes(endOldCRLF)) {
    sheetCode = sheetCode.replace(endOldCRLF, endNewCRLF);
  } else if (sheetCode.includes(endOld)) {
    sheetCode = sheetCode.replace(endOld, endNew);
  }
}

fs.writeFileSync(sheetPath, sheetCode, 'utf8');
console.log('✅ Updated CheckoutSheet.jsx guest address cards');
