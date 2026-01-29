export function ChartContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function ChartTooltip({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function ChartTooltipContent({ active, payload }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 rounded-lg border border-border shadow-lg">
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-foreground">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
