import { useEffect, useState } from 'react';
import { CreateCardToken, MercadoPago } from './protocols';

interface ErroProps {
    field: string;
    message: string;
}

interface UseMercadoPagoProps {
    publicKey: string;
    locale?: string;
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
    const [mercadopago, setMercadopago] = useState<MercadoPago>({} as MercadoPago);
    const [identificationTypeOptions, setIdentificationTypeOptions] = useState<OptionsProps[]>([]);
    const [installmentOptions, setInstallmentOptions] = useState<OptionsProps[]>([]);
    const [cardFlag, setCardFlag] = useState<CardFlagProps>({} as CardFlagProps);
    const [issuer, setIssuer] = useState<IssuerProps>({} as IssuerProps);
    const [amount, setAmount] = useState('');

    async function getIdentificationTypes() {
        const identificationTypes = await mercadopago.getIdentificationTypes().then((response) => response.map((type) => ({ label: type.name, value: type.id })));
        setIdentificationTypeOptions(identificationTypes);
    }

    async function getInstallments({ bin, price }: InstallmentsProps) {
        if (amount) {
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

            await getInstallments({ bin: cardFirstSixDigit, price: amount });
        } catch (err) {
            if (typeof setError === 'function') {
                setError({ field: 'cardNumber', message: 'Invalid card number' });
                return;
            }

            console.error('Invalid card number.');
        }
    }

    async function createToken(cardInfo: CreateCardToken) {
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
        }
    }, [mercadopago]);

    return {
        identificationTypeOptions,
        installmentOptions,
        cardFlag,
        issuer,
        createToken,
        setAmountValue,
        checkCardDigits
    };
}

export { useMercadoPago };
