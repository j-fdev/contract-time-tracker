const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

export function formatCurrency(amount: number): string {
    return currencyFormatter.format(amount);
}

/** Cost of `seconds` of work at `hourlyRate` per hour. */
export function calculateCost(seconds: number, hourlyRate: number): number {
    return (seconds / 3600) * hourlyRate;
}
