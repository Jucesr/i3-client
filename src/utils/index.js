import React from 'react'


export const replaceAll = (text, obj) => {
  for (var x in obj) {
      text = text.replace(new RegExp(x, 'g'), obj[x]);
  }
  return text;
};

Number.prototype.format = function(n, x, s, c) {
  var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
      num = this.toFixed(Math.max(0, ~~n));

  return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

export const formatColumn = (format) =>{
  switch (format) {
    case 'currency':
      return row => {
          return !isNaN(row.value) ? (
            `$${parseFloat(row.value).format(2,3,',','.')}`
          ) : row.value
        }
    break;

    case 'number':
      return row => {
          return !isNaN(row.value) ? (
            `${parseFloat(row.value).format(2,3,',','.')}`
          ) : row.value
        }
    break;

    case 'text': {
      return row => <div style={{
        wordWrap: 'break-word',
        whiteSpace: 'normal'
      }}>{row.value}</div>
    }
    break;
    default:

  }
}
