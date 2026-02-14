export function jsx(tag: string | Function, props: any, ...children: any[]) {
  if (typeof tag === "function") {
    return tag({ ...props, children });
  }

  const attributes = props
    ? Object.entries(props)
        .map(([key, val]) => ` ${key}="${val}"`)
        .join("")
    : "";

  const content = children.flat().join("");

  return `<${tag}${attributes}>${content}</${tag}>`;
}

export function Fragment({ children }: { children: any[] }) {
  return children.flat().join("");
}
