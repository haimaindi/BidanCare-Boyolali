const fs = require('fs');
let code = fs.readFileSync('src/logic/services/kasirService.ts', 'utf-8');
code = code.replace(/const \{ fetchLayananLain \} = await import\('\.\/masterLayananLainService\.js'\);/g, "const { fetchMasterLayananLainList } = await import('./masterLayananLainService.js');");
code = code.replace(/const masterLayananLain = await fetchLayananLain\(\);/g, "const masterLayananLain = (await fetchMasterLayananLainList()).data;");
fs.writeFileSync('src/logic/services/kasirService.ts', code);
