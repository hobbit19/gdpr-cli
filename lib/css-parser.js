'use strict';

const css = require('css');

class CSSParser {

  constructor(css) {
    this.css = css;
    //console.log(css);
  }

  hasAutoptimize() {

  }


  getFonts() {

    let fonts = {};

    if (Array.isArray(this.css)) {
      this.css.forEach(el => { // go through every file
        let cssObj = css.parse(el.content); // get file content parsed
        cssObj.stylesheet.rules.forEach(rule => {
          if (rule.type === 'font-face') { // for every font-face do
            let entry = {};

            rule.declarations.forEach(dec => { // go through every declaration of a font-face
              if (dec.property === 'font-family') entry.font = dec.value.replace(/[\'"]/gi, ''); // unescaped font-family
              if (dec.property === 'font-weight') entry.weight = dec.value;
              if (dec.property === 'font-style') entry.style = dec.value;
              if (dec.property === 'src') {

                if (dec.value.indexOf('base64,') !== -1) dec.value = dec.value.replace('base64,', 'base64'); // Base64 fix
                const urldata = dec.value.split(',');
                const grades = ['local', 'inline', 'internal', 'external', 'wordpress', 'google'];
                entry.source = '';

                urldata.forEach(f => { // go through every entry
                  if (f.indexOf('local(') === -1) {
                    let src = '';
                    if (f.indexOf('data:application') === -1) {
                      src = (f.match(/(https?:)?\/\//) !== null) ? 'external' : 'internal';
                      if (f.indexOf('fonts.gstatic.com') !== -1) src = 'google';
                      if (f.indexOf('wordpress.com') !== -1) src = 'wordpress';
                    } else src = 'inline';

                    if (entry.source !== '') {
                      if (grades.indexOf(entry.source) < grades.indexOf(src)) entry.source = src;
                    } else entry.source = src;
                  }
                });
              }
            });
            if (typeof fonts[entry.source] === 'undefined') fonts[entry.source] = [];
            let similar = false;
            fonts[entry.source].forEach(en => {
              if (JSON.stringify(en) === JSON.stringify(entry)) similar = true;
            });
            if (!similar) fonts[entry.source].push(entry);
          }
        });
      });
    }
    return fonts;
  }

  getFontStyles(section, font) {

    let style = '';
    let weights = [];
    let output = '';

    section.forEach(f => {
      if (f.font === font) {
        if (typeof f.style !== 'undefined') {
          if (f.style !== style) {
            if (style !== '') output += style + ' (' + weights.join(', ') + ') ';
            style = f.style;
            weights = [];
          }
          weights.push(f.weight);
        }
      }
    });
    if (weights.length > 0) output += style + ' (' + weights.join(', ') + ') ';

    return output;
  }

  countFonts(section) {

    let fonts = [];
    section.forEach(f => {
      if (fonts.indexOf(f.font) === -1) fonts.push(f.font);
    });
    return fonts;
  }

}

module.exports = CSSParser;