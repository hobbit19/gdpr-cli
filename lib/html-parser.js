'use strict';

const cheerio = require('cheerio');

class HTMLParser {

  constructor(html) {
    this.html = html;
    this.$ = cheerio.load(this.html);
  }

  getInlineCSS() {
    let inlineCSS = [];
    this.$('style').each((id, el) => {
      if (typeof el.attribs.src === 'undefined') {
        el.children.forEach(child => {
          inlineCSS.push(child.data);
        });
      }
    });
    return inlineCSS;
  }

  getInlineJS() {
    let inlineJS = [];
    this.$('script').each((id, el) => {
      if (typeof el.attribs.src === 'undefined') {
        el.children.forEach(child => {
          inlineJS.push(child.data);
        });
      }
    });
    return inlineJS;
  }

  getStylesheetURLs(url) {
    let stylesheets = [];
    this.$('link').each((id, el) => {
      if (el.attribs.rel === 'stylesheet' && typeof el.attribs.href !== 'undefined') {
        let style = {};
        style.url = el.attribs.href;
        if (style.url.match(/https?:\/\//) === null) {
          if (!style.url.startsWith('//')) {
            if (style.url.startsWith('/')) style.url = style.url.substr(1);
            style.url = url + style.url;
          } else {
            style.url = 'http:' + style.url;
          }
        }
        stylesheets.push(style);
      }
    });
    return stylesheets;
  }

  getJavascriptURLs(url) {
    let javascripts = [];
    this.$('script').each((id, el) => {
      if (typeof el.attribs.src !== 'undefined') {
        let js = {};
        js.url = el.attribs.src;
        if (js.url.match(/https?:\/\//) === null) {
          if (!js.url.startsWith('//')) {
            if (js.url.startsWith('/')) js.url = js.url.substr(1);
            js.url = url + js.url;
          } else {
            js.url = 'http:' + js.url;
          }
        }
        javascripts.push(js);
      }
    });
    return javascripts;
  }

  getTitle() {
    let title = this.$('title').text();
    if (typeof title !== 'string' || title === '') {
      this.$('meta').each((id, el) => {
        if (el.attribs.property === 'og:title') title = el.attribs.content;
      });
    }
    return title;
  }

  getDescription() {
    let desc = '';
    this.$('meta').each((id, el) => {
      if (el.attribs.name === 'description') desc = el.attribs.content;
      if (desc === '' && el.attribs.property === 'og:description') desc = el.attribs.content;
    });
    return desc;
  }

  getGenerator(css) {
    let gen = '';
    let i = 0;
    this.$('meta').each((id, el) => {
      if (el.attribs.name === 'generator') {
        gen = (i === 0) ? el.attribs.content : gen + ', ' + el.attribs.content;
        i++;
      }
    });
    // Check for WordPress without generator meta tag
    if (gen === '') {
      for (const c of css) {
        if (c.url.indexOf('wp-content') !== -1 || c.url.indexOf('wp-includes') !== -1) {
          gen = 'WordPress';
          break;
        }
      }
    }
    return gen;
  }

  getMetaData() {
    let metatags = {};
    this.$('meta').each((id, el) => {
      const key = Object.keys(el.attribs).find((attr) => ['name', 'property', 'itemprop', 'http-equiv'].indexOf(attr) !== -1);
      const name = el.attribs[key];
      const value = el.attribs['content'];
      if (!metatags[name]) {
        metatags[name] = [];
      }
      metatags[name].push(value);
    });
    return metatags;
  }

  checkPrefetching() {
    let prefetching = [];
    this.$('link').each((id, el) => {
      if (el.attribs.rel === 'dns-prefetch') prefetching.push(el.attribs.href);
    });
    return prefetching;
  }

}

module.exports = HTMLParser;