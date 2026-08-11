import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/components/common/Card';
import { Button } from '../../ui/components/elements/Button';
import { Input } from '../../ui/components/elements/Input';
import { FormGroup } from '../../ui/components/common/FormGroup';
import { useAuth } from '../../logic/context/AuthContext';
import { fetchMasterUserList } from '../../logic/services/masterUserService';
import { tokens } from '../../ui/styles/tokens';
import { cn } from '../../logic/utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export function LoginModule() {
  const [accessId, setAccessId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Special login for SPADMIN
      if (accessId === 'SPADMIN' && password === '1234BIDAN') {
        const spadmin: any = {
          id: 'spadmin-id',
          nama: 'SUPER ADMIN',
          jenisUser: 'DEVELOPER',
          accessId: 'SPADMIN',
          permissions: [
            "Master Data",
            "Cashier",
            "Report",
            "Pendaftaran",
            "Pemeriksaan",
            "Farmasi",
            "Dokumen"
          ],
          noWhatsapp: '-',
          createdAt: new Date().toISOString()
        };
        login(spadmin);
        return;
      }

      const users = await fetchMasterUserList({ limit: 1000, offset: 0, page: 1, strategy: 'full' });
      const user = users.items.find(u => 
        u.accessId === accessId && 
        (u.accessPassword === password || (!u.accessPassword && password === ""))
      );
      
      if (user) {
        login(user);
      } else {
        setError('Access ID atau Password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-purple-600">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">
            Bidan<span className={tokens.colors.primary.text}>Care</span>
          </CardTitle>
          <p className="uppercase tracking-widest text-xs font-bold text-gray-400 mt-2">
            TPMB Analia Boyolali
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mt-6">
            <FormGroup id="accessId" label="Access ID">
              <Input
                value={accessId}
                onChange={(e) => setAccessId(e.target.value)}
                placeholder="Masukkan Access ID"
                required
              />
            </FormGroup>
            
            <FormGroup id="password" label="Password">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormGroup>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
