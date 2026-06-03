function joinList(nums: string[]): string {
  if (nums.length === 1) return nums[0];
  return nums.slice(0, -1).join(", ") + " o " + nums[nums.length - 1];
}

function parseNums(raw: string): string[] {
  return raw.split(",").map((n) => n.trim()).filter(Boolean);
}

const RULES: [RegExp, (match: string) => string][] = [
  [/^>=\s*([\d,\s]+)$/,  (m) => `Dado mayor o igual a ${joinList(parseNums(m))}`],
  [/^<=\s*([\d,\s]+)$/,  (m) => `Dado menor o igual a ${joinList(parseNums(m))}`],
  [/^!=\s*([\d,\s]+)$/,  (m) => `Dado distinto a ${joinList(parseNums(m))}`],
  [/^>\s*([\d,\s]+)$/,   (m) => `Dado mayor a ${joinList(parseNums(m))}`],
  [/^<\s*([\d,\s]+)$/,   (m) => `Dado menor a ${joinList(parseNums(m))}`],
  [/^=\s*([\d,\s]+)$/,   (m) => `Dado igual a ${joinList(parseNums(m))}`],
];

export function parseCondition(raw: string | null | undefined): string {
  if (!raw) return "";
    const s = raw.trim().replaceAll('"', '');
  for (const [re, fmt] of RULES) {
    const m = s.match(re);
    if (m) return fmt(m[1]);
  }
  return s;
}
