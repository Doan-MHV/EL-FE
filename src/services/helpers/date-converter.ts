function formatDateToMMDDYYYY(dateInput: Date): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default formatDateToMMDDYYYY;
