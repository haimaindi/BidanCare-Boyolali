const fs = require('fs');
let code = fs.readFileSync('src/ui/components/layout/Sidebar.tsx', 'utf-8');

code = code.replace(
  /text-\[0.625rem\] font-bold text-gray-200 uppercase tracking-tighter/g,
  'text-[0.625rem] font-bold text-black uppercase tracking-tighter'
);

fs.writeFileSync('src/ui/components/layout/Sidebar.tsx', code);
