import { landingUrl, siteConfig } from './site-config.js';

const escapeVcard = (value) => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

export function createVcard(url = landingUrl()) {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Raddi;Hamza;;;',
    'FN:Hamza Raddi',
    'TEL;TYPE=CELL,VOICE:' + siteConfig.phone,
    'URL;TYPE=HOME:' + escapeVcard(url),
    'X-SOCIALPROFILE;TYPE=instagram:' + escapeVcard(siteConfig.instagram),
    'X-SOCIALPROFILE;TYPE=facebook:' + escapeVcard(siteConfig.facebook),
    'URL;TYPE=instagram:' + escapeVcard(siteConfig.instagram),
    'URL;TYPE=facebook:' + escapeVcard(siteConfig.facebook),
    'END:VCARD',
    '',
  ].join('\r\n');
}

export function downloadVcard() {
  const blob = new Blob([createVcard()], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Hamza-Raddi.vcf';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function copyPhone() {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(siteConfig.phone);
      return true;
    } catch { /* Some mobile browsers require the fallback. */ }
  }
  const field = document.createElement('textarea');
  field.value = siteConfig.phone;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  return copied;
}
