import React from 'react'

export const convertToArrayObject = (array) => {
  return array.reduce((current, item) => {
    current[item.id] = item
    return current
  }, {})
}

export const addChildrenToItems = (object) => {

  Object.keys(object).forEach(key => {
    if(object[key].parent_id != null){
      const parent_id = object[key].parent_id
      //  The material belongs to a category material. It needs to add it as it's child
      if(!object[parent_id].hasOwnProperty('_children')){
        object[parent_id]._children = []
      }
      object[parent_id]._children.push(key) 
    }
  })

  return object
}

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

const isObject = (item)  => {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export const mergeDeep = (target, source) => {
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return target;
}

const makeNestedObjWithArrayItemsAsKeys = (arr) => {
  const reducer = (acc, item) => ({ [item]: acc });
  return arr.reduceRight(reducer, {});
};
