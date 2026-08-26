/**
 * Helper to build link paths with producer scope preserved.
 * Dashboard, Farms, and Harvests preserve `idProducer`.
 * Producers and Audit ignore scope.
 */
export function getScopedPath(targetPath: string, currentSearch: string): string {
  const params = new URLSearchParams(currentSearch);
  const idProducer = params.get("idProducer");

  if (!idProducer) return targetPath;

  const scopedRoutes = ["/dashboard", "/farms", "/harvests"];
  const isScoped = scopedRoutes.some((route) => targetPath.startsWith(route));

  if (isScoped) {
    return `${targetPath}?idProducer=${encodeURIComponent(idProducer)}`;
  }

  return targetPath;
}
