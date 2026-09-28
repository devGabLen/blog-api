import { describe, it, expect } from "vitest";

import { sanitizeContent } from "../../../src/shared/utils/sanitize";

describe("sanitizeContent", () => {
  it("should allow basic HTML tags", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    const result = sanitizeContent(input);
    expect(result).toBe("<p>Hello <strong>world</strong></p>");
  });

  it("should remove script tags", () => {
    const input = "<p>Hello</p><script>alert('xss')</script>";
    const result = sanitizeContent(input);
    expect(result).toBe("<p>Hello</p>");
  });

  it("should remove event handlers", () => {
    const input = '<p onclick="alert(\'xss\')">Hello</p>';
    const result = sanitizeContent(input);
    expect(result).toBe("<p>Hello</p>");
  });

  it("should remove javascript: URLs", () => {
    const input = '<a href="javascript:alert(\'xss\')">Click</a>';
    const result = sanitizeContent(input);
    expect(result).toBe("<a>Click</a>");
  });

  it("should allow safe links", () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeContent(input);
    expect(result).toBe('<a href="https://example.com">Link</a>');
  });

  it("should allow images with safe sources", () => {
    const input = '<img src="https://example.com/image.png" alt="Image">';
    const result = sanitizeContent(input);
    expect(result).toBe('<img src="https://example.com/image.png" alt="Image" />');
  });

  it("should remove iframe tags", () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeContent(input);
    expect(result).toBe("");
  });

  it("should remove style tags", () => {
    const input = "<style>body { display: none; }</style>";
    const result = sanitizeContent(input);
    expect(result).toBe("");
  });

  it("should allow lists", () => {
    const input = "<ul><li>Item 1</li><li>Item 2</li></ul>";
    const result = sanitizeContent(input);
    expect(result).toBe("<ul><li>Item 1</li><li>Item 2</li></ul>");
  });

  it("should allow code blocks", () => {
    const input = "<pre><code>const x = 1;</code></pre>";
    const result = sanitizeContent(input);
    expect(result).toBe("<pre><code>const x = 1;</code></pre>");
  });

  it("should handle empty string", () => {
    const result = sanitizeContent("");
    expect(result).toBe("");
  });

  it("should handle plain text", () => {
    const result = sanitizeContent("Hello world");
    expect(result).toBe("Hello world");
  });
});
