import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ImageOff, Loader2 } from 'lucide-react';

export type ValidationIssue = { field: string; message: string; severity: 'error' | 'warning' };

export const validateProduct = (p: any): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const req = (k: string, label: string) => {
    const v = p?.[k];
    if (v === null || v === undefined || (typeof v === 'string' && !v.trim())) {
      issues.push({ field: label, message: 'Missing', severity: 'error' });
    }
  };
  req('product_name', 'Product name');
  req('category', 'Category');
  req('unit_type', 'Unit type');

  if (!p.product_images || p.product_images.length === 0) {
    issues.push({ field: 'Images', message: 'No images uploaded', severity: 'error' });
  }
  if (!(Number(p.mrp_price) > 0)) issues.push({ field: 'MRP', message: 'Must be > 0', severity: 'error' });
  if (!(Number(p.selling_price) > 0)) issues.push({ field: 'Selling price', message: 'Must be > 0', severity: 'error' });
  if (Number(p.selling_price) > Number(p.mrp_price)) {
    issues.push({ field: 'Selling price', message: 'Higher than MRP', severity: 'warning' });
  }
  if (Number(p.stock_quantity) <= 0) issues.push({ field: 'Stock', message: 'Stock is 0', severity: 'warning' });
  if (!p.description || p.description.trim().length < 20) {
    issues.push({ field: 'Description', message: 'Too short (<20 chars)', severity: 'warning' });
  }
  if (!p.brand) issues.push({ field: 'Brand', message: 'Not specified', severity: 'warning' });
  return issues;
};

export const validateCrop = (c: any): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const req = (k: string, label: string) => {
    const v = c?.[k];
    if (v === null || v === undefined || (typeof v === 'string' && !v.trim())) {
      issues.push({ field: label, message: 'Missing', severity: 'error' });
    }
  };
  req('crop_name', 'Crop name');
  req('quantity', 'Quantity');
  req('price', 'Price');
  req('quality_grade', 'Quality grade');

  if (!c.crop_images || c.crop_images.length === 0) {
    issues.push({ field: 'Images', message: 'No images uploaded', severity: 'error' });
  }
  if (!c.location_address) issues.push({ field: 'Location', message: 'Address missing', severity: 'warning' });
  if (!c.harvest_date) issues.push({ field: 'Harvest date', message: 'Not specified', severity: 'warning' });
  if (c.latitude == null || c.longitude == null) {
    issues.push({ field: 'GPS', message: 'No coordinates', severity: 'warning' });
  }
  return issues;
};

const checkImage = (url: string) => new Promise<boolean>((resolve) => {
  if (!url) return resolve(false);
  const img = new Image();
  let done = false;
  const finish = (ok: boolean) => { if (!done) { done = true; resolve(ok); } };
  img.onload = () => finish(img.naturalWidth > 0);
  img.onerror = () => finish(false);
  img.src = url;
  setTimeout(() => finish(false), 6000);
});

interface Props {
  images: string[] | null | undefined;
  issues: ValidationIssue[];
}

const ValidationSummary: React.FC<Props> = ({ images, issues }) => {
  const [imgChecking, setImgChecking] = useState(true);
  const [brokenCount, setBrokenCount] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const list = (images || []).filter(Boolean);
    setTotalImages(list.length);
    if (list.length === 0) { setImgChecking(false); setBrokenCount(0); return; }
    setImgChecking(true);
    Promise.all(list.map(checkImage)).then((results) => {
      if (cancelled) return;
      setBrokenCount(results.filter(r => !r).length);
      setImgChecking(false);
    });
    return () => { cancelled = true; };
  }, [JSON.stringify(images || [])]);

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const allClean = errors.length === 0 && warnings.length === 0 && !imgChecking && brokenCount === 0;

  if (allClean) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800 flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" /> All fields valid · {totalImages} image{totalImages === 1 ? '' : 's'} loaded
      </div>
    );
  }

  return (
    <div className={`rounded p-2 text-xs space-y-1.5 border ${errors.length || brokenCount ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
      <div className="flex items-center gap-1.5 font-semibold">
        <AlertTriangle className="h-3.5 w-3.5" />
        Validation summary
        {imgChecking && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
      </div>
      <ul className="space-y-0.5 ml-1">
        {errors.map((i, idx) => (
          <li key={`e${idx}`}>• <strong>{i.field}:</strong> {i.message}</li>
        ))}
        {warnings.map((i, idx) => (
          <li key={`w${idx}`} className="text-amber-700">• <strong>{i.field}:</strong> {i.message} <span className="opacity-70">(warning)</span></li>
        ))}
        {!imgChecking && brokenCount > 0 && (
          <li className="text-red-800 flex items-center gap-1"><ImageOff className="h-3 w-3" /> <strong>{brokenCount}/{totalImages} image(s) failed to load</strong></li>
        )}
      </ul>
    </div>
  );
};

export default ValidationSummary;
