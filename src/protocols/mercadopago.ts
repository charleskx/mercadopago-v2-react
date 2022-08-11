import { GetPaymentMethod } from './getPaymentMethod'

export type GetIdentificationTypes = {
  id: string
  name: string
  type: string
  min_length: number
  max_length: number
}

export type GetPaymentMethods = {
  paging: {
    total: number
    limit: number
    offset: number
  }
  results: [
    {
      secure_thumbnail: string
      min_accreditation_days: number
      max_accreditation_days: number
      id: string
      payment_type_id: string
      accreditation_time: number
      thumbnail: string
      marketplace: string
      deferred_capture: string
      labels: string[]
      name: string
      site_id: string
      processing_mode: string
      additional_info_needed: string[]
      status: string
      settings: [
        {
          security_code: {
            mode: string
            card_location: string
            length: number
          }
          card_number: {
            length: number
            validation: string
          }
          bin: {
            pattern: string
            installments_pattern: string
            exclusion_pattern: string
          }
        }
      ]
      issuer: {
        default: boolean
        name: string
        id: number
      }
    }
  ]
}

export type GetIssuers = {
  id: string
  name: string
  secure_thumbnail: string
  thumbnail: string
  processing_mode: string
  merchant_account_id?: string
}

export type GetInstallments = {
    merchant_account_id?: string,
    payer_costs: [{
      installments: number,
      installment_rate: number,
      discount_rate: number,
      labels: string[],
      installment_rate_collector: string[],
      min_allowed_amount: number,
      max_allowed_amount: number,
      recommended_message: string,
      installment_amount: number,
      total_amount: number,
      payment_method_option_id: string
    }]
}

export type CreateCardToken = {
  cardNumber: string
  cardholderName: string
  cardExpirationMonth: string
  cardExpirationYear: string
  securityCode: string
  identificationType: string
  identificationNumber: string
}

export type Mercadopago = {
  deviceProfileId: string
  key: string
  referer: string
  tokenId: string
  version: string
  sessionId: any
  initialized: boolean
  initializedInsights: boolean

  AJAX: (t: any) => void
  clearSession: () => void
  createDeviceProvider: (n: Function) => void
  createToken: (e: any, t: any) => void
  getAllPaymentMethods: (t: any) => any
  getIdentificationTypes: (t: any) => GetIdentificationTypes[]
  getInstallments: (t: any, r: any) => GetInstallments[]
  getIssuers: () => GetIssuers[]
  getPaymentMethod: GetPaymentMethod
  getPaymentMethods: () => GetPaymentMethods
  initMercadopago: () => void
  setPaymentMethods: (e: any) => void
  setPublishableKey: (key: string) => void
  validateBinPattern: (e: any, t: any) => boolean
  validateCardNumber: (e: any, t: any, n: Function) => void
  validateCardholderName: (e: any) => boolean
  validateExpiryDate: (e: any, t: any) => boolean
  validateIdentification: (e: any, t: any) => boolean
  validateLuhn: (e: any) => boolean
  validateSecurityCode: (e: any, t: any, n: Function) => any
}

export type MercadoPago = {
  cardForm: (e: any) => any
  checkout: (e: any) => any
  constructor: (key: string, options: { locale: string, advancedFraudPrevention?: boolean }) => any
  createCardToken: (cardInfos: CreateCardToken) => Promise<any>
  getIdentificationTypes: () => Promise<GetIdentificationTypes[]>
  getInstallments: (e: any) => Promise<GetInstallments[]>
  getIssuers: (e: any) => Promise<GetIssuers[]>
  getPaymentMethods: (e: any) => Promise<GetPaymentMethods>
}

