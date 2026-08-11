const fs = require('fs');

// followUpService
let fu = fs.readFileSync('src/logic/services/followUpService.ts', 'utf-8');
fu = fu.replace(/status: "Belum Dihubungi"/g, 'status: "Pending"');
fs.writeFileSync('src/logic/services/followUpService.ts', fu);

// kasirService
let ks = fs.readFileSync('src/logic/services/kasirService.ts', 'utf-8');
ks = ks.replace(/\(await fetchMasterHargaDasarList\(\)\)\.data/g, "(await fetchMasterHargaDasarList()).items");
ks = ks.replace(/\(await fetchMasterLayananLainList\(\)\)\.data/g, "(await fetchMasterLayananLainList()).items");
ks = ks.replace(/pendaftaran\.poli/g, "pendaftaran.jenisLayanan");
fs.writeFileSync('src/logic/services/kasirService.ts', ks);

