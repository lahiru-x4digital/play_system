'use client';
import { debounce } from 'lodash';
import { useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';

export function ScanInput({
  onScan,
}) {
  const debouncedOnScan = useCallback(
    debounce((value) => {
      onScan(value);
    }, 500),
    [onScan]
  );

  useEffect(() => {
    return () => {
      debouncedOnScan.cancel();
    };
  }, [debouncedOnScan]);

  const handleChange = (e) => {
    const value = e.target.value;
    debouncedOnScan(value);
  };

  return (
    <Input
      type="text"
      onChange={handleChange}
      placeholder="Scan or type..."
      className="w-96"
    />
  );
}