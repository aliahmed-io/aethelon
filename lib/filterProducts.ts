import type { Product } from "./assistantTypes";

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function filterProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return products.slice(0, 20);
  }

  const querySizes: string[] = [];
  const sizeRegex = /\b(?:size\s*)?([0-9.]+|XS|S|M|L|XL|XXL)\b/gi;
  let matches;
  while ((matches = sizeRegex.exec(normalizedQuery)) !== null) {
    if (matches[1]) querySizes.push(matches[1].toUpperCase());
  }

  const tokens = tokenize(normalizedQuery);

  const scored = products.map((product) => {
    let score = 0;

    const name = product.name.toLowerCase();
    const description = product.description.toLowerCase();
    const text = `${name} ${description}`;
    const color = product.color?.toLowerCase() ?? "";
    const gender = product.gender?.toLowerCase() ?? "";
    const category = product.category?.toLowerCase() ?? "";
    const tags = (product.tags ?? []).map((t) => t.toLowerCase());
    const style = product.style?.toLowerCase() ?? "";
    const height = product.height?.toLowerCase() ?? "";
    const pattern = product.pattern?.toLowerCase() ?? "";
    const features = (product.features ?? []).map((f) => f.toLowerCase());

    const hasWord = (text: string, word: string) => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      return regex.test(text);
    };

    for (const token of tokens) {
      if (tags.some(t => t === token || hasWord(t, token))) {
        score += 6;
      }
      if (features.some(f => f === token || hasWord(f, token))) {
        score += 5;
      }
    }

    for (const token of tokens) {
      if (color && (color === token || hasWord(color, token))) {
        score += 10;
      }
      if (gender && (gender === token || hasWord(gender, token))) {
        score += 4;
      }
      if (category && (category === token || hasWord(category, token))) {
        score += 3;
      }
      if (style && (style === token || hasWord(style, token))) {
        score += 4;
      }
      if (height && (height === token || hasWord(height, token))) {
        score += 4;
      }
      if (pattern && (pattern === token || hasWord(pattern, token))) {
        score += 3;
      }
    }

    if (querySizes.length > 0 && product.sizes) {
      const productSizes = product.sizes.map(s => s.toUpperCase());
      for (const qs of querySizes) {
        if (productSizes.includes(qs)) {
          score += 15;
        }
      }
    }

    for (const token of tokens) {
      if (hasWord(text, token)) {
        score += 3;
      } else if (text.includes(token)) {
        score += 1;
      }
    }

    if (text.includes(normalizedQuery)) {
      score += 5;
    }

    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored.length && scored[0].score === 0) {
    return products.slice(0, 20);
  }

  return scored
    .filter((item) => item.score > 0)
    .slice(0, 20)
    .map((item) => item.product);
}
