
import { telanganaDistricts, telanganaMandals } from './telanganaLocationData';

export const countries = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }
];

export const states = {
  IN: [
    { code: 'TG', name: 'Telangana' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CT', name: 'Chhattisgarh' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JK', name: 'Jammu and Kashmir' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'MN', name: 'Manipur' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OR', name: 'Odisha' },
    { code: 'PB', name: 'Punjab' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UT', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' }
  ]
};

// Districts by state code - Telangana uses comprehensive data from telanganaLocationData
export const districts: Record<string, { code: string; name: string; nameTe?: string }[]> = {
  TG: telanganaDistricts,
  AP: [
    { code: 'PMY', name: 'Parvathipuram Manyam' },
    { code: 'VSP', name: 'Visakhapatnam' },
    { code: 'VZM', name: 'Vizianagaram' },
    { code: 'AKP', name: 'Anakapalli' },
    { code: 'KAK', name: 'Kakinada' },
    { code: 'KSM', name: 'Konaseema' },
    { code: 'ASR', name: 'Alluri Sitaramaraju' },
    { code: 'EGD', name: 'East Godavari' },
    { code: 'ELR', name: 'Eluru' },
    { code: 'NTR', name: 'NTR District' },
    { code: 'GTR', name: 'Guntur' },
    { code: 'WGD', name: 'West Godavari' },
    { code: 'BPT', name: 'Bapatla' },
    { code: 'PLD', name: 'Palnadu' },
    { code: 'SPS', name: 'Sri Potti Sriramulu Nellore' },
    { code: 'PKM', name: 'Prakasam' },
    { code: 'TRP', name: 'Tirupati' },
    { code: 'AMY', name: 'Annamayya' },
    { code: 'YSR', name: 'YSR Kadapa' },
    { code: 'CTR', name: 'Chittoor' },
    { code: 'ATP', name: 'Anantpur' },
    { code: 'KNL', name: 'Kurnool' },
    { code: 'SSS', name: 'Sri Satyasai' },
    { code: 'NDL', name: 'Nandyal' },
    { code: 'SBD', name: 'Sri. Balaji Dist' }
  ]
};

// Divisions (used as intermediate level for AP, optional for TG)
export const divisions: Record<string, { code: string; name: string }[]> = {
  HYD: [
    { code: 'SEC', name: 'Secunderabad' },
    { code: 'LBN', name: 'LB Nagar' },
    { code: 'KPH', name: 'Kukatpally' },
    { code: 'CHM', name: 'Charminar' },
    { code: 'HTC', name: 'Hi-Tech City' }
  ],
  // AP divisions
  PVM: [
    { code: 'PVM1', name: 'Parvathipuram Manyam Division 1' },
    { code: 'PVM2', name: 'Parvathipuram Manyam Division 2' }
  ],
  VSP: [
    { code: 'VSP1', name: 'Visakhapatnam Division 1' },
    { code: 'VSP2', name: 'Visakhapatnam Division 2' }
  ],
  VZM: [
    { code: 'VZM1', name: 'Vizianagaram Division 1' },
    { code: 'VZM2', name: 'Vizianagaram Division 2' }
  ],
  ANK: [
    { code: 'ANK1', name: 'Anakapalli Division 1' },
    { code: 'ANK2', name: 'Anakapalli Division 2' }
  ],
  KAK: [
    { code: 'KAK1', name: 'Kakinada Division 1' },
    { code: 'KAK2', name: 'Kakinada Division 2' }
  ],
  KSM: [
    { code: 'KSM1', name: 'Konaseema Division 1' },
    { code: 'KSM2', name: 'Konaseema Division 2' }
  ],
  ASR: [
    { code: 'ASR1', name: 'Alluri Sitaramaraju Division 1' },
    { code: 'ASR2', name: 'Alluri Sitaramaraju Division 2' }
  ],
  EGD: [
    { code: 'EGD1', name: 'East Godavari Division 1' },
    { code: 'EGD2', name: 'East Godavari Division 2' }
  ],
  ELR: [
    { code: 'ELR1', name: 'Eluru Division 1' },
    { code: 'ELR2', name: 'Eluru Division 2' }
  ],
  NTR: [
    { code: 'NTR1', name: 'NTR District Division 1' },
    { code: 'NTR2', name: 'NTR District Division 2' }
  ],
  GTR: [
    { code: 'GTR1', name: 'Guntur Division 1' },
    { code: 'GTR2', name: 'Guntur Division 2' }
  ],
  WGD: [
    { code: 'WGD1', name: 'West Godavari Division 1' },
    { code: 'WGD2', name: 'West Godavari Division 2' }
  ],
  BPT: [
    { code: 'BPT1', name: 'Bapatla Division 1' },
    { code: 'BPT2', name: 'Bapatla Division 2' }
  ],
  PLN: [
    { code: 'PLN1', name: 'Palnadu Division 1' },
    { code: 'PLN2', name: 'Palnadu Division 2' }
  ],
  NLR: [
    { code: 'NLR1', name: 'Sri Potti Sriramulu Nellore Division 1' },
    { code: 'NLR2', name: 'Sri Potti Sriramulu Nellore Division 2' }
  ],
  PKM: [
    { code: 'PKM1', name: 'Prakasam Division 1' },
    { code: 'PKM2', name: 'Prakasam Division 2' }
  ],
  TPT: [
    { code: 'TPT1', name: 'Tirupati Division 1' },
    { code: 'TPT2', name: 'Tirupati Division 2' }
  ],
  AMY: [
    { code: 'AMY1', name: 'Annamayya Division 1' },
    { code: 'AMY2', name: 'Annamayya Division 2' }
  ],
  YKD: [
    { code: 'YKD1', name: 'YSR Kadapa Division 1' },
    { code: 'YKD2', name: 'YSR Kadapa Division 2' }
  ],
  CTR: [
    { code: 'CTR1', name: 'Chittoor Division 1' },
    { code: 'CTR2', name: 'Chittoor Division 2' }
  ],
  ATP: [
    { code: 'ATP1', name: 'Anantapur Division 1' },
    { code: 'ATP2', name: 'Anantapur Division 2' }
  ],
  KNL: [
    { code: 'KNL1', name: 'Kurnool Division 1' },
    { code: 'KNL2', name: 'Kurnool Division 2' }
  ],
  STS: [
    { code: 'STS1', name: 'Sri Satyasai Division 1' },
    { code: 'STS2', name: 'Sri Satyasai Division 2' }
  ],
  NDL: [
    { code: 'NDL1', name: 'Nandyal Division 1' },
    { code: 'NDL2', name: 'Nandyal Division 2' }
  ],
  SBD: [
    { code: 'SBD1', name: 'Sri Balaji Dist Division 1' },
    { code: 'SBD2', name: 'Sri Balaji Dist Division 2' }
  ],
};

// Mandals - keyed by district code (for Telangana) or division code (for AP/others)
export const mandals: Record<string, { code: string; name: string; nameTe?: string }[]> = {
  // Telangana mandals by district code
  ...telanganaMandals,
  // Legacy mandals by division code (for AP etc.)
  SEC: [
    { code: 'ALW', name: 'Alwal' },
    { code: 'TRM', name: 'Trimulgherry' },
    { code: 'BLN', name: 'Bolaram' },
    { code: 'QPT', name: 'Quthbullapur' }
  ],
  LBN: [
    { code: 'LBN1', name: 'LB Nagar' },
    { code: 'SRN', name: 'Saroornagar' },
    { code: 'HAY', name: 'Hayathnagar' }
  ],
  MVP: [
    { code: 'MVR', name: 'Madhurawada Rural' },
    { code: 'YLM', name: 'Yellamanchali' },
    { code: 'BHP', name: 'Bheemunipatnam' }
  ],
  BZA: [
    { code: 'VJA1', name: 'Vijayawada Central' },
    { code: 'VJA2', name: 'Vijayawada East' },
    { code: 'VJA3', name: 'Vijayawada West' }
  ]
};

export const villages: Record<string, { code: string; name: string }[]> = {
  ALW: [
    { code: 'ALW1', name: 'Alwal Village 1' },
    { code: 'ALW2', name: 'Alwal Village 2' },
    { code: 'ALW3', name: 'Alwal Village 3' }
  ],
  TRM: [
    { code: 'TRM1', name: 'Trimulgherry Village 1' },
    { code: 'TRM2', name: 'Trimulgherry Village 2' }
  ],
  MVR: [
    { code: 'MVR1', name: 'Madhurawada Village 1' },
    { code: 'MVR2', name: 'Madhurawada Village 2' },
    { code: 'MVR3', name: 'Madhurawada Village 3' }
  ],
  VJA1: [
    { code: 'VJA1V1', name: 'Vijayawada Central Village 1' },
    { code: 'VJA1V2', name: 'Vijayawada Central Village 2' }
  ]
};

/**
 * Helper: Get mandals for a district code.
 * Checks direct district→mandal mapping first, then falls back to division→mandal.
 */
export const getMandalsForDistrict = (districtCode: string): { code: string; name: string; nameTe?: string }[] => {
  // Direct mandals by district code
  if (mandals[districtCode]) {
    return mandals[districtCode];
  }
  // Fallback: collect mandals from all divisions under this district
  const divisionList = divisions[districtCode];
  if (divisionList) {
    const allMandals: { code: string; name: string; nameTe?: string }[] = [];
    divisionList.forEach(div => {
      const m = mandals[div.code];
      if (m) allMandals.push(...m);
    });
    return allMandals;
  }
  return [];
};

/**
 * Check if a district has divisions (intermediate level)
 */
export const hasDivisions = (districtCode: string): boolean => {
  return !!(divisions[districtCode] && divisions[districtCode].length > 0);
};
