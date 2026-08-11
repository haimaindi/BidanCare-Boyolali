const fs = require('fs');
let code = fs.readFileSync('src/logic/services/kasirService.ts', 'utf-8');
code = code.replace(/const \{ fetchHargaDasar \} = await import\('\.\/masterHargaDasarService\.js'\);/g, "const { fetchMasterHargaDasarList } = await import('./masterHargaDasarService.js');");
code = code.replace(/const masterHargaDasar = await fetchHargaDasar\(\);/g, "const masterHargaDasar = (await fetchMasterHargaDasarList()).data;");
fs.writeFileSync('src/logic/services/kasirService.ts', code);
