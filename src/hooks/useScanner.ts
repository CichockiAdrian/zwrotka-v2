// src/hooks/useScanner.ts
import { useState, useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import type { CodeFormat } from '@/types/voucher';

export type ScanResult = { code: string; format: CodeFormat };
export type ScannerState = 'idle' | 'requesting' | 'ready' | 'success' | 'denied';

function mapFormat(expoType: string): CodeFormat {
  const map: Record<string, CodeFormat> = {
    qr: 'qr', ean13: 'ean13', ean8: 'ean8',
    code128: 'code128', code39: 'code39',
  };
  return map[expoType.toLowerCase()] ?? 'unknown';
}

export function useScanner() {
  const [permission, requestCameraPermission] = useCameraPermissions();
  const [state, setState] = useState<ScannerState>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);

  const requestPermission = useCallback(async () => {
    setState('requesting');
    const { granted } = await requestCameraPermission();
    setState(granted ? 'ready' : 'denied');
  }, [requestCameraPermission]);

  const handleScan = useCallback((r: BarcodeScanningResult) => {
    if (state === 'success') return;
    setState('success');
    setResult({ code: r.data, format: mapFormat(r.type) });
  }, [state]);

  const reset = useCallback(() => {
    setState(permission?.granted ? 'ready' : 'idle');
    setResult(null);
  }, [permission?.granted]);

  return {
    state, result,
    hasPermission: permission?.granted ?? null,
    requestPermission, handleScan, reset,
  };
}
