export async function loadOptional<T>(
  specifier: string,
  installHint: string,
): Promise<T> {
  try {
    return (await import(specifier)) as T;
  } catch {
    throw new Error(
      `This feature needs \`${installHint}\`. Install it in your project and try again.`,
    );
  }
}
