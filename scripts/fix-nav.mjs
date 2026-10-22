import fs from 'node:fs';

const file = 'src/components/home/MobileBottomNav.jsx';
let content = fs.readFileSync(file, 'utf8');

const badBlock = content.match(/\{user \? \([\s\S]*?<\/button>\s*<\/div>/);
if (badBlock) {
  const replacement = `{user ? (
        <div className="mms-account">
          <div className="mms-avatar"><i className="fa-solid fa-user" aria-hidden="true"></i></div>
          <div className="mms-account-text">
            <strong>{user ? \`Hi, \${user.name || 'Farmer'}\` : 'Welcome to Sathyam Agro Mart'}</strong>
            <span>{accountSub}</span>
          </div>
          <button type="button" className="mms-account-btn" data-account-open onClick={handleAccountClick}>
            {user ? 'My Account' : 'Sign In'}
          </button>
        </div>
        ) : null}`;
  content = content.replace(badBlock[0], replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Fixed MobileBottomNav.jsx');
} else {
  console.error('Could not find bad block in MobileBottomNav.jsx');
}
