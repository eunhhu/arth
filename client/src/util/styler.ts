const getGlobalVar = (name: string) => 
    getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

const isCssVar = /^var\(--[\w-]+\)$/;
const unitRegex = /^(\d+)([a-zA-Z-]+)$/;
const arithmeticRegex = /([\d.]+[a-z%]*|[\w-]+)\s*([\+\-\*\/])\s*([\d.]+[a-z%]*|[\w-]+)/;

export const cvt = (value: string | number): string => {
    if (typeof value === 'number') return `${value}px`;
    if (isCssVar.test(value)) return value;

    const toVar = (v: string) => getGlobalVar(v) ? `var(--${v})` : v;

    if (getGlobalVar(value)) return toVar(value);

    if (unitRegex.test(value)) {
        return value.replace(unitRegex, (_, num, unit) =>
            getGlobalVar(unit) ? `calc(${num} * var(--${unit}))` : `${num}${unit}`
        );
    }

    if (arithmeticRegex.test(value)) {
        return `calc(${value.replace(arithmeticRegex, (_, l, op, r) => 
            `${toVar(l)} ${op} ${toVar(r)}`
        )})`;
    }

    const split = value.split(' ');
    if (split.length > 1) {
        return split.map(cvt).join(' ');
    }

    return getGlobalVar(value) ? toVar(value) : value;
};
