export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function celsius(value: number) {
  return `${value.toFixed(1)} C`;
}

export function shortTime(value?: string) {
  if (!value) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
