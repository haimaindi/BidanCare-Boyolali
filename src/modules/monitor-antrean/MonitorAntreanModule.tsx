import { MonitorTable } from "./components/MonitorTable";
import { tokens } from "../../ui/styles/tokens";
import { cn } from "../../logic/utils/cn";

export function MonitorAntreanModule() {
  return (
    <div className="space-y-[2rem]">
      <div className="flex flex-col gap-[1rem] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={cn(tokens.typography.h1, tokens.colors.text.base, "mb-[0.25rem]")}>
            Monitor Antrean
          </h2>
          <p className={tokens.colors.text.muted}>
            Tampilan status antrean saat ini untuk ruang tunggu.
          </p>
        </div>
      </div>

      <div>
        <MonitorTable />
      </div>
    </div>
  );
}
