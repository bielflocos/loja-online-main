async function comprar(produto, preco){
    try {
        const resposta = await fetch("/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                produto,
                preco
            })
        })

        const dados = await resposta.json()

        if (!resposta.ok || !dados.id) {
            throw new Error(dados.error || "Nao foi possivel iniciar o checkout.")
        }

        const stripe = Stripe("pk_test_51TavnWRpRzDKFU1kDtScVhjHyFhdsTJ9HIH2HncJbxGG8n8NEaJNX2WEgWDVf2dCWbMA6CBrmxgOcVwfZAxsHiog00hQI6ypw2")
        stripe.redirectToCheckout({
            sessionId: dados.id
        })
    } catch (error) {
        alert(error.message)
    }
}
