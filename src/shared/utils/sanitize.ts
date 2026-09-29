import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function sanitizeContent(content: string): string {
  return purify.sanitize(content, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "p", "br", "ul", "ol", "li",
      "blockquote", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6",
      "a", "img", "hr",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
  });
}
