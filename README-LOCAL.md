# Open the Veerly site on your own computer

This runs the site on your computer only. Nobody else can see it, and nothing is sent, charged or published.

## 1. Install Node.js (one time)
Go to https://nodejs.org, download the **LTS** version (20 or newer) and install it with the default options.

## 2. Unzip
Unzip `veerly-landing-share.zip`. You'll get a folder called `veerly-landing`.

## 3. Open a terminal in the folder
- **Windows:** open the `veerly-landing` folder, click the address bar, type `cmd` and press Enter.
- **Mac:** open Terminal, type `cd ` (with a space), drag the `veerly-landing` folder into the window and press Enter.

## 4. Install and start
Type these one at a time, pressing Enter after each (the first one takes a few minutes and needs internet):

```
npm install
npm run dev
```

## 5. Open it
Go to **http://localhost:3210** in your browser.
It uses port 3210, so it won't clash with anything you already run on 3000.

Handy links:
- From 1 Dec (countdown to Cohort 1, still waitlist only): http://localhost:3210/?preview=promo
- From 1 Jan (enrolment and checkout open): http://localhost:3210/?preview=enrol (same as ?preview=launched)
- Welcome page after payment: http://localhost:3210/welcome?preview=paid

To stop it, click the terminal and press **Ctrl + C**. To start it again later, open a terminal in the folder and run `npm run dev`.

Test signups you make are saved in `data/waitlist.json` on your computer. Email, WhatsApp and Paystack stay switched off until you add your own keys (see `.env.example` and `README.md`).
