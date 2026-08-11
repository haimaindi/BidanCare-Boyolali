const fs = require('fs');
let code = fs.readFileSync('src/logic/hooks/useKasir.ts', 'utf-8');
code = code.replace(/realtimeService\.subscribeTable\('tagihan_pasien', \(payload\) => \{/g, "realtimeService.subscribeTable({ table: 'tagihan_pasien' }, (payload) => {");
code = code.replace(/realtimeService\.subscribeTable\('piutang_pasien', \(payload\) => \{/g, "realtimeService.subscribeTable({ table: 'piutang_pasien' }, (payload) => {");
code = code.replace(/payload\.new/g, "payload.newRecord");
fs.writeFileSync('src/logic/hooks/useKasir.ts', code);
