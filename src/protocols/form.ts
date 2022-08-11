type FormField = {
  id: string,
  placeholder: string,
}

export type CheckoutForm = {
  formId: string,
  cardholderName: FormField,
  cardNumber: FormField,
  cardExpirationMonth: FormField,
  cardExpirationYear: FormField,
  securityCode: FormField,
  installments: FormField,
  identificationType: FormField,
  identificationNumber: FormField,
  issuer: FormField,
}
