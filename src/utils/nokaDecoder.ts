import { DecodedNoka } from '../types/noka';

// NOKA / VIN decoding map for Indonesian and Asian/Global manufacturers
const MANUFACTURER_MAP: Record<string, { name: string; country: string }> = {
  MHF: { name: 'Toyota Astra Motor', country: 'Indonesia' },
  MHR: { name: 'Honda Prospect Motor', country: 'Indonesia' },
  MKA: { name: 'Mitsubishi Motors Indonesia', country: 'Indonesia' },
  MK3: { name: 'Suzuki Indomobil Motor', country: 'Indonesia' },
  MH1: { name: 'Astra Daihatsu Motor', country: 'Indonesia' },
  MH3: { name: 'Yamaha Indonesia Motor', country: 'Indonesia' },
  KMH: { name: 'Hyundai Motor Company', country: 'South Korea' },
  MF3: { name: 'Wuling Motors Indonesia', country: 'Indonesia' },
  JTD: { name: 'Toyota Motor Corp', country: 'Japan' },
  JH4: { name: 'Honda Motor Co', country: 'Japan' },
  WAU: { name: 'Audi AG', country: 'Germany' },
  WBA: { name: 'BMW AG', country: 'Germany' },
  '1FA': { name: 'Ford Motor Company', country: 'USA' },
};

const YEAR_CODES: Record<string, number> = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015,
  G: 2016, H: 2017, J: 2018, K: 2019, L: 2020, M: 2021,
  N: 2022, P: 2023, R: 2024, S: 2025, T: 2026, V: 2027
};

export function decodeNoka(noka: string): DecodedNoka {
  const cleanNoka = noka.trim().toUpperCase();
  const isValidLength = cleanNoka.length >= 12;

  const wmi = cleanNoka.substring(0, 3);
  const mfgInfo = MANUFACTURER_MAP[wmi] || { name: 'Indonesian Automotive Industry', country: 'Indonesia' };

  const vds = cleanNoka.length >= 9 ? cleanNoka.substring(3, 9) : '000000';
  const vis = cleanNoka.length >= 17 ? cleanNoka.substring(9, 17) : cleanNoka.substring(9);

  const modelYearCode = cleanNoka.length >= 10 ? cleanNoka.charAt(9) : 'R';
  const calculatedYear = YEAR_CODES[modelYearCode] || 2023;

  const plantCode = cleanNoka.length >= 11 ? cleanNoka.charAt(10) : 'K';
  const serialNumber = cleanNoka.length >= 17 ? cleanNoka.substring(11, 17) : cleanNoka.substring(Math.max(0, cleanNoka.length - 6));

  return {
    wmi,
    country: mfgInfo.country,
    manufacturer: mfgInfo.name,
    vds,
    vis,
    modelYearCode,
    calculatedYear,
    plantCode,
    serialNumber,
    isValidLength,
  };
}

export function generateChecksum(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()}`;
}
