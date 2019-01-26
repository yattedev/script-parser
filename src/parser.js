
function isWhitespace(ch) {
  return ch === ' ' || ch === '\t' || ch === '\n';
}

function skipWhitespaces(str, initial) {
  let idx = initial;
  for (; idx < str.length && isWhitespace(str[idx]); ++idx);
  return idx;
}

function skipComment(line, initial) {
  if (line[initial] === ';') {
    return line.length-1;
  } else {
    return initial;
  }
}

function parseHead(line) {
  let idx = skipWhitespaces(line, 0);
  switch (line[idx]) {
    case '@':
      return [parseAt(line, idx+1)];
    case '*':
      return [parseAsterisk(line, idx+1)];
    default:
      return parseInner(line, idx);
  }
}

function isEOL(line, idx) {
  return idx >= line.length;
}

function isValidChar(ch) {
  return ch !== '*' && ch !== ';' && ch !== '=' && ch !== '<' && ch !== '>' && ch !== '[' &&
    ch !== ']' && ch !== ',' && ch !== '+' && ch !== '-' && ch !== '/' && ch !== '"' && ch !== "'" && ch !== '`';
}

function parseAt(line, initial) {
  let [name, idx] = parseWord(line, initial);
  idx = skipWhitespaces(line, idx);
  let args;
  [args, idx] = parseArguments(line, idx, null);
  return {type: 'command', name, args};
}

function parseAsterisk(line, initial) {
  let [name, idx] = parseWord(line, initial);
  idx = skipWhitespaces(line, idx);
  idx = skipComment(line, idx);
  if (isEOL(line, idx)) {
    return {type: 'label', name};
  } else {
    throw new Error(`Invalid label format:\n${line}\n${' '.repeat(idx)}^`);
  }
}

function parseWord(line, initial) {
  let idx = initial;
  for (; idx < line.length && !isWhitespace(line[idx]) && isValidChar(line[idx]); ++idx);
  return [line.substring(initial, idx), idx];
}

function parseInner(line, initial) {
  let idx = skipWhitespaces(line, initial);
  let expr;
  let string = "";
  let buffer = [];
  for (; idx < line.length; ++idx) {
    switch (line[idx]) {
      case ';':
        if (string.length > 0) buffer.push(toText(string))
        idx = line.length;
        break;
      case '[':
        if (string.length > 0) {
          buffer.push(toText(string))
          string = "";
        }
        [expr, idx] = parseTag(line, idx+1);
        buffer.push(expr);
        break;
      case '<':
        if (string.length > 0) {
          buffer.push(toText(string))
          string = "";
        }
        [expr, idx] = parseRange(line, idx+1);
        buffer.push(expr);
        break;
      default:
        string += line[idx];
        break;
    }
  }
  if (string.length > 0) buffer.push(toText(string));
  return buffer;
}

function toText(string) {
  return {"type": "text", "content": string};
}

function parseTag(line, initial) {
  let [name, idx] = parseWord(line, initial);
  idx = skipWhitespaces(line, idx);
  let args;
  [args, idx] = parseArguments(line, idx, ']');
  return [{type: 'command', name, args}, idx];
}

function parseRange(line, initial) {
  let name, idx;
  if (line[initial] === '/') {
    [name, idx] = parseWord(line, initial+1);
    name = name + "_end";
  } else {
    [name, idx] = parseWord(line, initial);
    name = name + "_start";
  }
  idx = skipWhitespaces(line, idx);
  let args;
  [args, idx] = parseArguments(line, idx, '>');
  return [{type: 'command', name, args}, idx];
}

function parseArguments(line, initial, end) {
  let name, value, idx = initial;
  let buffer = {};
  for (; idx < line.length; ++idx) {
    skipWhitespaces(line, idx);
    if (line[idx] === end) break;
    [name, idx] = parseWord(line, idx);
    if (line[idx] === '=') {
      [value, idx] = parseValue(line, idx+1);
      buffer[name] = value;
    } else if (line[idx] === end) {
      break;
    } else if (name.length > 0 && isWhitespace(line[idx])) {
      buffer[name] = true;
    }
  }
  return [buffer, idx];
}

function parseValue(line, initial) {
  let expr, idx = initial;
  if (line[idx] === '"') {
    idx += 1;
    let prefix = ''
    let inner = ""
    for (; idx < line.length; ++idx) {
      if (prefix !== '\\' && line[idx] === '"') {
        break;
      }
      if (line[idx] === '\\') {
        if (prefix === '\\') {
          prefix = ''
          inner += line[idx]
        }
      } else {
        inner += line[idx]
      }
      prefix = line[idx];
    }
    if (line[idx] === '"') {
      //return [line.substring(initial+1, idx), idx];
      return [inner, idx];
    } else throw new Error("Invalid string format");
  } else {
    [expr, idx] = parseWord(line, idx);
    let e = parseFloat(expr);
    if (isNaN(e)) {
      return [expr, idx];
    } else {
      return [e, idx];
    }
  }
}

function flatten(list) {
  return list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
  );
}

function parse(str) {
  let lines = str.split('\n');
  return flatten(lines
    .map(parseHead)
    .map((line, lineNumber) => {
      return line.map(result => {
        return {result: result, row: lineNumber}
      })
    }));
}

module.exports = {
  parse,
  parseHead,
  parseWord,
  skipWhitespaces,
  flatten
};
