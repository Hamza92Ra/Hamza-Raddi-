// Set publicSiteUrl when a permanent domain is chosen. An empty value uses
// the current page URL, so the vCard and NFC preview work on any deployment.
export const siteConfig = {
  publicSiteUrl: '',
  phone: '+212673046307',
  instagram: 'https://www.instagram.com/hamzaraddi/',
  facebook: 'https://www.facebook.com/hamza.ra.3192/directory_intro',
  linkedin: 'https://www.linkedin.com/in/hamza-raddi-bb9232317/',
  github: 'https://github.com/Hamza92Ra',
};

export function landingUrl() {
  const configured = siteConfig.publicSiteUrl.trim();
  return configured || new URL(window.location.pathname, window.location.origin).href;
}
