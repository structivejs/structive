# Template Module Overview

Template utilities load, normalise, and register HTML fragments before binding
occurs.

- `registerHtml.ts`: Registers raw HTML strings as template entries.
- `registerTemplate.ts`: Accepts parsed template nodes and wires them into the
  registry.
- `removeEmptyTextNodes.ts`: Cleans template trees by removing insignificant
  whitespace nodes.
- `replaceMustacheWithTemplateTag.ts`: Converts mustache placeholders into
  structured template tags for binding discovery.
- `replaceTemplateTagWithComment.ts`: Reverts template tags to comments for
  runtime compatibility.
