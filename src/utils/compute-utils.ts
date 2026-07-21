import type {
  IRestaurantDeliveryPricingKm,
  IRestaurantEntity,
} from "chopme-frontend-common";

export class ComputeUtils {
  /**
   * Returns the delivery pricing object matching the given distance,
   * or undefined if the distance is not covered (delivery not possible).
   */
  static getDeliveryPricing(
    deliveryPricingKm: IRestaurantDeliveryPricingKm[],
    distanceKm?: number,
  ): IRestaurantDeliveryPricingKm | undefined {
    if (distanceKm === undefined || !deliveryPricingKm) {
      return undefined;
    }

    return deliveryPricingKm.find(
      (p) => distanceKm >= p.from && distanceKm < p.to,
    );
  }

  /**
   * Estimates the delivery time based on the distance in kilometers.
   * Examples:
   *  - 2 km  => "15-25 min"
   *  - 20 km => "58 min - 1h 08 min"
   *  - 40 km => "1h 46 min - 1h 56 min"
   */
  static estimateDeliveryTime(distanceKm: number): string {
    const averageSpeedKmH = 25;
    const preparationTime = 10; // minutes
    const variability = 10; // minutes

    const travelTime = (distanceKm / averageSpeedKmH) * 60;

    const min = Math.round(preparationTime + travelTime);
    const max = Math.round(min + variability);

    return `${this.formatDuration(min)} - ${this.formatDuration(max)}`;
  }

  static isRestaurantClosed(
    restaurant: Pick<IRestaurantEntity, "isClosed" | "availability">,
    date: Date = new Date(),
  ): boolean {
    // Manually closed
    if (restaurant.isClosed) {
      return true;
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const today = days[date.getDay()];

    const schedule = restaurant.availability.find((a) => a.day === today);

    // No opening hours for today
    if (!schedule) {
      return true;
    }

    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    const [openHour, openMinute] = schedule.openTime.split(":").map(Number);

    const [closeHour, closeMinute] = schedule.closeTime.split(":").map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentMinutes < openMinutes || currentMinutes >= closeMinutes;
  }

  private static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes.toString().padStart(2, "0")} min`;
  }
}
