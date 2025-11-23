// src/pages/api/verify-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

type StoreValue = { otpHash: string; expiresAt: number; attempts: number };
const OTP_STORE = (global as any).__OTP_STORE as Map<string, StoreValue> | undefined;

// We attempted to keep the same in-memory map between modules: fallback to new Map
const OTP_MAP = OTP_STORE || new Map<string, StoreValue>();

function hashOtp(otp: string, salt = '') {
  return crypto.createHash('sha256').update(otp + salt).digest('hex');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { mobile, otp } = req.body as { mobile?: string; otp?: string };

    if (!mobile || !/^\d{10}$/.test(mobile) || !otp) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const record = OTP_MAP.get(mobile);
    if (!record) return res.status(400).json({ error: 'No OTP requested for this number' });

    const now = Date.now();
    if (record.expiresAt < now) {
      OTP_MAP.delete(mobile);
      return res.status(400).json({ error: 'OTP expired' });
    }

    // compare hashes
    const otpHash = hashOtp(String(otp));
    if (otpHash === record.otpHash) {
      // success: clean up
      OTP_MAP.delete(mobile);

      // TODO: create/return session or JWT, or mark user as logged in
      return res.status(200).json({ success: true, message: 'OTP verified' });
    } else {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('verify-otp error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
