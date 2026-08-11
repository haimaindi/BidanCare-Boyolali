const fs = require('fs');

let code = fs.readFileSync('src/modules/pemeriksaan/components/LabReferralView.tsx', 'utf-8');
code = 'import { cn } from "../../../logic/utils/cn";\n' + code;
fs.writeFileSync('src/modules/pemeriksaan/components/LabReferralView.tsx', code);

let kasir = fs.readFileSync('src/logic/services/kasirService.ts', 'utf-8');
// Fix Property 'harga' does not exist on type 'HargaDasar'
// Let's see how HargaDasar is typed.
// Let's just suppress or map it properly.
kasir = kasir.replace(/hargaPoli\.harga/g, 'hargaPoli.hargaDasar');
fs.writeFileSync('src/logic/services/kasirService.ts', kasir);

