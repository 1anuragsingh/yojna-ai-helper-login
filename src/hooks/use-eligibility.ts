import { useMemo } from 'react';
import { Scheme } from '@/data/schemes';

export interface UserProfile {
  age: number;
  education: 'below10' | '10th' | '12th' | 'graduate' | 'postgraduate';
  category: 'general' | 'sc' | 'st' | 'obc' | 'ewc';
  occupation: 'farmer' | 'student' | 'worker' | 'business' | 'housewife' | 'senior' | 'other';
  monthlyIncome: number;
  location: 'rural' | 'urban';
  isWoman: boolean;
  isPWD: boolean; // Person with Disability
  isBPL: boolean; // Below Poverty Line
}

const calculateEligibility = (scheme: Scheme, profile: UserProfile): number => {
  let score = 0;
  const maxScore = 100;

  // Age-based eligibility
  const schemeId = scheme.id;
  
  if (schemeId.includes('senior') || schemeId === 'old-age-pension') {
    if (profile.age >= 60) score += 30;
    else if (profile.age >= 55) score += 15;
  } else if (schemeId.includes('student') || schemeId === 'pmkvy' || schemeId === 'pm-internship' || schemeId === 'pm-poshan') {
    if (profile.age <= 40) score += 30;
    else if (profile.age <= 50) score += 15;
  } else if (schemeId.includes('child') || schemeId === 'beti-bachao') {
    score += 30; // Always eligible if has children
  } else if (schemeId !== 'pm-jan-dhan') {
    if (profile.age >= 18 && profile.age <= 65) score += 20;
  }

  // Category-based eligibility
  if (
    schemeId === 'stand-up-india' ||
    schemeId === 'pm-vishwakarma' ||
    schemeId.includes('sc') ||
    schemeId.includes('st')
  ) {
    if (profile.category === 'sc' || profile.category === 'st') score += 25;
    else if (profile.category === 'obc') score += 15;
  }

  // Women-specific schemes
  if (schemeId.includes('women') || schemeId === 'ujjwala-yojana' || schemeId === 'beti-bachao' || schemeId === 'sukanya-samriddhi' || schemeId === 'mahila-shakti-kendra' || schemeId === 'stand-up-india' || schemeId === 'mission-shakti') {
    if (profile.isWoman) score += 35;
    else score -= 50; // Not eligible
  }

  // Occupation-based eligibility
  if (schemeId.includes('farmer') || schemeId === 'pm-fasal-bima' || schemeId === 'kisan-credit-card') {
    if (profile.occupation === 'farmer') score += 25;
  } else if (schemeId.includes('student') || schemeId === 'pmkvy' || schemeId === 'pm-poshan' || schemeId === 'national-scholarship') {
    if (profile.occupation === 'student' || profile.age <= 25) score += 25;
  } else if (schemeId.includes('worker') || schemeId === 'mgnrega' || schemeId === 'eshram') {
    if (profile.occupation === 'worker' || profile.occupation === 'farmer') score += 25;
  } else if (schemeId.includes('business') || schemeId === 'pm-mudra' || schemeId === 'pmegp' || schemeId === 'stand-up-india' || schemeId === 'pm-vishwakarma') {
    if (profile.occupation === 'business') score += 25;
  }

  // Income-based eligibility
  const monthlyRequired = profile.monthlyIncome;
  const annualIncome = monthlyRequired * 12;

  if (schemeId === 'pm-awas-urban') {
    if (annualIncome <= 300000) score += 20; // EWS
    else if (annualIncome <= 600000) score += 15; // LIG
    else if (annualIncome <= 1200000) score += 10; // MIG-I
  } else if (schemeId === 'ayushman-bharat' || schemeId.includes('pension') || schemeId === 'ujjwala-yojana') {
    if (profile.isBPL) score += 25;
  } else if (schemeId === 'pm-mudra' || schemeId === 'stand-up-india' || schemeId === 'pm-vishwakarma') {
    // Business schemes - any income eligible
    score += 15;
  } else if (schemeId === 'national-scholarship') {
    if (annualIncome <= 250000) score += 20;
  } else if (schemeId.includes('jan-dhan') || schemeId === 'pm-suraksha-bima' || schemeId === 'pm-jeevan-jyoti') {
    // Universal schemes
    score += 25;
  }

  // PWD (Persons with Disability) eligibility
  if (schemeId === 'atal-pension-yojana' && profile.isPWD) {
    score += 15;
  }

  // Location-based eligibility
  if (schemeId === 'pm-awas-rural' || schemeId === 'mgnrega' || schemeId === 'atal-pension-yojana') {
    if (profile.location === 'rural') score += 15;
  } else if (schemeId === 'pm-awas-urban') {
    if (profile.location === 'urban') score += 15;
  }

  // BPL eligibility
  if (schemeId === 'ujjwala-yojana' || schemeId === 'old-age-pension' || schemeId === 'ayushman-bharat') {
    if (profile.isBPL) score += 20;
  }

  // Education-based eligibility
  if (schemeId.includes('scholarship') || schemeId === 'national-scholarship' || schemeId === 'pmkvy' || schemeId === 'pm-poshan') {
    if (profile.education === 'graduate' || profile.education === 'postgraduate') score += 15;
    else if (profile.education === '12th' || profile.education === '10th') score += 10;
  }

  // Universal schemes - everyone eligible
  if (schemeId === 'pm-jan-dhan' || schemeId === 'digilocker' || schemeId === 'national-nutrition-mission') {
    score = Math.max(score, 75);
  }

  // Normalize score to 0-100
  const finalScore = Math.min(Math.max(score, 0), 100);
  return finalScore;
};

export const useEligibility = (schemes: Scheme[], profile: UserProfile) => {
  const results = useMemo(() => {
    const calculated = schemes.map((scheme) => ({
      scheme,
      eligibilityScore: calculateEligibility(scheme, profile),
    }));

    // Sort by eligibility score (descending)
    return calculated.sort((a, b) => b.eligibilityScore - a.eligibilityScore);
  }, [schemes, profile]);

  return results;
};

export const getEligibilityLabel = (score: number): { label: string; color: string } => {
  if (score >= 80) return { label: 'Highly Eligible', color: 'text-green-600' };
  if (score >= 60) return { label: 'Eligible', color: 'text-emerald-600' };
  if (score >= 40) return { label: 'Partially Eligible', color: 'text-amber-600' };
  if (score >= 20) return { label: 'Low Eligibility', color: 'text-orange-600' };
  return { label: 'Not Eligible', color: 'text-red-600' };
};
