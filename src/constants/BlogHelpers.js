import { BaseUrl } from '../store/apis/api';

// Blog covers come back as paths relative to the site root (e.g.
// "../assets/blog/cover123.jpg") while the API base points at ".../apiserver/",
// so we need to resolve them up one level to the real static assets folder.
export const resolveBlogAsset = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const root = BaseUrl.replace(/apiserver\/?$/, '');
  const cleaned = path.replace(/^(\.{2}\/)+/, '').replace(/^\/+/, '');
  return `${root}${cleaned}`;
};

const decodeHtmlEntities = (str = '') =>
  str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&rsquo;/gi, '\u2019')
    .replace(/&lsquo;/gi, '\u2018')
    .replace(/&ldquo;/gi, '\u201c')
    .replace(/&rdquo;/gi, '\u201d')
    .replace(/&mdash;/gi, '\u2014')
    .replace(/&ndash;/gi, '\u2013')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'");

// Turns simple blog HTML (p, br, headings, lists) into plain text
// paragraphs, since the app has no HTML rendering dependency.
export const htmlToParagraphs = (html) => {
  if (!html) return [];

  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '\u2022 ')
    .replace(/<\s*\/(p|div|li|h[1-6])\s*>/gi, '\n\n');

  const stripped = withBreaks.replace(/<[^>]+>/g, '');
  const decoded = decodeHtmlEntities(stripped);

  return decoded
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, '\n').trim())
    .filter(Boolean);
};
