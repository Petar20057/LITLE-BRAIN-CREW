# Little Brain Crew — funnel, ponude i churn

> **2026-10-26: brend je preimenovan iz VIBE LIFE CODE u Little Brain Crew**, a ebook „The Crew Code“ je sada **The Kid Brain Toolkit**. Stariji odeljci ispod još pominju stara imena; važeće stanje je u odeljku 10.
>
> **2026-10-26 (kasnije): Crew Club je $19/mes ili $199/god i to je jedina članarina.** Club Lite ($4) i trial ($1/14 dana) su ukinuti. Novi afilijejt program samo za članove: odeljak 11.
>
> **2026-10-26 (Luka): plaćanja i afilijejt idu preko Creem-a** (merchant of record). Stripe, PayPal i naš `/r/` link su uklonjeni. Plaćanje: odeljak 7, afilijejt: odeljak 11.

Ovaj dokument objašnjava **zašto** sajt izgleda i prodaje ovako. Copy na sajtu je na engleskom (tržište je US, cene u $), objašnjenja su na srpskom za tim.

Cene i tekst svih ponuda menjaš na jednom mestu: [`lib/funnel.ts`](lib/funnel.ts).

---

## 1. Naslov i početna strana

**Besplatni kviz je uklonjen** (odluka 2026-10-25). Početna strana sada direktno prodaje, a sve tri ponude stoje jedna pored druge: ebook $9, 30-Day Reset $39 i Crew Club $9/mes. Stari linkovi i reklame na `/quiz` vode na `/#plans`.

**Rule of One za copy početne strane** (zapisano i kao komentar na vrhu `design/index.html`):

| | Odluka |
|---|---|
| **Jedan čitalac** | Roditelj deteta od 3–17 godina koji je umoran od pogađanja zašto se dete ponaša kako se ponaša. |
| **Jedna velika ideja** | Ponašanje tvog deteta ima **kod**. Iza većine problema stoji nekoliko istih svakodnevnih stvari (san, svetlo, kretanje, ekrani, stres, bliskost) i nekoliko moždanih hemikalija na koje one utiču, a mi smo ih pretvorili u likove. |
| **Jedno obećanje** | Znaćeš šta se zaista dešava i šta da uradiš, za 10 minuta dnevno. |
| **Jedna akcija** | „Choose your plan“: svako dugme na strani vodi na `#plans`. |

Ideja je namerno opšta: radi za svih 6 likova i za **svaki novi lik koji dodamo**, bez prepravljanja naslova. Uklapa se i u ime brenda (Vibe Life **Code**).

**Naslov:**

> *for parents of kids 3–17*
> **Your kid didn’t come with a manual. Here’s the code.**

Lede odmah nabraja bolne tačke („Meltdowns. Bad sleep. ‘I’m bored.’ Big moods out of nowhere. A teen who stopped talking.“), pa daje veliku ideju („It looks like a dozen different problems, but most of it comes back to the same few everyday things…“) i skida trud i prigovore („10 minutes a day. No pills. No lectures.“). Tate dobijaju svoju verziju kad kliknu „I’m a dad“.

**Bolne tačke kroz „decoder“:** sekcija „A dozen different problems. The same few causes.“ ima 8 kartica *„šta vidiš kod kuće → koji lik stoji iza toga“* (suze kad se ugasi ekran → Dopa, eksplodira oko sitnica → Corti, mrzovoljan ujutru i budan noću → Sero, tinejdžer bez energije → Teo…). Završava se rečenicom „It’s a code. Not a bad kid. Not bad parenting.“ **Kad dodamo novi lik, dodamo jednu karticu** i ništa drugo se ne menja.

**Redosled:** naslov → decoder (bolne tačke) → likovi („Six so far. More are joining the crew.“) → kako radi u 3 koraka (See it → Try one small thing → Keep it going, gde svaki korak odgovara jednom proizvodu) → činjenice → tri ponude jedna pored druge → za koga jeste i nije → pitanja (uključujući „Will you add more crew members?“) → „More from the crew“ → završni CTA („Every behavior has a reason. Tonight, you can know it.“).

Strip („One evening with Dopa“) je **uklonjen** sa sajta, zajedno sa `comic.js`.

**Rule of One i dalje važi tamo gde se odlučuje:** checkout i svaka ponuda posle plaćanja imaju jednu stvar i jedno dugme. Header nema meni, a ostale stranice su u footeru:

| Stranica | Šta je tu |
|---|---|
| `/pricing` | 30-Day Reset do detalja (nedelja po nedelja, value stack), ebook kao downsell, Crew Club, tabela poređenja |
| `/dopa` | članak za reklame; prodaje The Crew Code, počinje Dopinim trenucima (`/checkout/guide?crew=dopa`) |
| `/ask` | „Ask the crew“ chat |
| `/free` | besplatni saveti, stikeri, Screen-Off Challenge (email lista) |
| `/gift`, `/shop`, `/founding`, `/schools`, `/faq` | poklon, waitlist, founding parents, B2B, pitanja |

**Bez kviza na početnoj više nema glavnog hvatanja emaila na sajtu.** Na `/free` ostale su forme (lista „15 ways to end screen time“, stikeri, izazov). Lead magnet je sada kviz `/code`, koji se šalje samo kroz Instagram DM (sekcija 12).

## 2. Hormozi: value equation

**Vrednost = (željeni ishod × verovatnoća da uspe) ÷ (vreme do rezultata × trud i žrtva)**

Kako je primenjeno na 30-Day Reset (`/pricing`):

| Poluga | Kako je u copy-ju |
|---|---|
| ↑ Željeni ishod | „Screens off without the war. Bedtime without the battle.“ Konkretni trenuci, ne apstraktno „srećnija porodica“. |
| ↑ Verovatnoća | Mehanizam (likovi), tačne reči za teške trenutke, dečje verzije crtaća (dete „kupuje“ ideju), founding parents za prve prave recenzije. |
| ↓ Vreme do rezultata | „Start tonight“, prva navika već prve večeri, Day 1 = 10 minuta. |
| ↓ Trud i žrtva | 10 min dnevno, bez knjiga, bez dijeta, bez pilula, uklapa se u ono što već radiš (vožnja do škole, večera). |

Ostali Hormozi elementi:
- **Value stack** gde je svaka stavka spojena sa problemom koji uklanja („So you’re not reading parenting books at midnight“).
- **Bez garancije** (odluka 2026-10-26). Pošto je proizvod digitalan i odmah dostupan, svuda jasno piše da je prodaja konačna („all sales are final“). Ako link ili fajl ne radi, popravljamo. Politika refundacije mora biti vidljiva, pa je u FAQ-u i na checkout-u. Creem je merchant of record i ima svoja pravila za refundacije: proveriti da se slažu sa „all sales final“ pre puštanja naplate.
- **Za koga jeste / nije** smanjuje pogrešne kupce i reklamacije.
- **Cena po danu** ($1.30) kao sidro, umesto izmišljenih „vrednost $X“ brojki.
- **Downsell na istoj stranici:** „Not ready for 30 days? Start with the $9 guide.“

---

## 3. Mapa funnela

```
Početna / pricing / Dopa članak
   ├─► The Crew Code $9 + bump Bedtime & Screen-Off Kit $7 ─► Upsell: upgrade na program $30 ──► Downsell: Screen-Off Week $12 ─► Crew Club $19/mes ─► Thank you
   │                                                         (tvojih $9 se računa)              (7 dana sa Dopom, računa se
   │                                                                                             u Reset kasnije)
   ├─► 30-Day Reset $39 + bump karte $7 ───────────────────────────────────────────► Crew Club $19/mes ─► Thank you
   └─► Crew Club mesečno $19 / godišnje $199 ─────────────────────────────────────────────────────────► Thank you
/gift ──► ebook ili program kao poklon (bez upsella) ─────────────────────────────────────────────────► Thank you
footer ─► Support the crew ($3/$5/$10/$20/drugo) ─────────────────────────────────────────────────────► Thank you
Creem referral link člana ──► početna (Creem cookie 60 dana, Creem checkout pripisuje prodaju; odeljak 11)
```

| Stranica | Ruta |
|---|---|
| Checkout | `/checkout/guide`, `/checkout/program`, `/checkout/club?plan=monthly|yearly` (+ `?crew=dopa` za lično poglavlje, `?gift=1` sa poklona) |
| Upsell / downsell | `/offer/upgrade`, `/offer/screen-off-week`, `/offer/club` (`/offer/club-lite` preusmerava na `/thank-you`) |
| Kraj | `/thank-you` |
| Podrška | `/support` |
| Članstvo | `/account`, `/account/cancel`, `/account/affiliate` |
| Afilijejt | `/affiliate` (javno objašnjenje); link i statistika su u Creem affiliate dashboard-u |

**Pravila za ponude posle plaćanja:**
- Gore se vidi „Order ✓“, da roditelj zna da je već platio i da ništa nije pošlo naopako.
- Jedna ponuda, jedno veliko „Yes“, jedno pošteno „No thanks“ (bez „ne, ne volim svoje dete“ fora; to je confirmshaming i ruši poverenje).
- Hitnost je samo istinita: „This $30 price is only on this page“ je tačno, jer program inače košta $39. Lažni tajmeri se ne koriste.
- Checkout i ponude **nemaju meni**: logo i ništa za klik u stranu.

---

## 4. Churn: kako držimo članove Crew Club-a

### Već napravljeno (UI, preview)

| Tehnika | Gde |
|---|---|
| **Godišnji plan** sa uštedom $29 ($199 umesto $228, oko 13%); na `/account` je ponuda „Save $29 a year“ | `/pricing`, checkout, `/account` |
| **Pauza umesto otkazivanja** (1, 2 ili 3 meseca, bez naplate) | `/account` → „Pause for a while“, i u cancel flow-u |
| **Cancel flow sa razlogom** → jedna ponuda koja odgovara razlogu | `/account/cancel` |
| · „Preskupo“ → pola cene 3 meseca ($9.50), plus „5 članova na tvom linku pokriva tvojih $19“ | |
| · „Nemam vremena“ → pauza | |
| · „Dobili smo šta treba“ → pauza 1–3 meseca (Lite više ne postoji) | |
| · „Ne odgovara uzrastu“ → promena uzrasne grupe + mesec gratis | |
| · „Nešto ne radi“ → popravka + mesec gratis | |
| **Afilijejt kao razlog da se ostane:** provizija teče samo dok je član aktivan | `/account`, `/account/affiliate`, cancel flow |
| **Win-back:** posle otkazivanja ostaje sačuvan napredak, dugme „Restart my membership“, jedno pitanje za feedback | kraj cancel flow-a |
| **Navika i napredak:** „This week“ crtać i streak na nalogu | `/account` |

### Zakon i poverenje (obavezno)
- Dugme **„Cancel now“ je vidljivo na svakom koraku**; ponuda za spas nikad ne blokira otkazivanje. Zakoni o auto-obnavljanju (npr. Kalifornija) traže lako online otkazivanje.
- Pre svake obnove i pre kraja triala šalje se email.
- Na checkout-u za članstvo postoji **obavezan checkbox** da korisnik razume da se članstvo obnavlja.

### Uraditi kad se poveže Creem (nije još urađeno)
1. **Dunning:** Creem sam ponavlja neuspelu naplatu (`subscription.past_due` → `active` ili `canceled`). Na `past_due` / `unpaid` šaljemo naš email sa linkom za Creem customer portal (promena kartice). Ovo je obično najveći izvor „nevoljnog“ churna.
2. **Pauza i pola cene u cancel flow-u:** Creem dokumentacija ne pokazuje pauzu ni privremeni popust na postojećoj pretplati. Pitati Creem podršku; ako ne postoji, te dve save ponude menjamo (npr. besplatan mesec preko kupona pri ponovnom pristupanju).
3. **Onboarding do prvog rezultata za 48 h:** email 1 „uradi ovo večeras“, email 2 „kako je prošlo?“.
4. **Zakazani sadržaj:** svake nedelje novi crtać, svakog meseca izazov, plus najava „sledeće nedelje stiže…“, da uvek postoji razlog da se ostane.
5. **Merenje:** churn po mesecu i po razlogu iz cancel flow-a; koja save ponuda najčešće uspeva.

---

## 5. Support the crew (umesto „Donate“)

VIBE LIFE CODE je firma, ne registrovana neprofitna organizacija, pa dugme **ne sme da se zove „Donate“**: PayPal Donate je samo za humanitarne organizacije, a reč „donacija“ ljudi shvataju kao poreski odbitak. Zato:
- Footer na svakoj stranici ima „♥ Support the crew“ → `/support`, a link postoji i na thank-you strani.
- Iznosi $3 / $5 / $10 / $20 / drugo, plaćanje preko Creem-a. Proveriti da li Creem podržava proizvod sa iznosom po izboru kupca; ako ne, prave se fiksni proizvodi za svaki iznos.
- Jasna rečenica na stranici: plaćanje firmi, nije donacija, nije poreski odbitak, ne dobija se proizvod.

---

## 6. Sadržaj proizvoda: šta postoji, šta fali

**Gotovo (2026-10-26)**, u `products/` (vidi odeljak 9):

| Proizvod | Šta postoji |
|---|---|
| **The Crew Code $9** | ebook, 17 strana, 12 trenutaka (isti kao decoder na početnoj); bonusi: 24 kartice „Say This, Not That“, „60-Second Meltdown Plan“ (1 strana), poster (1 strana) |
| **Bedtime & Screen-Off Kit $7** | priča za laku noć (tekst, spreman za audio), skripte za tajmer po uzrastu, kartica rutine za spavanje |
| **Screen-Off Week $12** | vodič za roditelje (7 večeri), plus skripte za 7 crtaća i dečje verzije |
| **6 crtaća za ebook** | skripte, po jedna za svaki lik |

**Još treba napraviti:**
- **Video i audio:** 6 crtaća iz ebooka, 7 crtaća Screen-Off Week i audio priča za laku noć. Skripte su u `products/pdf/production/`, a video ide postojećim pipeline-om (ElevenLabs + animacija).
- **30-Day Reset $39:** 30 crtaća sa dečjim verzijama, jedna navika dnevno sa tačnim rečima, fridge tracker, teen bonus sa Teom. Screen-Off Week može da bude njegova nedelja sa Dopom.
- **Crew Club ($19/mes, $199/god):** nedeljni crtać, mesečni izazov, priče za laku noć, privatna grupa. Ne naplaćivati dok sadržaj ne postoji.
- **Crew Habit Cards** (bump $7 uz program): 30 kartica.

## 7. Povezivanje plaćanja (sledeći korak)

Sve je u preview modu (`PREVIEW = true` u `lib/funnel.ts`): dugmad prolaze kroz funnel bez naplate, a žuta traka to piše na svakoj checkout strani. Za pravu naplatu treba zameniti `charge()` u [`lib/payments.ts`](lib/payments.ts):

**Odluka 2026-10-26 (Luka): sve plaćanje ide preko Creem-a** (creem.io, merchant of record: Creem je prodavac na računu, obračunava porez i izdaje račune). PayPal dugmad su uklonjena jer Creem dokumentacija ne navodi PayPal; kupac plaća karticom, Apple Pay ili Google Pay.

- **Checkout:** server poziva Creem „create checkout“ (`product_id`, email kupca, `metadata` sa našim ID-jem porudžbine) i šalje kupca na `checkout_url`. Pristup se daje iz webhookova `checkout.completed` i `subscription.paid`, nikad iz redirecta.
- **Proizvodi u Creem-u:** Toolkit $9, Reset $39, upgrade $30, Screen-Off Week $12, Club $19/mes i $199/god, plus kombinovani proizvodi za bump (Toolkit + Bedtime Kit $16, Reset + karte $46), jer Creem nema order bump.
- **Upsellovi:** Creem dokumentacija ne pokazuje one-click naplatu sačuvane kartice. Svako „Yes“ na ponudi otvara novi Creem checkout sa unapred upisanim emailom. Očekivati nešto manju konverziju upsella nego sa one-click; ako Creem podrška potvrdi one-click, vraćamo ga.
- **Članstvo:** Creem subscriptions; otkaz na kraju perioda (`subscription.scheduled_cancel`), customer portal link za karticu. Statusi u bazi prate Creem (`supabase/migrations/20261026120000_crew_club.sql`).

**Napravljeno (2026-10-26), ugašeno dok se ne unesu ključevi:**
- [`lib/creem.ts`](lib/creem.ts): Creem API (checkout, provera webhook potpisa), mapa naših proizvoda na Creem `product_id` (test i live). Bez `CREEM_LIVE=true` uvek gađa **test** Creem.
- `POST /api/checkout` ([`app/api/checkout/route.ts`](app/api/checkout/route.ts)): browser šalje samo ID-jeve stavki; cenu i Creem proizvod bira server. Za članstvo traži potvrdu obnove i čuva vreme u metadata (`renewal_consent_at`).
- `POST /api/creem/webhook` ([`app/api/creem/webhook/route.ts`](app/api/creem/webhook/route.ts)): proverava `creem-signature`, upisuje i ažurira Crew Club pretplate u Supabase. Novom kupcu pravi Supabase nalog po emailu. Jednokratne kupovine se za sada samo loguju.
- `charge()` u [`lib/payments.ts`](lib/payments.ts): u preview-u kao do sad; uživo zove `/api/checkout` i šalje kupca na Creem.

**Koraci za uključivanje (prvo test, pa tek onda pravi novac — to je Lukina odluka):**
1. U Creem **test** prodavnici napravi proizvode: Toolkit $9, Toolkit + Bedtime Kit $16, Reset $39, Reset + karte $46, upgrade $30, Screen-Off Week $12, Club $19/mes, Club $199/god. Upiši njihove ID-jeve u `PRODUCTS` u `lib/creem.ts` (polje `test`).
2. U `.env.local` / Vercel upiši `CREEM_API_KEY` (test ključ) i `CREEM_WEBHOOK_SECRET`; `CREEM_LIVE` ostavi prazno.
3. U Creem dashboard-u dodaj webhook `https://<sajt>/api/creem/webhook`.
4. Primeni migraciju `supabase/migrations/20261026120000_crew_club.sql` u Supabase.
5. U `lib/funnel.ts` stavi `PREVIEW = false`, pa prođi ceo funnel sa Creem test karticom.
6. Tek posle odgovora Creem podrške i Lukinog OK: live proizvodi (polje `live`), live ključ i `CREEM_LIVE=true`.

**Još nije napravljeno:** slanje fajlova emailom posle jednokratne kupovine, prijava člana na `/account` (magic link) i povezivanje `/account` / cancel flow-a sa pravim podacima, „Support the crew“ (čeka odgovor o iznosu po izboru).
- **Supabase:** narudžbine, članovi, email liste sa `/free` i razlozi otkazivanja.

---

## 8. Hormozi kritika ebooka i šta je promenjeno (2026-10-26)

Ukratko, šta bi Hormozi zamerio staroj $9 ponudi i šta je urađeno:

| Zamerka | Promena |
|---|---|
| „Prodaješ informaciju, a ljudi kupuju ishod.“ Ime „Meet the Crew“ opisuje proizvod. | Novo ime **The Crew Code**, uz obećanje „the parent’s decoder for the 12 hardest moments · read it tonight in 20 minutes, know what to say tomorrow“. |
| Premalo problema i rešenja (4 stavke). | 12 trenutaka, svaki sa rešenjem, plus 4 bonusa od kojih svaki gasi jedan prigovor (nemam vremena → crtaći; ne znam šta da kažem → kartice; zaboravim u trenutku → 60-sekundni plan). |
| Bump od $3 je preslab da isplati reklamu. | Bump je sada **Bedtime & Screen-Off Kit, $7**, i gađa dve najveće muke dana. |
| Downsell 2 × $15 rešava cenu, a problem je poverenje da će uraditi 30 dana. | Downsell je **Screen-Off Week, $12**: manje posla, uračunava se u Reset. |
| Meni bez sidra. | Na kartici ebooka piše „the cheapest way to start“ i „already included in the 30-Day Reset“. |
| Slaba garancija. | **Luka je odlučio: bez garancije** i bez „win your money back“. Poverenje gradimo jasnim proizvodom, besplatnim sadržajem i founding parents recenzijama. |
| Nema dokaza. | **Founding parents (`/founding`):** prvih 50 porodica dobija 30-Day Reset, The Crew Code i sve bonuse besplatno. Zauzvrat odrade 30 dana, odgovore na 3 kratka pitanja 7. i 30. dana, a recenziju ili video daju samo ako žele, uz pisanu dozvolu. Kartica za ovo je i na početnoj („More from the crew“). |
| Nema hitnosti. | Samo prava hitnost: launch bonus ili rast cene sa stvarnim datumom, preko `EARLY_BIRD_CONFIRMED`/`OPEN` u `design/assets/site.js`. **Čeka datum.** |

Ilustrativna računica (stope su pretpostavke): ranije je prvi dan donosio ≈ $15 po kupcu. Sa bumpom od $7 (30% uzima) i downsellom od $12 (5–10% onih koji odbiju upgrade) raste na ≈ $16–17. Pomak je mali, pa je najveća poluga i dalje procenat koji uzme upgrade od $30 (zato dokaz i garancija). Cilj je da prvih 30 dana keša po kupcu pokrije cenu dobijanja kupca iz reklama, pa tek kad stignu pravi brojevi treba testirati i cenu ebooka ($9 protiv $17).

---

## 9. Gotovi proizvodi (fajlovi)

Sadržaj je pisan po bazi znanja i njenim pravilima (likovi su metafora, bez obećanja ishoda, bez garancije). Fajlovi su u `products/` (van `web/`, ne objavljuje se na sajtu):

- `products/content/*.html`: tekstovi, ovde se menja sadržaj
- `products/build.mjs`: pravi PDF-ove (`node products/build.mjs`), istim fontovima, bojama i likovima kao sajt
- `products/pdf/`: PDF-ovi za kupce
- `products/pdf/production/`: skripte za video i audio (ElevenLabs, animacija), nisu za kupce

Kad se poveže Supabase, PDF-ovi idu u privatni storage i kupac dobija link sa rokom važenja. Nikad ne idu u `web/public/`.

---

## 10. Little Brain Crew: šira oblast (2026-10-26)

Izvori: „Little Brain Crew — biznis plan“ i „Little Brain Crew — lista likova“ (156 stavki u 11 grupa), oba od Rajka Novakovića.

**Odluke (Luka):**
- **Brend:** svuda je sada Little Brain Crew (logo, naslovi strana, checkout, podrška, PDF-ovi). Provera žiga u SAD i EU **još nije urađena**.
- **Kviz ostaje uklonjen**, iako ga biznis plan stavlja u centar. Email se i dalje skuplja samo na `/free`.
- **Ulazna ponuda je The Kid Brain Toolkit, $9.** Ne pravimo pojedinačne planove od $9 za svaki problem.

**Pozicioniranje: „Huberman za decu“.** Huberman se na sajtu **ne pominje po imenu**, jer bi to delovalo kao da nas podržava. Pišemo kao on: šta se dešava u telu i mozgu, zašto, koji protokol, i izvor. Copy je Hormozi: bol, mehanizam, ponuda, bez obećanja ishoda.

**Ekipa na sajtu (12):**

| Grupa | Likovi |
|---|---|
| Glasnici | Dopa, Sero, Endo, **Nora**, **Gabi** |
| Hormoni | Toci, Corti, **Mela**, **Greli**, Teo (samo za tinejdžere) |
| Delovi mozga | **Migo**, **Fronti** |

Novi likovi su podebljani (drugi talas iz liste likova) i na sajtu imaju oznaku „NEW“.

**Novi delovi početne strane:**
- **Dva pravila:** Plasti (mozak se menja od onoga što se ponavlja) i Duo (deca pozajmljuju tvoj mir, a Duo si ti).
- **Zlikovci:** Bedi, Glo, Lupi, Pingi, Lati, Kafi, svaki sa „Beat it“ rešenjem. Kad pređeš mišem, zlikovac izgubi.
- **Uzrasti:** Whyzi (3–6), Skuli (6–8), Ruli (8–10), Tweeni (10–12), Sprouti (12–14), Seki (14–17).
- **Decoder je osvežen:** 12 trenutaka sada vodi i do novih likova (Nora, Migo, Fronti, Greli, Mela, Gabi).

**Dizajn likova:** svih 20 novih likova je nacrtano u `web/design/assets/crew-art.js`, u istom stilu kao prvih šest, svaki u 3 raspoloženja.
- Mela nosi kapicu za spavanje.
- Migo je badem (amigdala znači badem) sa sirenom.
- Fronti ima šlem i STOP znak.
- Greli je stomak sa viljuškom.
- Gabi je oblak, Nora ima lampu na čelu.
- Zlikovci su predmeti sa lukavim obrvama; raspoloženje „tired“ je „pobeđen“.
- Uzrasti idu kao pastelna duga.
- Plasti je komad gline, Duo je veliki i mali lik zajedno.

Nijedan lik nije osećanje, zbog rizika sličnosti sa filmom *Inside Out*.

**Nove ponude:**

| Ponuda | Šta obećava |
|---|---|
| **The Kid Brain Toolkit, $9** | 12 likova, 12 najtežih trenutaka, 6 zlikovaca, šta je normalno u kom uzrastu, izvori; bonusi (kartice, meltdown plan, poster, crtaći) |
| **The 30-Day Reset, $39** (protokol) | 1. nedelja san (Mela, Corti protiv Glo i Bedi); 2. nedelja ekrani i fokus (Dopa, Nora protiv Lupi i Pingi); 3. nedelja ispadi i glad (Migo, Fronti, Greli, Gabi); 4. nedelja kretanje i bliskost (Endo, Toci, Sero, ti); teen track sa Teom; Toolkit uključen |
| **The Crew Club, $19/mes ili $199/god** (zajednica) | novi lik svakog meseca (sa mape od 156), mesečna Q&A epizoda, privatna zajednica roditelja, vodiči po uzrastu, mesečni izazov i priče |

**Šta još fali:**
- **Sadržaj Toolkita: urađeno 2026-10-26.** `products/pdf/The Kid Brain Toolkit.pdf`, 34 strane: dva pravila (Plasti, Duo), 12 likova, 12 trenutaka (isti kao decoder na početnoj), 6 zlikovaca, 6 uzrasta i izvori (samo iz `products/content/_sources.md`, numerisani u tekstu). Stari „The Crew Code“ PDF je obrisan.
- **30-Day Reset po novim nedeljama** i sadržaj Crew Club-a.
- **Provera žiga** za „Little Brain Crew“ i za nadimke likova.
- **Pedijatar savetnik** za mesečnu proveru scenarija.

---

## 11. Afilijejt program (samo članovi Crew Club-a)

Odluke 2026-10-26 (Luka): članovi kluba zarađuju **20%** od prodaje preko svog linka, **samo u novcu**, a program ide preko **Creem-ovog ugrađenog afilijejt programa** (Affiliate Hub). Luka je prihvatio Creem-ova pravila umesto naših ranijih ($25, 30 dana).

**Kako radi:**
- Program je **zatvoren**: u Creem-u isključiti „Public Program“, uključiti „Requires Approval“. Član na `/account/affiliate` prihvati pravila i zatraži pozivnicu; mi proverimo članstvo i pošaljemo Creem invite iz Affiliate Hub-a (ručno, Creem nema API za to).
- **Članstvo je uslov samo za ulazak.** Creem ne može da ukloni ni zaustavi pojedinačnog afilijejta, pa član koji kasnije otkaže ostaje u programu i dalje zarađuje. Tako i piše na sajtu.
- Link, klikovi, zarada i isplate su u **Creem affiliate dashboard-u**. Creem postavlja cookie i njegov checkout pripisuje prodaju; mi ništa ne pratimo (naš `/r/` link i `lbc_ref` cookie su uklonjeni).
- Brojevi (`AFFILIATE` u [`lib/funnel.ts`](lib/funnel.ts), isto u Creem podešavanjima, `design/affiliate.html` i Terms u `content/learn/site-pages.ts`; menjaj sve zajedno):
  - 20% provizije, računa se posle **2% koje Creem uzima** na svaku afilijejt prodaju
  - cookie **60 dana** (podešava se u Creem-u)
  - **7–12 dana** čekanja, isplate **1. i 15.** u mesecu, minimum **$50**
  - isplata na banku (Creem naplaćuje $7 ili 1%, šta je veće) ili USDC (2%), posle jednokratne Creem provere identiteta
  - „Support the crew“ se ne računa

**Računica (posle 2%):** mesečni član $3.72, godišnji $39.00, Reset $7.64, Toolkit $1.76.

**Napravljeno (preview):** `/affiliate` (javno), `/account/affiliate` (pravila → „Send me my invite“ → potvrda, 3 gotova opisa sa oznakom), kartica na `/account`, link u footeru, odeljak u Terms, Creem referral cookie u Privacy, rečenica u cancel flow-u („price“ razlog).

**Pitati Creem podršku pre puštanja:**
1. Da li se provizija računa i na **obnove** pretplate (svaki mesec / godinu)? Do odgovora na `/affiliate` stoji žuto „renewals: confirming with Creem“, a copy ne obećava mesečnu zaradu. Ako je odgovor da, vraća se računica „6 članova pokriva tvojih $19“ u cancel flow.
2. Može li se proizvod (Support the crew) **isključiti** iz programa?
3. Da li Creem izdaje afilijejtima poreske formulare (1099 za US) ili to radimo mi?
4. Pravni tekst uslova (žuti `draft` na stranicama).

## 12. Lead magnet: kviz `/code` (Instagram DM, 2026-10-26)

**Šta je:** kviz od oko 5 minuta (produžen 2026-10-26 sa 3–4, da se roditelji više „ulože“) na `littlebraincrew.com/code`. Nije na početnoj, nema meni, ima `noindex` i nije u sitemap-u. Šalje ga ManyChat u Instagram DM kada neko napiše ključnu reč **CODE**. Pokriva sve sa sajta: uzrasne faze, 12 trenutaka (isti kao decoder na početnoj), likove, spavanje po uzrastu, svih 6 negativaca, 3 mita, Pravilo 1 (Plasti) i Pravilo 2 (Duo).

**Tok:** intro → uzrast → kartica uzrasne faze → izbor do 3 trenutka → za svaki trenutak „Who’s behind it?“ (pogađa jednog od 3 lika), pa lekcija (šta se dešava, šta probati večeras, izvor) → provera spavanja (kad zaspi i kad ustaje, poređenje sa AASM preporukom za uzrast) → provera negativaca (koje od 6 navika postoje kod kuće, pa kako pobediti prvog) → Myth or Fact × 3 → Plasti → pitanje „šta obično radiš“ → Duo → **email** → rezultat (likovi, faza, negativac, spavanje, plan za 3 večeri u kom su trenutak, negativac i spavanje, šta reći detetu, Toolkit $9 sa `?crew=` i Reset $39).

**Gde je šta:**
- Tekst, trenuci, varijante: `content/quiz.ts`. Lekcije i saveti se uzimaju iz `content/learn` (`lib/quiz.ts`), pa se tekst menja tamo.
- Ekran: `components/quiz/Quiz.tsx`; sesija i praćenje: `components/quiz/session.ts`.
- API: `/api/quiz/event` (svaki klik), `/api/quiz/lead` (email + email sa rezultatom, šablon `quizResultEmail`, preview `/dev/emails/quiz-result`).
- Baza: `supabase/migrations/20261026150000_quiz.sql` (`quiz_sessions`, `quiz_events`, `quiz_leads` + funkcije za statistiku). Pregledač ne može da čita ni piše ništa.
- Kupovina: `?qs=<sesija>` ide iz rezultata u checkout → Creem `metadata.quiz_session` → webhook upisuje `purchased_at`.

**Kako se čita levak:** `/admin/quiz` u admin panelu (sekcija 13; stari `/stats/quiz` preusmerava tamo, `STATS_TOKEN` više ne treba). Prikazuje:
1. konverziju po varijanti (start → email → rezultat → klik na checkout → kupovina),
2. koliko ljudi je videlo svaki ekran, sa % od starta i medijanom vremena po ekranu (gde najviše odustaju),
3. odgovore (uzrast, trenuci, mitovi, Duo, štikliran nedeljni savet).

Filteri: 7/30/90/365 dana i izvor (`utm_source`).

**A/B test:** varijante su u `content/quiz.ts` (`VARIANTS`). Posetilac dobije nasumičnu varijantu za celu sesiju, a može se i zadati preko `?v=b`. Za sada se testira samo naslov intro ekrana. Varijantu koja gubi treba skloniti tek kad obe imaju bar nekoliko stotina startova.

**ManyChat (radi Luka, plaća se):** ManyChat Pro (~$15/mes) → Instagram → Automation „Comment/DM keyword“ = `CODE` → DM sa dugmetom i linkom:
`https://www.littlebraincrew.com/code?utm_source=instagram&utm_medium=dm&utm_campaign=code&k=CODE`
Za druge kampanje promeni `utm_campaign` ili `k`, pa se vide odvojeno. „Comment CODE“ je u skladu sa pravilom za mesec 1 (komentar, bez linka u postu).

**Šta još fali:**
- Migracija je primenjena na živu bazu 2026-10-26 i proverena prolaskom kroz kviz (test redovi obrisani).
- `20261026180000_quiz_answers_v2.sql`: `quiz_answers` broji i nove odgovore (pogađanja, spavanje, negativci, treći mit) za `/admin/quiz`. Primenjena na živu bazu 2026-10-27.
- Drift u bazi je rešen 2026-10-26: živa baza je imala staru Stripe/PayPal verziju `20261026120000_crew_club.sql`, a `20261026160000_crew_club_creem.sql` je prebacuje na Creem. `npm run db:types` sada opet generiše ceo fajl sa tipovima.
- SES ključevi (bez njih se email sa rezultatom ne šalje, samo se loguje).
- Nedeljni saveti za one koji su štiklirali: sekvenca mejlova i unsubscribe ruta još ne postoje.

## 13. Admin panel `/admin` (2026-10-26)

**Ulaz:** `www.littlebraincrew.com/admin/login`, email + lozinka. Admin je Supabase auth korisnik sa `app_metadata.role = "admin"` (to može da postavi samo tajni ključ). Nalog se pravi ili lozinka menja sa `node scripts/create-admin.mjs <email>` (generiše novu lozinku i ispiše je jednom). Roditelji sa Club nalogom nemaju tu ulogu i ne mogu da uđu. Stranica nema meni i ima `noindex`.

**Tabovi** (svaki ima filter 7/30/90/365 dana):
1. **Traffic** (`/admin`): posetioci, posete, pregledi stranica, bounce, povratnici, newsletter pretplatnici, posete kviza; posetioci po danu; top stranice, ulazne stranice, sajtovi koji šalju posete, UTM izvor i kampanja, uređaj, država.
2. **Newsletter & forms** (`/admin/newsletter`): jedinstveni pretplatnici, nove prijave po danu i po formi, poslednjih 100 prijava sa detaljima, **CSV sa svim mejlovima** (`/admin/newsletter/export`).
3. **Quiz /code** (`/admin/quiz`): isto što je bilo na `/stats/quiz` (sekcija 12).
4. **Crew Club** (`/admin/members`): plaćeni članovi, MRR, nove i otkazane pretplate, statusi, planovi, razlozi otkazivanja i save ponude. Prazno dok Creem nije živ.

**Kako se broji:**
- Posete: `components/Track.tsx` (u root layout-u) šalje `sendBeacon` na `/api/track` za svaku stranicu. Bez kolačića: nasumični `lbc-vid` (localStorage) = posetilac, `lbc-sid` (sessionStorage) = poseta. Ne čuvamo IP ni user agent; država iz Vercel header-a. Botovi i `/admin`, `/stats`, `/dev`, `/api` se ne broje. Brojanje kreće od puštanja panela.
- Forme: `post()` u `design/assets/site.js` šalje svaku email formu na `/api/signup` → tabela `signups` (jedan red po emailu po formi). **Do sada se forme nisu nigde čuvale** (Web3Forms ključ je prazan). Gift forma se ne čuva (to je checkout, a sadrži tuđi email).
- Newsletter = `free-screen-list`, `sticker-pack`, `screen-off-challenge` + kviz roditelji koji su štiklirali nedeljni savet (`lib/analytics.ts`, `NEWSLETTER_FORMS`). Waitlist, founding i škole se broje po formi, ali nisu newsletter.
- Baza: `supabase/migrations/20261026170000_admin_analytics.sql` (`page_views`, `signups` + funkcije `traffic_*`, `signups_*`, `newsletter_subscribers`). Pregledač nema pristup tabelama.
- Privacy stranica opisuje brojanje poseta i čuvanje formi.

**Šta još fali:** unsubscribe ruta i slanje newslettera (za sada CSV), prodaje Toolkit-a i Reset-a su u Creem dashboard-u dok se ne upišu u bazu.
