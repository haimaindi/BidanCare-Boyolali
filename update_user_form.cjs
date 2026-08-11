const fs = require('fs');
let code = fs.readFileSync('src/modules/master-user/components/UserForm.tsx', 'utf-8');

code = code.replace(
  /import { User, UserPermission } from '\.\.\/types\.js';/,
  "import { User, UserPermission } from '../types.js';\nimport { Eye, EyeOff } from 'lucide-react';"
);

// Add state for show password
code = code.replace(
  /export function UserForm\(\{ initialData, onSubmit, onCancel \}: UserFormProps\) \{/,
  'export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {\n  const [showPassword, setShowPassword] = useState(false);'
);

// Modify password input to include toggle
const oldPassword = `<Input
            value={formData.accessPassword || ""}
            onChange={(e) => handleChange("accessPassword", e.target.value)}
            placeholder="Akses Password"
            type="password"
          />`;

const newPassword = `<div className="relative">
            <Input
              value={formData.accessPassword || ""}
              onChange={(e) => handleChange("accessPassword", e.target.value)}
              placeholder="Akses Password"
              type={showPassword ? "text" : "password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>`;

code = code.replace(oldPassword, newPassword);

fs.writeFileSync('src/modules/master-user/components/UserForm.tsx', code);
