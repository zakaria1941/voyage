export type DepartureWindow = 'any' | 'morning' | 'afternoon' | 'evening' | 'night';

export interface FlightFiltersState {
  direct: boolean;
  oneStop: boolean;
  airlines: string[];
  maxPrice: number | null;
  departureWindow: DepartureWindow;
}

export const DEFAULT_FLIGHT_FILTERS: FlightFiltersState = {
  direct: false,
  oneStop: false,
  airlines: [],
  maxPrice: null,
  departureWindow: 'any',
};

export function isWithinDepartureWindow(hour: number, window: DepartureWindow): boolean {
  switch (window) {
    case 'morning':
      return hour >= 5 && hour < 12;
    case 'afternoon':
      return hour >= 12 && hour < 18;
    case 'evening':
      return hour >= 18 && hour < 24;
    case 'night':
      return hour >= 0 && hour < 5;
    default:
      return true;
  }
}
