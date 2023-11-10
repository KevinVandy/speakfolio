type JsonValue = any;

export function transformDotNotation(obj: { [key: string]: JsonValue }): {
  [key: string]: JsonValue;
} {
  const result: { [key: string]: JsonValue } = {};

  Object.keys(obj).forEach((key) => {
    if (key.includes(".")) {
      const [firstPart, ...rest] = key.split(".");
      if (!result[firstPart] || typeof result[firstPart] !== "object") {
        result[firstPart] = {};
      }
      let current = result[firstPart];
      rest.forEach((part, index) => {
        if (index === rest.length - 1) {
          current[part] = obj[key];
        } else {
          if (!current[part] || typeof current[part] !== "object") {
            current[part] = {};
          }
          current = current[part] as { [key: string]: JsonValue };
        }
      });
    } else {
      result[key] = obj[key];
    }
  });

  return result;
}
