import { queryAll, hasAttribute, setAttribute, getAttribute } from 'dom5';
import { parse, serialize } from 'parse5';
import { relative, isAbsolute, normalize } from 'path';

// TODO: include & exclude
/**
 * @param {object} options {cwd}
 */
const plugin = options => {
  if (!options) {
    options = {
      cwd: process.cwd()
    }
  }
  const query = node => {
    if (node.tagName === 'script' && hasAttribute(node, 'src') ||
        node.tagName === 'link' && hasAttribute(node, 'href') ||
        node.tagName === 'template' && node.content.childNodes) {
      return node;
    }
  }

  const removePrefix = (url, type) => {
    return url.replace(`.html_.${type}`, `.${type}`);
  }

  return {
    html: ({ path, contents }) => {
      // Parse
      const doc = parse(contents.toString());
      // Query all scripts, links & templates
      const queried = queryAll(doc, query);
      // Setup imports set for each html
      const imports = [];
      // iterate trough queried scripts, links & templates
      for (const node of queried) {
        // Check if node is template
        if (node.tagName === 'template') {
          // iterate trough the childNodes & search for scripts & links.
          for (const child of node.content.childNodes) {
            if (child.tagName === 'script' && hasAttribute(child, 'src') ||
                child.tagName === 'link' && hasAttribute(child, 'href')) {
                // Add script or link to imports
              imports.push(child);
            }
          }
        } else {
          // Add script or link to imports
          imports.push(node);
        }
      }
      // iterate trough imports & cleanup urls (remove '.html_' prefix).
      for (const node of imports) {
        let dest = '';
        if (hasAttribute(node, 'src')) {
          dest = removePrefix(getAttribute(node, 'src'), 'js');
          // create a relative path when dest is absolute
          if (isAbsolute(normalize(dest))) {
            dest = relative(options.cwd, dest)
          }
          setAttribute(node, 'src', dest);
        } else if (hasAttribute(node, 'href')) {
          dest = removePrefix(getAttribute(node, 'href'), 'css');
          // create a relative path when dest is absolute
          if (isAbsolute(normalize(dest))) {
            dest = relative(options.cwd, dest);
          }
          setAttribute(node, 'href', dest)
        }
      }
      // serialize
      contents = serialize(doc);
      return Promise.resolve({path, contents}); // or return file;
    },

    css: ({ path, contents }) => {
      if (path.includes('.html_.css')) {
        path = removePrefix(path, 'css');
      }
      return Promise.resolve({path, contents}); // or return file;
    },

    js: ({ path, contents }) => {
      if (path.includes('.html_.js')) {
        path = removePrefix(path, 'js');
      }
      return Promise.resolve({path, contents}); // or return file;
    }

  };
}
module.exports = plugin;
