const fs = require('fs');
let code = fs.readFileSync('src/modules/pemeriksaan/components/LabReferralView.tsx', 'utf-8');

if (!code.includes("import { cn }")) {
  code = code.replace(/import React/, 'import { cn } from "../../../logic/utils/cn";\nimport React');
  fs.writeFileSync('src/modules/pemeriksaan/components/LabReferralView.tsx', code);
}
