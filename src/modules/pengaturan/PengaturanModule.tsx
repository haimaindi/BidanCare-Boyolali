import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/components/common/Card';
import { Button } from '../../ui/components/elements/Button';
import { Globe, Monitor } from 'lucide-react';
import { useNavigation } from '../../logic/context/NavigationContext';

export function PengaturanModule() {
  const { setActiveModule } = useNavigation();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Pengaturan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-500" />
              Monitor Antrean
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Akses layar monitor antrean untuk pasien.</p>
            <Button onClick={() => setActiveModule('monitor')} variant="outline" className="w-full">
              Buka Monitor Antrean
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              Pendaftaran Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Akses halaman pendaftaran mandiri secara online.</p>
            <Button onClick={() => setActiveModule('online')} variant="outline" className="w-full">
              Buka Pendaftaran Online
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
