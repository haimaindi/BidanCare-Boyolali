const fs = require('fs');
let code = fs.readFileSync('src/ui/components/layout/Header.tsx', 'utf-8');

code = code.replace(
  /<div className="flex flex-col">/,
  '<div className="flex flex-col flex-1 items-center justify-center">'
);

fs.writeFileSync('src/ui/components/layout/Header.tsx', code);
