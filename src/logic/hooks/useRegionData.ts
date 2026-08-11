import { useState, useEffect } from 'react';

export interface Region {
  id: string;
  name: string;
}

export function useRegionData() {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [loading, setLoading] = useState({
    provinces: false,
    regencies: false,
    districts: false,
    villages: false,
  });

  // Fetch provinces on mount
  useEffect(() => {
    setLoading(prev => ({ ...prev, provinces: true }));
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Error fetching provinces:", err))
      .finally(() => setLoading(prev => ({ ...prev, provinces: false })));
  }, []);

  const fetchRegencies = (provinceId: string) => {
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    if (!provinceId) return;

    setLoading(prev => ({ ...prev, regencies: true }));
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`)
      .then(res => res.json())
      .then(data => setRegencies(data))
      .catch(err => console.error("Error fetching regencies:", err))
      .finally(() => setLoading(prev => ({ ...prev, regencies: false })));
  };

  const fetchDistricts = (regencyId: string) => {
    setDistricts([]);
    setVillages([]);
    if (!regencyId) return;

    setLoading(prev => ({ ...prev, districts: true }));
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`)
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error("Error fetching districts:", err))
      .finally(() => setLoading(prev => ({ ...prev, districts: false })));
  };

  const fetchVillages = (districtId: string) => {
    setVillages([]);
    if (!districtId) return;

    setLoading(prev => ({ ...prev, villages: true }));
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`)
      .then(res => res.json())
      .then(data => setVillages(data))
      .catch(err => console.error("Error fetching villages:", err))
      .finally(() => setLoading(prev => ({ ...prev, villages: false })));
  };

  return {
    provinces,
    regencies,
    districts,
    villages,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
    loading
  };
}
