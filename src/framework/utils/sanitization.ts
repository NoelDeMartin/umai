import DOMPurify from 'dompurify';

export function safeHtml(html: string): string {
    // TODO improve target="_blank" exception
    // See https://github.com/cure53/DOMPurify/issues/317
    return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}
