export const decimalTransformer = {
  from: (value: string | null) => Number(value ?? 0),
  to: (value: number) => value,
};
