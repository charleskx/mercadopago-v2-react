import { MercadoPago } from ".";

export interface Constructable<T> {
  new (key: string, options?: { locale: string, advancedFraudPrevention?: boolean }): T;
}

declare global {
  interface Window {
    MercadoPago: Constructable<MercadoPago>;
  }
}

export type FetchError = {
  code: number;
  message: string;
};
