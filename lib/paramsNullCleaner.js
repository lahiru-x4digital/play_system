export function paramsNullCleaner(obj){
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== null && value !== undefined && value !== ""
    )
  );
}
