import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { PageMeta } from "@/shared/lib/pagination";

export function Pagination({
  meta,
  onChange,
}: {
  meta: PageMeta;
  onChange: (page: number) => void;
}) {
  if (meta.lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-muted-foreground text-xs">
        Página {meta.page} de {meta.lastPage} ({meta.total} registros)
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
          className="h-8 gap-1 text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.lastPage}
          onClick={() => onChange(meta.page + 1)}
          className="h-8 gap-1 text-xs"
        >
          Próxima
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
