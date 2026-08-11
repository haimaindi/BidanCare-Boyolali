const fs = require('fs');
let code = fs.readFileSync('src/logic/hooks/useKasir.ts', 'utf-8');
code = code.replace(/realtimeService\.subscribe/g, 'realtimeService.subscribeTable');
fs.writeFileSync('src/logic/hooks/useKasir.ts', code);
