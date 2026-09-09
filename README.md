<<<<<<< Updated upstream
Webova stranka Rakousy, TBD
=======
# Rakousy web

Jednoduchá statická webová stránka pro tábor LDT Rakousy.

## Deployment na Netlify

1. Nahrajte tento repozitář do GitHub.
2. V Netlify přidejte nový projekt z GitHub repozitáře.
3. Nastavte publish directory na root projektu (`.`).
4. V Netlify Dashboard > Site configuration > Environment variables přidejte:
   - `BREVO_API_KEY`
   - `BREVO_SENDER_EMAIL`
   - `BREVO_RECIPIENT_EMAIL`
5. Deployněte projekt.

## Brevo nastavení

1. Vytvořte si účet v Brevo a vytvořte API klíč.
2. Zvalidujte odesílatelovou adresu v Brevo (doporučeno je používat e-mail z domény, která patří k webu).
3. `BREVO_SENDER_EMAIL` musí být jedna z ověřených odesílatelských adres.
4. `BREVO_RECIPIENT_EMAIL` je e-mail, kam budou chodit přihlášky a zprávy od návštěvníků.

## Co backend dělá

Web odesílá formuláře na endpoint `/api/send-email`.
Netlify Function v `netlify/functions/send-email.js` pak používá Brevo SMTP API a pošle e-mail na zvolenou adresu.

## Lokální testování

Pro lokální běh můžete vytvořit `.env` soubor:

```bash
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_sender@example.com
BREVO_RECIPIENT_EMAIL=your_friend@example.com
```

Poté spusťte v Netlify CLI:

```bash
npx netlify dev
```

V prohlížeči pak přejděte na stránku a vyplňte formulář.
>>>>>>> Stashed changes
