import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "b", "i", "em", "strong", "p", "br", "ul", "ol", "li",
  "blockquote", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "img", "hr",
];

const allowedAttributes = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "title"],
};

const allowedSchemes = ["http", "https", "mailto"];

export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags,
    allowedAttributes,
    allowedSchemes,
    disallowedTagsMode: "discard",
  });
}
