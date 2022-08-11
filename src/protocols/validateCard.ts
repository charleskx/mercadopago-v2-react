// https://www.w3resource.com/javascript/form/credit-card-validation.php
export function validateCard(cardNumber: string) {
  var s = 0;
  var doubleDigit = false;
  for (var i = cardNumber.length - 1; i >= 0; i--) {
      var digit = +cardNumber[i];
      if (doubleDigit) {
          digit *= 2;
          if (digit > 9)
              digit -= 9;
      }
      s += digit;
      doubleDigit = !doubleDigit;
  }
  return s % 10 == 0;
}
