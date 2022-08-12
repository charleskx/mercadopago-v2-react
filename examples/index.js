import { useMercadoPago } from 'mercadopago-v2-react';
import { useEffect, useState } from 'react';

function App() {
    const [formData, setFormData] = useState({});

    const { cardFlag, checkCardDigits, createToken, identificationTypeOptions, installmentOptions, issuer, setAmountValue, months, years } = useMercadoPago({
        publicKey: 'PUBLIC_KEY'
    });

    function handleChangeValueInput(event) {
        setFormData((state) => ({
            ...state,
            [event.target.name]: event.target.value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const token = await createToken(formData);

        console.log({ token });
        console.log({ formData });
    }

    useEffect(() => {
        setAmountValue('150');
    }, [setAmountValue]);

    return (
        <form onSubmit={handleSubmit}>
            <pre>issuer: {JSON.stringify(issuer, null, 2)}</pre>
            <pre>cardFlag: {JSON.stringify(cardFlag, null, 2)}</pre>
            <div>
                <label>Portador: </label>
                <input type="text" name="cardholderName" placeholder="Nome do portador" value={formData.cardholderName} onChange={handleChangeValueInput} />
            </div>

            <div>
                <label>E-mail: </label>
                <input type="email" name="cardholderEmail" placeholder="E-mail do portador" value={formData.cardholderEmail} onChange={handleChangeValueInput} />
            </div>

            <div>
                <label>Tipo de Documento: </label>
                <select name="identificationType" value={formData.identificationType} onChange={handleChangeValueInput}>
                    <option disabled value="">
                        Tipo de documento
                    </option>
                    {identificationTypeOptions.map((document) => (
                        <option value={document.value} key={document.value}>
                            {document.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Número do Documento: </label>
                <input type="text" name="identificationNumber" placeholder="000.000.000-00" value={formData.identificationNumber} onChange={handleChangeValueInput} />
            </div>

            <div>
                <label>Número do Cartão: </label>
                <input
                    type="text"
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={formData.cardNumber}
                    onChange={(event) => {
                        checkCardDigits(event.target.value);
                        handleChangeValueInput(event);
                    }}
                />
            </div>

            <div>
                <label>CVV: </label>
                <input type="text" name="securityCode" placeholder="000" value={formData.securityCode} onChange={handleChangeValueInput} />
            </div>

            <div>
                <label>Mês: </label>
                <select name="cardExpirationMonth" value={formData.cardExpirationMonth} onChange={handleChangeValueInput}>
                    <option disabled value="">
                        Mês
                    </option>
                    {months.map((month) => (
                        <option value={month.value} key={month.value}>
                            {month.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Ano: </label>
                <select name="cardExpirationYear" value={formData.cardExpirationYear} onChange={handleChangeValueInput}>
                    <option disabled value="">
                        Ano
                    </option>
                    {years.map((year) => (
                        <option value={year.value} key={year.value}>
                            {year.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Parcelas: </label>
                <select name="installments" value={formData.installments} onChange={handleChangeValueInput}>
                    <option disabled value="">
                        Parcelas
                    </option>
                    {installmentOptions.map((installment) => (
                        <option value={installment.value} key={installment.value}>
                            {installment.label}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit">Efetuar pagamento</button>
        </form>
    );
}

export default App;
