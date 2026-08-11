const fs = require('fs');
let code = fs.readFileSync('src/modules/pemeriksaan/components/LabReferralView.tsx', 'utf-8');

// import Check
code = code.replace(/import { Printer, ArrowLeft, FileText, CheckSquare, Square, Hash } from "lucide-react";/, 'import { Printer, ArrowLeft, FileText, CheckSquare, Square, Hash, Check } from "lucide-react";');

// update checkbox rendering
const oldCheckbox = `<div className="w-[1rem] h-[1rem] border border-black flex items-center justify-center flex-shrink-0">
                          {selectedTests.includes(test) && <div className="w-[0.6rem] h-[0.6rem] bg-black rotate-45" />}
                        </div>`;
const newCheckbox = `<div className={cn("w-[1.25rem] h-[1.25rem] border-[1.5px] border-black flex items-center justify-center flex-shrink-0 transition-all", selectedTests.includes(test) ? "bg-black text-white" : "bg-white")}>
                          {selectedTests.includes(test) && <Check className="w-[1rem] h-[1rem]" strokeWidth={4} />}
                        </div>`;

code = code.replace(oldCheckbox, newCheckbox);

fs.writeFileSync('src/modules/pemeriksaan/components/LabReferralView.tsx', code);
