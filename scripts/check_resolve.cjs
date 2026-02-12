const fs = require('fs');
const path = require('path');

const fromDir = path.join(process.cwd(), 'src/components/modals');
const target = path.join(fromDir, '../ui/PasswordStrengthIndicator.tsx');

console.log('Checking path:', target);
if (fs.existsSync(target)) {
    console.log('✅ File exists!');
} else {
    console.log('❌ File NOT found!');
}

const targetIndex = path.join(fromDir, '../ui/index.ts');
console.log('Checking index:', targetIndex);
if (fs.existsSync(targetIndex)) {
    console.log('✅ Index exists!');
} else {
    console.log('❌ Index NOT found!');
}
