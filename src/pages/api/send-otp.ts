// src/pages/api/send-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import crypto from 'crypto';

type StoreValue = { otpHash: string; expiresAt: number; attempts: number };

// ⚠️ In-memory store (DEV only). Use Redis / DB in production.
const OTP_STORE = new Map<string, StoreValue>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SENDS_PER_WINDOW = 5; // basic rate-limiting per phone (dev)

// helper - generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// hash OTP before storing
function hashOtp(otp: string, salt = '') {
  return crypto.createHash('sha256').update(otp + salt).digest('hex');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { mobile } = req.body as { mobile?: string };
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: 'Invalid mobile - use 10 digit number' });
    }

    // Rate-limit basic check (dev)
    const existing = OTP_STORE.get(mobile);
    const now = Date.now();
    if (existing && existing.attempts >= MAX_SENDS_PER_WINDOW && existing.expiresAt > now) {
      return res.status(429).json({ error: 'Too many OTP requests. Try later.' });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = Date.now() + OTP_TTL_MS;

    // Save/overwrite store
    OTP_STORE.set(mobile, { otpHash, expiresAt, attempts: existing ? existing.attempts + 1 : 1 });

    // --- SEND SMS using Fast2SMS (example) ---
    const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';
    if (!FAST2SMS_API_KEY) {
      // For dev if no key set, return OTP in response (not for production)
      return res.status(200).json({ success: true, debugOtp: otp, message: 'No SMS KEY: OTP returned for dev' });
    }

    // fast2sms bulkV2 POST
    const message = `Your Agrizin OTP is ${otp}. It is valid for 5 minutes.`;
    await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'v3',
        sender_id: 'TXTIND',
        message,
        language: 'english',
        numbers: mobile,
      },
      {
        headers: {
          authorization: FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    // success
    return res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (err: any) {
    console.error('send-otp error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}
