import { useEffect, useState } from 'react';
import { CreateCardToken, MercadoPago } from './protocols';

interface ErroProps {
    field: string;
    message: string;
}

interface UseMercadoPagoProps {
    publicKey: string;
    locale?: 'es-AR' | 'es-CL' | 'es-CO' | 'es-MX' | 'es-VE' | 'es-UY' | 'es-PE' | 'pt-BR' | 'en-US';
    setError?: (error: ErroProps) => void;
}

interface OptionsProps {
    label: string;
    value: string;
}

interface CardFlagProps {
    name?: string;
    image?: string;
}

interface IssuerProps {
    id?: number;
    name?: string;
}

interface InstallmentsProps {
    bin: string;
    price: string;
}

function useMercadoPago({ publicKey, locale = 'pt-BR', setError }: UseMercadoPagoProps) {
    const [mercadopago, setMercadopago] = useState<MercadoPago | null>();
    const [identificationTypeOptions, setIdentificationTypeOptions] = useState<OptionsProps[]>([]);
    const [installmentOptions, setInstallmentOptions] = useState<OptionsProps[]>([]);
    const [cardFlag, setCardFlag] = useState<CardFlagProps>({} as CardFlagProps);
    const [issuer, setIssuer] = useState<IssuerProps>({} as IssuerProps);
    const [amount, setAmount] = useState('');
    const [months, setMonths] = useState<OptionsProps[]>([]);
    const [years, setYears] = useState<OptionsProps[]>([]);

    async function getIdentificationTypes() {
        if (mercadopago) {
            const identificationTypes = await mercadopago.getIdentificationTypes().then((response) => response.map((type) => ({ label: type.name, value: type.id })));
            setIdentificationTypeOptions(identificationTypes);
        }
    }

    async function getInstallments({ bin, price }: InstallmentsProps) {
        if (amount && mercadopago) {
            const result = await mercadopago.getInstallments({ amount: price, bin });

            if (result.length > 0) {
                const installments = result[0].payer_costs.map((item) => ({
                    label: item.recommended_message,
                    value: String(item.installments)
                }));

                setInstallmentOptions(installments);
            }

            return;
        }

        throw new Error('Amount value is requires, use setAmountValue');
    }

    async function getCardFlag(cardFirstSixDigit: string) {
        try {
            if (mercadopago) {
                const paymentMethods = await mercadopago
                    .getPaymentMethods({
                        bin: cardFirstSixDigit
                    })
                    .then((response) => response.results.shift());

                setCardFlag({
                    image: `https://http2.mlstatic.com/frontend-assets/landing-op-internal-products/paymentMethods/checkout/credito/_${paymentMethods?.id}.svg`,
                    name: paymentMethods?.name
                });

                setIssuer({
                    id: paymentMethods?.issuer.id,
                    name: paymentMethods?.issuer.name
                });
            }
        } catch (err) {
            if (typeof setError === 'function') {
                setError({ field: 'card_number', message: 'Invalid card number' });
                return;
            }

            console.error('Invalid card number.');
        }
    }

    async function createToken(cardInfo: CreateCardToken) {
        if (mercadopago) {
            const cardNumber = cardInfo.cardNumber.replace(/\s/g, '');
            const { id } = await mercadopago.createCardToken({
                cardNumber,
                cardholderName: cardInfo.cardholderName,
                cardExpirationMonth: cardInfo.cardExpirationMonth,
                cardExpirationYear: cardInfo.cardExpirationYear,
                securityCode: cardInfo.securityCode,
                identificationType: cardInfo.identificationType,
                identificationNumber: cardInfo.identificationNumber
            });

            return id;
        }

        throw new Error('The library was not started correctly.');
    }

    function setAmountValue(amountValue: string) {
        setAmount(amountValue);
    }

    function checkCardDigits(cardNumber: string) {
        const cardDigits = cardNumber.replace(/\s/g, '');

        if (cardDigits.length >= 6) {
            const bin = cardDigits.substring(0, 6);

            getCardFlag(bin);
            getInstallments({ bin, price: amount });
        }
    }

    function getExpirationMonth() {
        const items = new Array(12).fill(true).map((_, index) => ({
            label: String(index + 1).padStart(2, '0'),
            value: String(index + 1).padStart(2, '0')
        }));

        setMonths(items);
    }

    function getExpirationYears() {
        const currentYear = new Date().getFullYear();
        const items = new Array(16).fill(true).map((_, index) => ({
            label: String(currentYear + index),
            value: String(currentYear + index)
        }));

        setYears(items);
    }

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';

        script.addEventListener('load', () => {
            setMercadopago(new window.MercadoPago(publicKey, { locale, advancedFraudPrevention: true }));
        });

        document.body.appendChild(script);

        return () => {
            let iframe = document.body.querySelector('iframe[src*="mercadolibre"]');

            if (iframe) {
                document.body.removeChild(iframe);
            }

            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (mercadopago) {
            getIdentificationTypes();
            getExpirationMonth();
            getExpirationYears();
        }
    }, [mercadopago]);

    return {
        identificationTypeOptions,
        installmentOptions,
        cardFlag,
        issuer,
        createToken,
        setAmountValue,
        checkCardDigits,
        months,
        years
    };
}

function formatBankSlipNumber(value: string) {
    const data = value.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})/, '$1.$2 $3.$4 $5.$6 $7 ');

    return data;
}

function isValidCPF(strCPF: string) {
    var Soma;
    var Resto;

    Soma = 0;
    strCPF = strCPF.replace(/[^\d]+/g, '');

    for (let i = 1; i <= 9; i++) {
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }

    Resto = (Soma * 10) % 11;

    if (Resto == 10 || Resto == 11) {
        Resto = 0;
    }

    if (Resto != parseInt(strCPF.substring(9, 10))) {
        return false;
    }

    Soma = 0;

    for (let i = 1; i <= 10; i++) {
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }

    Resto = (Soma * 10) % 11;

    if (Resto == 10 || Resto == 11) {
        Resto = 0;
    }

    if (Resto != parseInt(strCPF.substring(10, 11))) {
        return false;
    }

    return true;
}

export { useMercadoPago, isValidCPF, formatBankSlipNumber };

