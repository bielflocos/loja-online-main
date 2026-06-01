const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Stripe = require('stripe');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const produtos = {
	Smartphone: {
		name: 'Smartphone',
		amount: 199900,
	},
	Smartwatch: {
		name: 'Smartwatch',
		amount: 59900,
	},
	'Fone Bluetooth': {
		name: 'Fone Bluetooth',
		amount: 29900,
	},
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

app.get('/', (_req, res) => {
	res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

app.post('/checkout', async (req, res) => {
	try {
		if (!stripe) {
			return res.status(500).json({
				error: 'Defina a variavel STRIPE_SECRET_KEY no arquivo .env para criar o checkout.',
			});
		}

		const { produto, preco } = req.body;
		const item = produtos[produto];

		if (!item) {
			return res.status(400).json({ error: 'Produto invalido.' });
		}

		if (typeof preco !== 'number' || preco !== item.amount) {
			return res.status(400).json({ error: 'Preco invalido.' });
		}

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			line_items: [
				{
					quantity: 1,
					price_data: {
						currency: 'brl',
						product_data: {
							name: item.name,
						},
						unit_amount: item.amount,
					},
				},
			],
			success_url: `${req.protocol}://${req.get('host')}/sucesso.html`,
			cancel_url: `${req.protocol}://${req.get('host')}/cancelado.html`,
		});

		return res.json({ id: session.id });
	} catch (error) {
		console.error('Erro ao criar checkout:', error);
		return res.status(500).json({ error: 'Nao foi possivel criar a sessao de checkout.' });
	}
});

if (require.main === module) {
	app.listen(port, () => {
		console.log(`Servidor rodando em http://localhost:${port}`);
	});
}

module.exports = app;
