type JsonValue = any;

function isNumeric(str: string): boolean {
  return !isNaN(str as any) && !isNaN(parseFloat(str));
}

function setNestedValue(base: any, path: string[], value: JsonValue) {
  let current = base;
  for (let i = 0; i < path.length; i++) {
    const part = path[i];
    const isLast = i === path.length - 1;

    if (isLast) {
      if (isNumeric(part) && Array.isArray(current)) {
        current[parseInt(part)] = value;
      } else {
        current[part] = value;
      }
    } else {
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = isNumeric(path[i + 1]) ? [] : {};
      }
      current = current[part];
    }
  }
}

export function transformDotNotation(obj: { [key: string]: JsonValue }): {
  [key: string]: JsonValue;
} {
  const result: { [key: string]: JsonValue } = {};

  Object.keys(obj).forEach((key) => {
    const path = key.split(".");
    setNestedValue(result, path, obj[key]);
  });

  return result;
}
