# Little Brain Crew — funnel, ponude i churn

> **2026-10-26: brend je preimenovan iz VIBE LIFE CODE u Little Brain Crew**, a ebook „The Crew Code“ je sada **The Kid Brain Toolkit**. Stariji odeljci ispod još pominju stara imena; važeće stanje je u odeljku 10.
>
> **2026-10-26 (kasnije): Crew Club je $19/mes ili $199/god i to je jedina članarina.** Club Lite ($4) i trial ($1/14 dana) su ukinuti. Novi afilijejt program samo za članove: odeljak 11.
>
> **2026-10-26 (Luka): plaćanja i afilijejt idu preko Creem-a** (merchant of record). Stripe, PayPal i naš `/r/` link su uklonjeni. Plaćanje: odeljak 7, afilijejt: odeljak 11.
>
> **2026-11-04 (Luka): Crew Club je ukinut.** Nema članarine, waitliste ni Club pristupa likovima; ništa što prodajemo se ne obnavlja. Afilijejt program (§11) je ukinut zajedno sa njim. Sve ispod što pominje Club ili afilijejt je istorija; važeće stanje: odeljak 19.

Ovaj dokument objašnjava **zašto** sajt izgleda i prodaje ovako. Copy na sajtu je na engleskom (tržište je US, cene u $), objašnjenja su na srpskom za tim.

Cene i tekst svih ponuda menjaš na jednom mestu: [`lib/funnel.ts`](lib/funnel.ts).

---

## 1. Naslov i početna strana

**Besplatni kviz je uklonjen** (odluka 2026-10-25). Početna strana sada direktno prodaje, a sve tri ponude stoje jedna pored druge: Toolkit $19 (do 2026-11-02 $9), 30-Day Reset $39 i Crew Club $19/mes. Stari linkovi i reklame na `/quiz` vode na `/#plans`.

**Rule of One za copy početne strane** (zapisano i kao komentar na vrhu `design/index.html`):

| | Odluka |
|---|---|
| **Jedan čitalac** | Roditelj deteta od 4–17 godina koji je umoran od pogađanja zašto se dete ponaša kako se ponaša. |
| **Jedna velika ideja** | Ponašanje tvog deteta ima **kod**. Iza većine problema stoji nekoliko istih svakodnevnih stvari (san, svetlo, kretanje, ekrani, stres, bliskost) i nekoliko moždanih hemikalija na koje one utiču, a mi smo ih pretvorili u likove. |
| **Jedno obećanje** | Znaćeš šta se zaista dešava i šta da uradiš, za 10 minuta dnevno. |
| **Jedna akcija** | „Choose your plan“: svako dugme na strani vodi na `#plans`. |

Ideja je namerno opšta: radi za svih 6 likova i za **svaki novi lik koji dodamo**, bez prepravljanja naslova. Uklapa se i u ime brenda (Vibe Life **Code**).

**Naslov:**

> *for parents of kids 4–17*
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
- **Downsell na istoj stranici:** „Not ready for 30 days? Start with the $19 Toolkit.“

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
- Hitnost je samo istinita: „This $20 price is only on this page“ je tačno, jer program inače košta $39 (do 2026-11-02 $30). Lažni tajmeri se ne koriste.
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
- **Proizvodi u Creem-u:** Toolkit $19, Reset $39, upgrade $20, Screen-Off Week $12, Club $19/mes i $199/god, plus kombinovani proizvodi za bump (Toolkit + Bedtime Kit $26, Reset + karte $46), jer Creem nema order bump. (Do 2026-11-02: Toolkit $9, upgrade $30, Toolkit + Bedtime Kit $16; vidi §16.)
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
- **Ulazna ponuda je The Kid Brain Toolkit, $19** (do 2026-11-02 $9). Ne pravimo pojedinačne planove za svaki problem.

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
| **The Kid Brain Toolkit, $19** | 12 likova, 12 najtežih trenutaka, 6 zlikovaca, šta je normalno u kom uzrastu; uz njega besplatno Science Edition (10 poglavlja); bonusi (kartice, meltdown plan, poster, crtaći) |
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

**Računica (posle 2%):** mesečni član $3.72, godišnji $39.00, Reset $7.64, Toolkit $3.72 (do 2026-11-02, na $9: $1.76).

**Napravljeno (preview):** `/affiliate` (javno), `/account/affiliate` (pravila → „Send me my invite“ → potvrda, 3 gotova opisa sa oznakom), kartica na `/account`, link u footeru, odeljak u Terms, Creem referral cookie u Privacy, rečenica u cancel flow-u („price“ razlog).

**Pitati Creem podršku pre puštanja:**
1. Da li se provizija računa i na **obnove** pretplate (svaki mesec / godinu)? Do odgovora na `/affiliate` stoji žuto „renewals: confirming with Creem“, a copy ne obećava mesečnu zaradu. Ako je odgovor da, vraća se računica „6 članova pokriva tvojih $19“ u cancel flow.
2. Može li se proizvod (Support the crew) **isključiti** iz programa?
3. Da li Creem izdaje afilijejtima poreske formulare (1099 za US) ili to radimo mi?
4. Pravni tekst uslova (žuti `draft` na stranicama).

## 12. Lead magnet: kviz `/code` (Instagram DM, 2026-10-26)

**Šta je:** kviz od oko 5 minuta (produžen 2026-10-26 sa 3–4, da se roditelji više „ulože“) na `littlebraincrew.com/code`. Nije na početnoj, nema meni, ima `noindex` i nije u sitemap-u. Šalje ga ManyChat u Instagram DM kada neko napiše ključnu reč **CODE**. Pokriva sve sa sajta: uzrasne faze, 12 trenutaka (isti kao decoder na početnoj), likove, spavanje po uzrastu, svih 6 negativaca, 3 mita, Pravilo 1 (Plasti) i Pravilo 2 (Duo).

**Tok:** intro → uzrast → kartica uzrasne faze → izbor do 3 trenutka → za svaki trenutak „Who’s behind it?“ (pogađa jednog od 3 lika), pa lekcija (šta se dešava, šta probati večeras, izvor) → provera spavanja (kad zaspi i kad ustaje, poređenje sa AASM preporukom za uzrast) → provera negativaca (koje od 6 navika postoje kod kuće, pa kako pobediti prvog) → Myth or Fact × 3 → Plasti → pitanje „šta obično radiš“ → Duo → **email** → rezultat (likovi, faza, negativac, spavanje, plan za 3 večeri u kom su trenutak, negativac i spavanje, šta reći detetu, Toolkit $9 sa `?crew=&moment=&qs=` (checkout piše stranu u Toolkitu za prvi trenutak), Reset $39 sa `?qs=` i besplatni 5-dnevni Screen-Off izazov, sa već upisanim mejlom). Isti Toolkit i Reset linkovi su dugmad u mejlu sa rezultatom, pa se i kupovina iz mejla računa na posetu kviza (dodato 2026-10-31; pre toga je na kraju bio samo Toolkit, bez `qs`, pa se klik i kupovina u `/admin/quiz` nisu brojali).

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

**Dublja analitika i A/B testovi (2026-10-30, migracija `20261030120000_attribution_engagement_experiments.sql`):**
- Kupovina nosi posetu: `lib/payments.ts` šalje `lbc-vid`/`lbc-sid` u `/api/checkout` → Creem metadata → webhook upisuje `visitor_id`/`session_id` na `purchase` događaj. Tabela `orders` se ne dira.
- `page_views` dobija `utm_content` (koji video/post: u bio i opis linkova stavljati `?utm_source=tiktok&utm_content=dan-07-dopa`), `app` (Instagram/TikTok/Facebook in-app browser), vreme na strani i skrol (beacon kad se strana sakrije).
- Novi događaji: `cta_click` (dugmad koja ne vode na checkout), `section_view` (koje sekcije je poseta videla), `ab_view` (koju verziju testa).
- `/admin` Traffic: exit strane, videi, aplikacije. `/admin/journey`: funnel po izvoru/videu/aplikaciji/landing strani sa % pada po koraku i $ po poseti, vreme/skrol/exit po strani, dokle se stiže na strani. `/admin/tests`: A/B rezultati ($ po posetiocu, poverenje, „too early“ ispod 300 po verziji).
- A/B: `lib/experiments.ts` (5 testova). B tekst napisan iz Perplexity istraživanja (`../LBC-COPY-BRIEF.md`), Luka odobrio i uključio sve 2026-10-30. Obe verzije su u HTML-u (`data-ab="test" data-v="a|b"` u `design/*.html`, `<AB>` u React-u), skripta u `<head>` bira verziju pre prvog prikaza, bez kolačića. QA: `?ab=home-hero:b`. Brief za istraživanje teksta: `../LBC-COPY-BRIEF.md`.

---

## 14. Plan za konverziju (Hormozi, 2026-10-29)

Ceo plan: `~/.claude/plans/nastavi-toasty-wilkinson.md`. Mera uspeha je **novac po poseti** (sa upsellima), ne stopa konverzije.

**Urađeno 29.10. (nije commitovano):**
- **Merenje:** novi događaji `checkout_submit` (klik na plaćanje), `offer_view` / `offer_no` (upsell stranice), `scroll_depth` (25/50/75/100% početne). Upsell plaćen = `post_bump_purchase` (sada i za `upgrade`). Admin Traffic tabela ima: pay clicks, upsell seen/bought, prihod i **$ po poseti**, plus tabelu dubine skrola. Migracija `supabase/migrations/20261029120000_funnel_offers_scroll.sql` mora u Supabase pre deploya.
- **Upsell iza prekidača `UPSELL_OPEN`** (`lib/funnel.ts` i `next.config.ts`, oba `false`): Toolkit → `/offer/upgrade` (Reset $20, do 2026-11-02 $30) → ne → `/offer/bedtime` (Bedtime Kit $7, preskače se ako je uzet bump) → thank-you. Screen-Off Week ostaje ugašen (crtaći ne postoje). Popravljeno: posle upsella thank-you sada dobija token za fajlove (`addPaid` u `lib/order.ts`), a `upgrade` otključava Reset + Toolkit (`lib/delivery-files.ts`).
- **Checkout:** „What's inside“ je ispod dugmeta (na telefonu email i dugme su na prvom ekranu), red sa jednom stavkom sklonjen, „All sales are final“ kao sitan tekst ispod dugmeta, bump kraći i o bolu.
- **Početna:** Club više nije treća kartica; waitlist je jedan red ispod dve kartice koje se mogu kupiti.
- „$59“ na Resetu se ne prikazuje (`data-early`, `EARLY_BIRD_CONFIRMED = false`), nije problem.

**Da bi upsell proradio (Luka):** napravi Creem proizvod „Upgrade to The 30-Day Reset“ $20 (od 2026-11-02; ranije $30) u test i live store-u, upiši id-jeve u `lib/creem.ts` (`upgrade`), stavi `UPSELL_OPEN = true` na oba mesta, test kupovina na test store-u.

**Sledeće iz plana:** decoder kartice se otvaraju na strani sa CTA (treba tačne strane u Toolkitu), stack Toolkita na ishode, „pogledaj unutra“ sa stranama PDF-a, ponuda odmah posle decodera (danas je na ~8000px skrola na telefonu), besplatna strana 5 kao lead magnet, email sekvenca od 5 mejlova.

**Urađeno 29.10. (drugi deo):**
- **Decoder prodaje:** klik na karticu otvara prozor na početnoj (zašto se dešava, „Try tonight“, strana u Toolkitu, dugme `/checkout/guide?crew=…&moment=…`, mali link na članak). Checkout tada piše „Tears when screen time ends: the plan is on p. 36 (Ch. 6 · the 4-move tablet-off)“. Strane su pročitane iz `products/delivery/Kid-Brain-Toolkit/The-Kid-Brain-Toolkit.pdf` i stoje u `MOMENTS` (`lib/funnel.ts`) i `data-*` kartica u `design/index.html` (moraju ostati iste). Ako se PDF promeni, proveriti strane.
- **Toolkit stack na ishode** (kartica na početnoj i checkout): trenutak → šta je u knjizi → strana.
- **Podsetnik za napušten checkout** (Luka: da): `checkout_starts` (migracija `20261029130000_checkout_reminders.sql`), jedan mejl 2–48 h posle, samo ako ta adresa nije platila, nije se odjavila ni sa čega i nije dobila podsetnik te nedelje; link vodi nazad na isti checkout i trenutak (`utm_source=reminder`); odjava radi i za sve liste. Cron jednom dnevno u 16:00 UTC (`vercel.json`; Vercel Hobby dozvoljava samo dnevni cron, na Pro može na svaki sat). **Ugašen dok `CHECKOUT_REMINDERS=true`** i dok nije postavljen `CRON_SECRET` u Vercel-u.
- Pre paljenja podsetnika: (1) rečenica u Privacy policy da adresu sa checkouta koristimo za jedan podsetnik; (2) CAN-SPAM traži fizičku poštansku adresu u komercijalnom mejlu (važi i za newsletter): P.O. box ili adresa registrovanog agenta LLC-a.

**Founding roditelji (Luka, 2026-10-29): za sada ne pozivamo nikoga.** Stranica `/founding` i kartica na početnoj ostaju kako jesu, a prijave i dalje stižu u admin (Newsletter & forms). Dok nema citata, dokaz na sajtu su prave strane iz PDF-a i besplatna strana 5.

## 15. Copy usklađen sa fajlovima (2026-11-02)

Posle spoljne kritike proverene protiv isporučenih fajlova (Toolkit = 72 strane, Reset = 22 strane + tracker, oboje od 28.10.):
- **Uzrast svuda 4–17** (meta, hero bedž, FAQ, About, kviz, og, llms.txt), jer verzije navika u knjizi idu 4–7 / 8–12 / 13–17. Likovi uzrasnih faza (Whyzi 3–6 …) i learn strane „3 to 17“ ostaju: to su činjenice o likovima, ne obećanje proizvoda. Spoljni direktorijumi (`brand-kit/LISTING-KIT.md`) i dalje kažu 3–17.
- **Reset „teen track“ → „a page of teen notes with Teo“** (pricing kartica, value stack, tabela, kartica na početnoj, checkout, upgrade ponuda): poglavlje „The Reset for teens“ ima 291 reč, jednu stranu, pa copy sme da obeća samo toliko.
- **Bonusi po ishodu na /pricing** (red u sadržaju Toolkita i red u tabeli), kao što je već bilo na checkoutu.
- Creem pravila provereno (docs, refunds-and-chargebacks): „all sales final“ je dozvoljeno, ali Creem može sam da refundira do 60 dana, chargeback košta $25, a kod „excessive“ chargebacka može da suspenduje nalog. Odgovor na stavku iz §2.

## 16. Toolkit $19 + Science Edition besplatno (2026-11-02)

Luka, 2026-11-02: cena Toolkita $9 → $19. Toolkit je opet knjiga sa 12 trenutaka (nova verzija: **43 strane**, bez liste referenci i bez brojeva citata; Luka je poslao fajl), a 10-poglavna knjiga (nova verzija: **67 strana**, isto bez referenci) ide uz njega besplatno kao „The Kid Brain Toolkit: Science Edition“. Opis svuda, po Lukinoj formuli, ali sa stvarnim brojem strana fajlova: **„43-page Toolkit + 67-page Science Edition free“** (Luka je napisao 46/72, to su stari fajlovi od 27.10.; strana 2 novog Toolkita i dalje kaže „Science Edition (72 pages, 78 sources)“).
- Fajlovi: `products/delivery/Kid-Brain-Toolkit/The-Kid-Brain-Toolkit.pdf` (43) i `The-Kid-Brain-Toolkit-Science-Edition.pdf` (67); `Kid-Brain-Toolkit.zip` ponovo napravljen; `lib/delivery-files.json` ima novu stavku `science-edition-pdf`. Stari fajlovi (72-stranična knjiga, arhiva od 28.10., stari zip, 34-stranični draft iz `products/pdf/`) su u `~/.Trash/lbc-toolkit-old-2026-11-02/`.
- Strane na sajtu: `MOMENTS` u `lib/funnel.ts` (decoder na početnoj, checkout, mejlovi, kviz) sada pokazuju na Toolkit, Part 2 (Moment 1–12 = str. 19–30). Science Edition je zadržala brojeve strana poglavlja stare 72-stranične knjige (poglavlje 6 screens str. 32, 8 stress str. 43 …), pa `lib/article-boxes.ts` i /pricing citiraju oba.
- Upgrade na Reset: $30 → **$20** (Reset $39 minus Toolkit $19, „your $19 counts“), `ITEMS.upgrade`; Creem proizvod „upgrade“ i dalje ne postoji (`UPSELL_OPEN` false). Affiliate red: Toolkit $3.72.
- **Ručno u Creemu (test + live), Luka:** Toolkit $9 → $19 i Toolkit + Bedtime Kit $16 → $26. Dok se to ne uradi, sajt piše $19 a Creem naplaćuje $9 (`lib/creem.ts` ne nosi cene, samo ID-jeve).
- Supabase bucket `delivery`: novi fajlovi upload-ovani 2026-11-02 (`scripts/upload-delivery.mjs --yes`), stari objekat `Kid-Brain-Toolkit/old-46-pages-The-Kid-Brain-Toolkit.pdf` obrisan.
- Novi PDF-ovi kažu „for parents of kids 3–17“ i kolone 3–7 / 8–12 / 13–17 (stari: 4–17 i 4–7). Prodajne strane ostaju na 4–17 (§15); copy koji opisuje kolone knjige kaže 3–7. Lukina odluka ako treba vratiti 3–17.


## 17. Catalogue v2 — 2 November 2026

This section supersedes the earlier prices, package contents and launch-price schedule above. Reset stays $39; there is no scheduled $59 price advertised.

- Toolkit $19: 43-page guide and existing bonuses. Science belongs to the $39 Reset bundle, with the new 61-page Reset guide and fridge tracker. Reset does not include the standalone Toolkit or its bonuses.
- Bedtime Kit $7 is one 20-page PDF: seven evenings, age-specific scripts, a routine card and a read-aloud story. Club remains a waitlist at $8/month or $80/year (two months free, save $16).
- Catalogue v1 paths and ZIPs are immutable. Existing orders and checkouts without a catalogue version default to v1. New checkouts carry catalog_version=2. The migration adds orders.catalog_version, orders.parent_order_id and the private order_upgrades table.
- New delivery files are under products/delivery/v2. delivery-files.json includes both catalogues; upload-delivery.mjs uploads their distinct paths. Do not rebuild the supplied PDFs from the older products/content HTML.
- Creem v2 IDs live in lib/creem-products.json; the old IDs remain recognised for webhook compatibility. Toolkit + Bedtime is $26; Reset + cards $46.
- POST /api/order reads webhook-confirmed purchases by a token in the JSON body. POST /api/upgrade validates a paid Toolkit order and creates/reuses its $20 checkout. A confirmed upgrade is a child order sharing the original download token. No email discount code is needed. Checkout creation never grants access.
- Schools, Founding and Gift redirect to /. Free redirects to /#free. Ask and Shop keep direct URLs, have no public navigation links, carry noindex and are excluded from the sitemap. The main hero headline is fixed; its old A/B test is inactive.

Operational note: all eight v2 live products were created with the agreed prices; the two Club products are archived so their payment links cannot accept payments. The local key is scoped for live checkout creation, with no product/discount management or sandbox access. Browser dashboard operations were used for catalogue changes. Sandbox IDs remain unset until a test key is supplied; unit tests use isolated provider fixtures.

Cutover checks: the migration is applied and all 21 current/legacy private delivery objects match their local SHA-256 hashes. The five original live products are archived after the v2 deployment; their IDs and delivery entitlements remain supported. An unused Toolkit duplicate was also archived. Six v2 one-time products remain active. Production hosted checkouts were checked for $19, $26, $39, $46 and $7, without completing payment. All 224 tests, lint, learn checks and production build passed; a full sandbox payment still needs a sandbox key/configuration. Retired-page redirects, sitemap exclusion, invalid-token rejection, closed Club checkout and the $80 annual toggle were checked on production.

After Luka's explicit approval on 2 November 2026, the old CREW100 was deleted and replaced by discount dis_cm94kbHyseKWrMebQFZ68: 100% off once, 25 total redemptions, no expiry. The dashboard confirmed 0/25 used and the five corresponding v2 products: Toolkit, Bedtime Kit, Toolkit + Bedtime, Reset, and Reset + cards. The upgrade and Club are excluded. There is one CREW100 allocation, not an additional 25-use code. TOOLKIT9 is a historical discount; the new $20 upgrade does not require it.

## 18. Svih 214 likova, zaključavanje i naplata — 3. novembar 2026

Zadatak (brif koleginice/kolege, Luka ga prosledio 3. 11.): na `/crew` svih 214 likova sa filterima All / Free / Locked / po paketu; 38 slobodnih (26 postojećih, 11 probnih = po jedan iz svakog paketa, Vejpi) sa celom stranicom; 176 zaključanih kod kojih su javni kartica (senka + ime + rečenica), kratak odgovor i „When to talk to your pediatrician“ (i sve o bezbednosti, uvek), a objašnjenje, „What to say“, štampa i crtani se otključavaju kroz Crew Club ($8/mes, $80/god) ili paket ($7 zauvek). Zaključan tekst se **ne šalje u HTML** bez prava. Redovi rečnika (in_glossary = yes) ostaju besplatni i vode na stranicu lika. Lik sa published = ne ima samo „Coming to the Club · Tell me when ready“; paket ide u prodaju tek kad su svi njegovi likovi gotovi. Podaci dolaze **isključivo iz CSV-a** (`lbc-likovi.csv`), ništa se ne prepisuje iz dokumenata.

### Faze 1–3: napravljeno (podaci, /crew, stranica lika)

| Deo | Gde | Šta radi |
|---|---|---|
| Pravila | `lib/character-rules.ts` | tipovi (`Character`, `PublicCharacter`, `Viewer`), `canRead` (free, ili Club, ili paket lika; nikad pre `published`), `publicOf` (skida zaključani tekst), `packsOf` (paket je `onSale` samo kad su svi likovi gotovi), `validate` (pravila iz brifa), `PACK_PRICE = 7`, `PACK_CHECKOUT_OPEN = false`, `CLUB_OPEN = false` |
| Podaci | `content/characters.json` (+ `lib/characters.ts`, samo server) | 26 ugrađenih iz `lib/learn.ts` (uvek free) + redovi iz CSV-a; red sa istim slug-om zamenjuje ugrađeni. Dok CSV ne stigne fajl je `[]`, pa sajt i dalje pokazuje 26. |
| Uvoz | `node scripts/import-characters.mjs <lbc-likovi.csv> [--dry]` | čita CSV (engleska ili srpska zaglavlja, vidi `ALIASES`; da/ne, yes/no, 1/0, x), proverava pravila, piše JSON i kopira SVG lika iz `../characters/svg/<id>.svg` u `public/crew-art/`. Prijavljuje: brojeve, pakete, probne, kolone koje nisu prepoznate, likove bez crteža. Ne piše dok ima grešaka. |
| Ko čita | `lib/viewer.ts` | Supabase sesija → `has_club_access()`; paketi prazni do faze 4 (tabela prava). Jedan upit po zahtevu (React `cache`). Greška = nema pristupa, nikad greška stranice. |
| `/crew` | `app/(learn)/crew/page.tsx`, `components/learn/CrewCard.tsx`, `CrewFilters.tsx` | slobodna ekipa po vrstama pa blok po paketu („x od y gotovo“ ili „$7, zauvek, ili u Club-u“); kartice su javne (senka za zaključane, oznake Free sample / Club · paket / Coming); filteri su u hash-u URL-a (`/crew#free`, `/crew#pack-puberty-pack`) i samo sakrivaju kartice. |
| Stranica lika | `app/(learn)/crew/[slug]/page.tsx`, `components/learn/CharacterPage.tsx` | statično: mrvice, kicker (paket · stvarno ime), ime, rečenica, figura, kratak odgovor, pedijatar, bezbednost, „Read more“ (dubinski članak za 26), „More in the pack“. Zaključani deo je **samo u `<Suspense>`** iza provere čitaoca: bez prava se vidi `LockBox` (Club + paket, ili „Tell me when it’s ready“ dok paket nije gotov); sa pravom se streamuje pun sadržaj (objašnjenje, What to say, štampa, crtani) i figura u boji. Neobjavljen lik: samo kartica + „Coming to the Club“ forma, `noindex`. |
| Rečnik, sitemap, llms.txt | `app/(learn)/glossary/page.tsx`, `app/sitemap.ts`, `app/llms.txt/route.ts` | red rečnika čiji `char` postoji u CSV-u sa in_glossary = yes dobija „Meet X →“; objavljeni likovi su u sitemap-u. |
| Forma | `components/learn/TellMeForm.tsx`, `lib/analytics.ts` | `character-waitlist` (bez potvrdnog mejla) sa `details.character` i `details.pack`; vidi se u admin panelu kao i ostale forme. |
| Stil | `design/assets/additions.css` (`npm run sync` → `public/`) | `.crew-filters`, `.lock-tag`, `.lock-box`, senka (`.crew-face.is-silhouette`), `.tell-form` |
| Testovi | `tests/characters.test.ts` | pravila pristupa, javna projekcija bez zaključanog teksta, paketi, validacija, CSV parser sa srpskim zaglavljima |

Očekivane kolone CSV-a (bilo koji od naziva, velika/mala slova i dijakritici nebitni): `slug`/`id`, `name`/`ime`, `real`/`naučni naziv`, `group`/`grupa`, `pack`/`paket`, `access`/`pristup` (free/locked, slobodno/zaključano), `sample`/`probni`, `in_glossary`/`u rečniku`, `published`/`objavljen`, `sentence`/`rečenica`/`kartica`, `short_answer`/`kratak odgovor`, `when_to_talk`/`pedijatar`, `safety`/`bezbednost`, `explanation`/`objašnjenje`, `what_to_say`/`šta reći`, `print`/`štampa`, `cartoon`/`crtani`, `color`/`boja`, `art`/`svg`. Nepoznate kolone skripta prijavi; ako je u CSV-u drugačiji naziv, dodati ga u `ALIASES`.

### CSV uvezen (3. 11. 2026, uveče)

`lbc-likovi.csv` (Luka, Downloads) ima kolone `num, id, name, science_name, group, access, pack, wave, age_flag, has_page_now, teaser_en`: **214 likova, 55 free (F1–F55), 159 locked (1–159), 11 paketa** (Puberty 7, Sleep 18, Brain City 13, Fuel & Body 26, Calm 10, Senses & Moves 11, Deep Science 12, Growing Up 14, Family & Feelings 15, Habit Helpers 24, Screen Villains 9). Razlike od brifa: 55 slobodnih umesto 38, probni likovi nisu označeni (kolone `sample` nema; paket bez probnog je upozorenje, ne greška), Vejpi je zaključan (Screen Villains). `has_page_now` = `published`: 26 objavljenih (postojeći, tekst stranice ostaje sa sajta), 188 „coming“ (29 slobodnih + 159 zaključanih). `wave` (★ ○ ·) ređa likove u paketu, `age_flag` (10+, 13+) daje bedž. `in_glossary` nema u CSV-u: izvodi se iz `content/learn/glossary.ts` po imenu (55 pogodaka). Crteži: 129 SVG-ova kopirano iz `../characters/svg` + 26 ugrađenih; **59 zaključanih nema crtež** (spisak ispisuje skripta; svi su „coming“, pa je to posao za dizajn pre objave tih paketa).

Dokument plana (`claude.ai/artifact/8xDWq9GHDCBk9ULUo3H6VP`) i dalje nije podeljen sa nalogom petar100games@gmail.com, pa spisak za proveru pre puštanja nije pročitan.

### Isporuka: novi PDF-ovi (3. 11. 2026)

Luka je poslao lepše verzije četiri postojeća fajla; stari su u `products/delivery/_archive-2026-11-03-old-bonuses/`: `Kid-Brain-Toolkit/Bonuses/24-Script-Cards.pdf` (6 str.), `The-60-Second-Meltdown-Plan.pdf` (2), `Crew-Poster.pdf` (1), `Crew-Habit-Cards/30-Crew-Habit-Cards.pdf` (10 str., bilo 8). `v2/Kid-Brain-Toolkit.zip` je ponovo napravljen sa novim bonusima (v1 zip netaknut). Novi fajl `products/delivery/Fuel-and-Body-Pack/Supplements-The-Kid-Version.pdf` (45 str., „Science Edition“, 20 suplementa kao hrana/igra/san) je sadržaj za Fuel & Body Pack (faza 5); nije u `delivery-files.json` dok paket ne krene u prodaju. Upload u privatni bucket: `node scripts/upload-delivery.mjs --yes`.

### Puberty paket: tekst napisan (3. 11. 2026, kasno uveče)

Sedam fajlova `content/characters/{estra,progi,ciklo,pepi,rela,elfi,gona}.json` (dva sonnet pisca po `BRIEF.md`, pregled i provera brojki na izvorima: NICHD, NHS, AAP/HealthyChildren, MedlinePlus, HHS OWH, Nemours, Cleveland Clinic; za kisspeptin dva rada u JCI Insight i Endocrine Journal jer strane za roditelje ne postoje). Svaki ima kratak odgovor, „Say it to your kid“, pedijatra, (bezbednost: Estra, Progi, Ciklo, Pepi, Gona), objašnjenje 530–770 reči sa 4–5 podnaslova, 5–6 „What to say“ parova i izvore; `published: true`, pa je Puberty **7/7 spreman** („on sale“ po pravilu, ali `PACK_CHECKOUT_OPEN = false` dok ne postoji Creem proizvod). Bez štampe i crtanog (prave se posle). Kućno pravilo za pedijatra (sve nove strane): pre 8 kod devojčica ili 9 kod dečaka, ili ništa do 13 (devojčice) / 14 (dečaci), NHS kaže 15; **stare strane** (Teo, uzrasti 10–12 i 12–14) još kažu „ništa do 15“ i treba ih uskladiti. Luka (3. 11.): **Estra je besplatni probni lik** Puberty paketa (`access = free`, nova kolona `sample = yes` u `content/characters.csv`; cela strana javna). Otvoreno: da li ovih 7 ide uživo pre faza 4–6 (javni deo + LockBox sa listom čekanja).

### Plan za faze 4–6 (naplata), na postojećoj infrastrukturi

Šta već postoji: Supabase auth + `members` (okidač pravi red za svakog korisnika), `subscriptions` koje Creem webhook puni, `has_club_access()`, `orders` + token za preuzimanje, `POST /api/checkout` (server bira Creem proizvod), `POST /api/creem/webhook`, SES mejlovi, cancel flow UI na `/account/cancel`.

**Faza 4 — nalog preko mejla.** `/account/login`: samo email → Supabase magic link (`signInWithOtp`) → sesija (proxy.ts je već osvežava). Nova tabela `entitlements` (email, `kind` = `pack` | `club_gift`, `key` = slug paketa, `source` = Creem order/sub id, `granted_at`, `expires_at`), vezana za **email**, jer kupac često plati pre nego što ima nalog; RLS: red vidi onaj čiji je email. `lib/viewer.ts` tada čita: Club = `has_club_access()` ili neistekli `club_gift`; paketi = `entitlements` za email. `/account` pokazuje pravo stanje: plan, sledeća naplata, paketi, „Pause“ i „Cancel“ koji zovu Creem API (`POST /v1/subscriptions/{id}/pause` i `/cancel`), dva klika na našem sajtu.

**Faza 5 — proizvodi i prava iz webhook-a.** U Creem-u (test pa live) po jedan jednokratni proizvod po paketu ($7) → ID-jevi u `lib/creem-products.json` kao `pack:<slug>`; Club mesečni/godišnji već postoje (arhivirani: vratiti kad Club krene). Webhook `checkout.completed` za paket → `recordPaidOrder` (red u `orders`, račun mejlom) + red u `entitlements`. Kupovina Reseta → webhook dodaje `pack:habit-helpers` i `club_gift` na 30 dana (Creem ne ume poklon, pa je to naše). Fuel & Body Pack dobija i PDF-ove (Supplements: The Kid Version, Crew Fuel Stack, No-Pill Shelf) kroz `delivery-files.json` sekciju za taj paket; kupci paketa i članovi ih vide na strani za preuzimanje. Paket ide u prodaju kad su svi likovi `published` **i** postoji Creem ID (`PACK_CHECKOUT_OPEN` postaje provera po paketu). Redosled: Puberty (7 likova), Fuel & Body (26), pa ostali.

**Faza 6 — ponude na sajtu.** Blok paketa na `/crew` i `LockBox` na stranici lika dobijaju dugme „Get the pack · $7“ (`/checkout/pack/<slug>`, isti tok kao Toolkit, sa Creem checkout-om); Club se otvara (`CLUB_OPEN = true`, uklanja se redirect `/checkout/club`, checkbox za obnovu već postoji), trial po proizvodu u Creem-u (predlog: plaćeni trial 30 dana po $1, jer kod za popust ne važi za trial uplatu), thank-you strana za paket vodi na `/crew#pack-<slug>` i `/account`. Uz Reset na checkout-u i thank-you strani piše šta je dobijeno na poklon (Habit Helpers + 30 dana Club-a).

### Kako stiže „puna lista“ (sadržaj za 188 likova koji su „coming“)

Svaki lik treba: kratak odgovor, „When to talk to your pediatrician“, (bezbednost gde ima smisla), „Say it to your kid“, izvori, a zaključani još objašnjenje, „What to say“, štampu i crtani. **Cevovod (od 3. 11. uveče):** CSV je u projektu (`content/characters.csv`, registar: ko, šta, paket, pristup), a tekst svakog lika je **jedan fajl po liku** `content/characters/<slug>.json` (polja `shortAnswer`, `kidVersion`, `whenToTalk`, `safety`, `sources`, `published` javno; `explanation`, `whatToSay`, `print`, `cartoon` zaključano). `node scripts/import-characters.mjs` ih spaja; polje iz fajla ima prednost nad kolonom CSV-a istog imena. Format i pravila za pisce: `content/characters/BRIEF.md`. „What to say“ se piše kao `Instead of: … | Say: … | Why: …` po pasusu (strana ga crta kao kartice); u objašnjenju pasus koji počinje sa `## ` je podnaslov; `sources` su ključevi iz `content/learn/sources.ts` ili pune reference sa URL-om. Isti ulaz radi i kroz kolone CSV-a. Pisanje po paketu (Puberty prvi): sonnet pisci iz baze znanja (`VibeLifeCode_Baza_znanja.docx`) i pravila struke (`research/`, memorija „science guardrails“), Lukin pregled, pa `published = yes`; validator (kao `check-learn`) odbija zabranjene tvrdnje. Crteži za 59 likova koji ih nemaju: `characters/design-specs.json` + `node characters/build.mjs --png` (vidi `characters/README.md`), pa ponovo `import-characters.mjs`. Probni lik po paketu (brif: po jedan): predlog je ★ lik svakog paketa sa `access = free`, `sample = yes` u CSV-u, Lukina odluka. Kupcu „puna lista“ stiže kao: stranice na sajtu iza prijave (Club = svih 214, paket = njegovi likovi), PDF paketa u bucket-u `delivery` i poster.

### Provera Creem-a (dokumentacija, 3. 11. 2026)

| Traženo | Creem | Napomena |
|---|---|---|
| Probni period | **Da.** Po proizvodu (samo pretplate): `trial_period_days` ≥ 1, besplatan ili plaćen (`trial_price` ≥ 1.00 i manji od redovne cene). Kartica se verifikuje i čuva. Webhook `subscription.trialing`. | docs.creem.io/features/trials |
| „$1 prvi mesec“ | **Da, na dva načina:** plaćeni trial 30 dana po $1 (pa $8), ili kod za popust `once` na prvu uplatu (npr. $7 off). Kod se **ne** primenjuje na trial uplatu, već na prvu posle triala. | features/trials, features/discounts |
| Pauza pretplate | **Da.** Dashboard, `POST /v1/subscriptions/{id}/pause`, zakazana pauza kroz cancel (`mode: scheduled`, `onExecute: pause`), webhook `subscription.paused`. Resume: u CLI-ju i dashboardu; API strana za resume nije nađena. | subscriptions/managing, api-reference |
| Otkazivanje u 2 klika | **Delimično.** Creem portal = 3 klika (izaberi pretplatu → Manage → Cancel, odmah). Za 2 klika na našem sajtu: naše dugme + `POST /v1/subscriptions/{id}/cancel` (`mode` immediate ili scheduled). Creem traži da otkaz postoji u proizvodu (API ili link na portal). | features/customer-portal, cancel-subscription |
| Dodela proizvoda bez plaćanja (poklon uz Reset) | **Ne postoji.** Nema „grant“/gift API-ja. Jedino 100 % `once` kod kroz checkout (Creem ga sam koristi za test kupovine), što za pretplatu znači sačuvanu karticu i naplatu od drugog meseca. **Zaključak:** pokloni (Habit Helpers Pack, 30 dana Club-a) su naša prava u Supabase, bez Creem-a; Fuel Stack / No-Pill Shelf PDF-ovi idu kroz naš sistem isporuke kupcima paketa i članovima. | features/discounts, merchant-of-record/account-reviews |

### Ranije runde (provereno 3. 11.)

- Naslov „Your kid didn’t come with a manual. Here’s the code.“ je vraćen **namerno** (Lukin commit 55ff89f, „Restore homepage copy“; odeljak 17 kaže da je naslov fiksan) — nije dirano.
- Reset **ne uključuje** Toolkit (odeljak 17: „Reset does not include the standalone Toolkit“), pa red „The Kid Brain Toolkit, included“ nije dodat.
- Meta i TikTok piksel sa `Purchase` (event id za deduplikaciju) i `InitiateCheckout` postoje od 55ff89f (`lib/ad-pixels.ts`, `components/AdPixels.tsx`); ID-jevi piksela idu u env (`README.md`, „Advertising purchase measurement“).

---

## 18. Personal plan $199 i crtaći van Toolkita (3. 11. 2026)

**Lukine odluke (3. 11.):** (1) „cartons“ = 4 crew crtaća (MP4) iz Toolkita: izbačeni. (2) „Personal plan“ postaje poseban proizvod od **$199**: roditelj prvo popunjava detaljan formular, pa ide pravo na Creem checkout. (3) Besplatnih „sedam večeri“ ostaje **samo za kupce Reseta**; Toolkit ih gubi i linkuje na plaćeni Personal plan.

**Crtaći.** Katalog v2 (`lib/delivery-files.json` `sections`) više nema sekciju „Crew cartoons“; v1 (`legacySections`) je nepromenjen (§17: v1 je nepromenljiv), MP4 objekti ostaju u bucketu za v1 kupce. Tekst skinut sa: index, pricing (i red u tabeli poređenja), dopa, `lib/funnel.ts`, `ToolkitCta`, `Quiz.tsx`, mejl „checkout reminder“. **Ručno (Luka):** novi `products/delivery/v2/Kid-Brain-Toolkit.zip` bez `Bonuses/Crew-Cartoons/`, pa `node scripts/upload-delivery.mjs` (dry) i `--yes`; proveriti opis Toolkit proizvoda u Creemu. Rizik: v2 kupci od 2. 11. kojima su crtaći obećani gube linkove (403); odgovoriti ručno ako se jave.

**Personal plan, tok:** `/personal-plan` (React strana u `app/(learn)/`, sa hederom sajta; `components/funnel/PersonalPlanForm.tsx`) → `POST /api/personal-plan` (validacija po `lib/personal-plan-form.ts PLAN_FIELDS`, red u `plan_requests` status `new`, Creem checkout sa `metadata.request_id` + `delivery` token, red → `checkout`) → Creem → webhook `checkout.completed` sa `order: "personal-plan"` → `lib/personal-plan.ts recordPlanPurchase`: red u `orders` (bez fajlova, `catalog_version 2`), `plan_requests.status = paid`, `purchase` događaj (mesto `personal-plan`, ulazi u $ po poseti), mejl roditelju (`plan-confirmation`) i mejl timu na `TEAM_NOTIFY_EMAIL` ili hello@ (`plan-team`, sa svim odgovorima) → `/personal-plan/thanks` (noindex). Admin: tab **Personal plans** (`/admin/personal-plans`): brojači, poslednjih 100 zahteva, odgovori na klik, dugmad „Mark plan sent“ / „Close“, checkout link za neplaćene. Formular koji nije plaćen briše `prune_old_data()` posle 30 dana. Ne pitamo ime deteta ni zdravstvene podatke.

**Zaštite:** `/api/checkout` vraća 403 za `personal-plan` (samo kroz formular); nema `PRODUCTS` sluga pa `/checkout/personal-plan` ne postoji; rate limit `planRequest` 5/h po IP; dok je Creem id prazan ruta vraća 503 i ništa ne čuva; `DiscountForm` ne štiklira Personal plan po defaultu (CREW100 ga ne pokriva). Rok „3 radna dana“ je jedna konstanta: `PLAN_REPLY_DAYS` u `lib/personal-plan-form.ts`.

**Šta mora Luka:** (1) Supabase: primeniti `supabase/migrations/20261103120000_plan_requests.sql`, pa lokalno `npm run db:types` i commit tipova (do tada `looseAdmin()`). (2) Creem: jednokratni proizvod „The Personal plan“ $199 (live; test ako postoji sandbox ključ), id-jevi u `lib/creem-products.json` → `personal-plan`. (3) ~~Novi v2 Toolkit zip + upload~~ — urađeno 3. 11. 2026 uveče: `v2/Kid-Brain-Toolkit.zip` (1,48 MB, bez `Crew-Cartoons/`) je u bucketu, MD5 isti kao lokalni fajl; stari zip u `~/.Trash/lbc-toolkit-zip-2026-11-03/`. (4) Odobriti izmene Terms (Digital products + „Personal help only with the Reset“) i Privacy (novi formular, brisanje posle 30 dana) u `content/learn/site-pages.ts`; deploy tek posle toga. (5) Posle deploya: `/personal-plan` → Creem pokazuje $199 (odustati) → red `checkout` u adminu; po želji pun test sa jednokratnim 100% kodom samo za Personal plan, pa obrisati kod. (6) Upisati Creem id-jeve i datum ovde.


## 19. Crew Club ukinut — 4. novembar 2026

Luka (4. 11. 2026): „obriši Crew Club“. Članarina ($8/mes, $80/god, do tada waitlista) je uklonjena sa sajta i iz koda; **ništa što prodajemo se ne obnavlja**. Likovi se otključavaju **samo paketom** ($7, zauvek). Afilijejt program (§11) je **ukinut** istog dana (Luka: „obriši i njega“): nema `/affiliate`, `/account/affiliate`, `AFFILIATE`/`commission` u `lib/funnel.ts`, odeljka u Terms ni rečenice o referral cookie-ju u Privacy; stari linkovi preusmeravaju na `/` i `/account`. Ako je u Creem Affiliate Hub-u nešto bilo uključeno, Luka to gasi ručno.

**Uklonjeno:**
- Proizvodi i ponude: `ITEMS.clubMonthly/clubYearly`, `PRODUCTS.club`, `OFFERS.club`, polje `every` (ništa nije recurring) i `consent` na checkout-u i ponudama (`lib/funnel.ts`, `Checkout.tsx`, `OneTimeOffer.tsx`, `lib/payments.ts`, `/api/checkout`). Screen-Off Week posle da/ne ide na `/thank-you`.
- Sajt: waitlist red na početnoj (`.club-line`), sekcija `#club` na `/pricing` (tabela poređenja ostaje bez Club kolone, u sekciji `#compare`), korak „Keep it growing“ → „Make it yours“ (Personal plan), FAQ „Is it a subscription?“ → „Nothing renews“, link u footeru, forma `crew-club-waitlist` (stari redovi u `signups` ostaju; admin ih prikazuje sirovim imenom forme).
- Likovi: `Viewer = { packs }`, `canRead` bez Club-a, `CLUB_OPEN` obrisan, `lib/viewer.ts` više ne zove `has_club_access()`; LockBox nudi samo paket; oznaka „Club · paket“ → ime paketa; „Coming to the Club“ → „Coming to the <paket>“.
- Nalog: `/account` je preview kupovina (bez plana, pauze i otkaza); `/account/cancel` i `CancelFlow.tsx` obrisani (redirect na `/account`); admin tab „Crew Club“ (`/admin/members`) obrisan.
- Webhook: ne upisuje pretplate; `subscription.*` događaji i checkout sa pretplatom se loguju i ignorišu (test u `tests/webhook.test.ts`). Mejlovi `clubWelcome` i `renewalReminder` obrisani.
- Creem: `club-monthly` / `club-yearly` izbačeni iz `lib/creem-products.json` i `lib/creem.ts` (proizvodi u Creem-u su već arhivirani; id-jevi za istoriju: prod_1S0reIotNSNBB7rUZvMmi6, prod_62M16BhebPTkZHOFX9jd7C).
- Terms: odeljci „Crew Club membership“ i „Affiliate program“ obrisani; Privacy: „Accounts (planned)“ umesto Club naloga; oba `updated: 2026-11-04` (i dalje čekaju Lukin OK, kao i izmene od 3. 11.).

**Ostaje (namerno):** tabele `members`, `subscriptions`, `cancel_feedback`, enum `club_plan` i funkcija `has_club_access()` u bazi (migracije `20261026120000` i `20261026160000` su primenjene; brisanje je posebna migracija i Lukina odluka; `lib/supabase/database.types.ts` ih zato i dalje ima). `members` i dalje služi za naloge (faza 4). `scripts/import-characters.mjs` prihvata „club“ kao sinonim za `locked` u CSV-u. Stare veze `/checkout/club`, `/offer/club`, `/offer/club-lite`, `/account/cancel` preusmeravaju.

**Faze 4–6 (§18) bez Club-a:** faza 4 = nalog preko mejla + tabela `entitlements` samo sa `kind = pack`; faza 5 = Creem proizvod po paketu + webhook upisuje pravo; faza 6 = dugme „Get the pack · $7“. Poklon uz Reset (Habit Helpers pack) ostaje naše pravo u Supabase; „30 dana Club-a“ otpada. `PACK_CHECKOUT_OPEN` je jedini prekidač.

## 20. Prodajne strane `/toolkit`, `/reset`, `/pricing` i nova `/personal-plan` — 4. novembar 2026

Luka (4. 11.): „napravi high converting stranice za Toolkit i 30-day Reset i poboljšaj Personal plan“. Urađeno istog dana, po istraživanju iz `research/perplexity-nalazi-2026-10-30.md` (odeljci C, E, F, G: prigovori roditelja, „prikaži pravu stranu pre kupovine“, referenca-ili-sekvenca, navigacija umesto obima) i pravilima §2, §15, §16. Mera je i dalje novac po poseti.

**Nove strane (design/, `npm run sync`):**
- **`/toolkit`** (`design/toolkit.html`): hero sa trenutkom („The tablet goes off. The tears start. Tonight, you’ll have the words.“), $19 + dugme (A/B `buy-button`), decoder 12 trenutaka iz početne (isti `data-*` i isti modal, pa „Try tonight“ radi besplatno), **prave strane iz PDF-a** (str. 4, 19, 21), tri rečenice sa strana, value stack sa brojevima strana, „Toolkit or Reset?“, for/not for, FAQ na prigovore (još jedan PDF, vreme, šta kupujem, štampač, uzrast, pretplata, refund, nauka), zatvaranje, sticky dugme na telefonu. Product JSON-LD (`og:type` mora biti `website`: Next odbija `product`).
- **`/reset`** (`design/reset.html`): hero, **„A day looks like this“** (prava strana Dan 2 + šest delova dana), nedelja po nedelji (journey iz stare /pricing, tačni dani 1–7/8–14/15–21/22–30 + teen track str. 48–52), **„Your own before and after“** (scorecard Dan 0 / Dan 30, prave strane: tracker, Week 1 check-in str. 16, 60-second reset str. 59), value stack po sadržaju knjige od 61 strane (Dan 0 str. 6, dani str. 7–47, check-ins, mini reset str. 53, 6 štampanih str. 55–60, Science Edition 67 str.), $1.30/dan, sedam večeri, „Toolkit or Reset?“, for/not for, FAQ (propušten dan, 15 godina, štampač, treba li Toolkit, pretplata, refund), sticky dugme.
- **`/pricing`** je sada **pregled planova**: hero „Which one is for you?“, tri kartice (iste kao `/#plans`, preuzete iz `index.html` pri build-u skripte, ručno ih ne duplirati), linkovi „See inside the Toolkit / See the Reset / How the Personal plan works“, tabela poređenja, odeljak Personal plan, FAQ, zatvaranje na Toolkit. Detalji Reseta i Toolkita su se preselili na `/reset` i `/toolkit`.
- **Prave strane** su u `design/assets/samples/*.jpg` (render iz `products/delivery/v2/*.pdf` na 120 dpi, PyMuPDF; ako se PDF promeni, ponovo renderovati). Po §14 to je dokaz dok nema citata. Nije ceo proizvod, samo po 3–4 strane.
- Linkovi: početna (`#plans` → `plan-links`, decoder-foot → `/toolkit`, `/reset`), footer (Plans → `/pricing`, The Toolkit, The 30-Day Reset). CSS: `.pages`, `.day-look`, `.quotes`, `.two-way`, `.plan-links`, `.pp-example` u `additions.css`.

**`/personal-plan`** (`app/(learn)/personal-plan/page.tsx`): hero „One hard moment. One plan, written for your house.“ + trust red; **skraćeni primer plana** (7 godina, suze kad se tablet gasi: šta se dešava, večerašnji potez, reči za 7 godina, ova nedelja, ako ne radi; jasno obeležen kao primer, bez imena; po str. 19 Toolkita), kako radi (3 koraka), šta dobijaš (+ odgovor kad zapneš), for/not for (988 za samopovređivanje), FAQ (ko piše, zašto $199, trenutak nije na listi, dvoje dece, već imam Toolkit/Reset, pitanja posle, refund, nije terapija), pa formular bez izmena. Primer plana je moj tekst: Luka da pogleda da li obećava tačno ono što tim zaista piše.

**Nije rađeno / Luka:** copy A/B testovi za nove strane (`lib/experiments.ts` pokriva `buy-button` i na `/toolkit`), og slike po proizvodu (koristi se opšti `og.jpg`), ništa nije commitovano.

## 21. Jedan proizvod: Toolkit = sve; 214 likova iza katanca; Hormozi copy — 4. novembar 2026 (popodne)

Luka: „spojimo Toolkit sa 30-day Reset i sve prodajemo kao Toolkit“; likovi: „33% otključanih, 67% zaključanih: bez imena, siva silueta sa katancem, klik vodi na kupovinu Toolkita, a PDF stiže u istom mejlu“; copy na /toolkit i /personal-plan „kao Alex Hormozi“. Poslao je `The-Complete-Crew-Guide.pdf` (74 strane, svih 214 likova, po jedna kartica: šta radi, šta pomaže, šta kvari, šta reći detetu).

**Proizvod.** `ITEMS.guide` ($19) je sve: Toolkit 43 str. + 30-Day Reset 61 str. + fridge tracker + Science Edition 67 str. + **The Complete Crew Guide** 74 str. + 3 bonusa za štampu + sedam večeri lične pomoći (prebačena sa Reseta na Toolkit: `PersonalHelp`, checkout, thank-you, Terms). Reset (`program`), karte (`cards`) i upgrade ($20) se **ne prodaju**: nema `/checkout/program`, `/offer/upgrade`, `lib/upgrades.ts`, `/api/upgrade` (obrisani); stavke ostaju u `ITEMS` i Creem id-jevi u `RETIRED_PRODUCTS` (`lib/creem.ts`) da stare porudžbine, računi i zakasneli webhook i dalje rade. Posle Toolkita ide samo `/offer/bedtime` ($7) ako bump nije uzet. `plans` A/B test ugašen (njegov „b“ je bio Reset dugme). Redirekti: `/checkout/program` → `/checkout/guide`, `/reset` → `/toolkit`, `/offer/upgrade` → `/thank-you`.

**Cena: $19 ostaje** (nisam dirao Creem). Creem proizvod `guide` je $19, `guide+bedtime-kit` $26. Ako Luka hoće $39 za sve (Reset je bio $39): promeniti `ITEMS.guide.price`, cenu u Creem-u za oba proizvoda, i izbaciti rečenicu „Until today, the Toolkit was $19 and the Reset was $39“ sa `/toolkit` (sekcija 4). Creem proizvode `program`, `program+cards`, `upgrade` Luka arhivira.

**Isporuka (`lib/delivery-files.json`, verzija kataloga ostaje 2; baza dozvoljava samo 1 i 2).** Sekcije `guide`: Start here (Toolkit PDF) · The 30-day plan (Reset PDF + tracker) · The science and the whole crew (Science Edition + **`crew-guide-pdf`** = `v2/Complete-Crew-Guide/The-Complete-Crew-Guide.pdf`) · Bonuses to print · Get everything in one download (`toolkit-zip` sada pokazuje na novi `v2/Kid-Brain-Toolkit-Complete.zip`, 6,5 MB, sa 5 foldera). Posledica: **svaki v2 kupac Toolkita (od 2. 11.) preko starog linka iz računa dobija sve** (sekcije se računaju iz kataloga, ne iz porudžbine); v1 kupci (pre 2. 11.) ostaju na legacy sekcijama, FAQ na /toolkit kaže „email us“. Fajlovi u `products/delivery/v2/` (PDF kopiran iz Downloads, zip napravljen skriptom). Rezultat uploada u bucket `delivery` zabeležen je na kraju ovog odeljka.

**Likovi (`lib/character-rules.ts` `isUnlocked`).** Otključan = `access: free` **ili** `published` (56 + 6 = 62, 29%); zaključan = ostalih 152 (71%). Zaključani na `/crew`: siva silueta (`.is-silhouette`, 30% opacity; generički oblik za 59 bez crteža) sa katancem (`.lock-badge`, simbol `#i-lock`), **bez imena i rečenice u HTML-u**, link `/checkout/guide?utm_source=crew`; stranica `/crew/<slug>` za zaključane vraća 404 (nema u sitemap-u). Grupe su CSV grupe (9), u svakoj prvo otvoreni (★ pa ○ pa ·) pa `.locked-grid` silueta. Dva `.unlock-box` bloka (gore i dole) sa pravom stranom Crew Guide-a (`assets/samples/guide-p05.jpg`). Filteri All / Free / Locked. Paketi, `Viewer`, `canRead`, `lib/viewer.ts`, `PACKS` obrisani; CSV kolone `pack`/`sample` ostaju kao podaci. Faze 4–6 iz §18 više ne važe: nema prava u bazi, nema entitlements; sve je u PDF-u.

**Copy (Hormozi).** `/toolkit` (`design/toolkit.html`): hero sa ishodom + „bez“ (no yelling scripts, no bribes, no 300 pages), 9:30 p.m. problem → „It’s a code“, decoder, **stack od 10 stavki** sa „so that“ ishodom i brojem strana, **pravi anchor** ($19 + $39 ranije → $19), 63¢/dan, 4 prave strane (Toolkit 4 i 19, Reset Dan 2, Crew Guide str. 5) + 3 rečenice, „Tonight / This week / Day 30“, scorecard before/after, dva pravila (Plasti/Duo), Toolkit ili Personal plan, for/not for, FAQ (četiri knjige? zašto $19? već kupio?), zatvaranje, sticky. `/personal-plan`: „Stop guessing… we write the plan for your house“, „what you’re really buying“ (5 stavki sa ishodom), skraćeni primer plana, **„Why not just the $19 Toolkit?“** (pošten downsell), kako radi, for/not for, FAQ (zašto $199), formular. Pravila: bez obećanja o detetu, bez garancije, bez lažnih „vrednosti“, bez lažne oskudice; jedini anchor je stvarna ranija cena.

**Početna i /pricing:** dve kartice (`.plans.two`): Toolkit (best, „everything, one download“) i Personal plan; `/pricing` tabela Toolkit vs Personal plan; brojke 214/30/10/0; FAQ i decoder-foot bez Reseta; footer bez Reseta; `design/reset.html` obrisan (slike `reset-p*.jpg` se koriste na /toolkit). Kviz, mejlovi (kviz rezultat, challenge dan 5), podsetnici, `lib/article-boxes.ts`, Terms i Privacy bez Reseta kao proizvoda.

**Luka:** (1) odluka o ceni ($19 ili $39) i Creem; (2) arhivirati `program`, `program+cards`, `upgrade` u Creem-u; (3) pogledati primer plana na /personal-plan i FAQ „already bought“ (obećava slanje fajlova ranijim kupcima mejlom); (4) ništa nije commitovano.

**Status posle deploya (4. novembar 2026):** Upload u privatni bucket `delivery` uspeo za svih 22 fajla; `v2/Complete-Crew-Guide/The-Complete-Crew-Guide.pdf` = 2.988.010 B i `v2/Kid-Brain-Toolkit-Complete.zip` = 6.764.133 B (iste lokalne i bucket veličine, oba potpisana URL-a `HEAD 200`). Produkcija (`a90615c`, Vercel Ready): `/toolkit` 200 („Four books, one tracker, three printables“, `$19`); `/crew` 200 (152 zaključana bez vidljivog teksta i sa checkout linkom, 62 besplatna); `/crew/somi` 404, `/crew/dopa` 200; redirekti `/reset`→`/toolkit`, `/checkout/program`→`/checkout/guide`, `/offer/upgrade`→`/thank-you`, `/affiliate`→`/`, `/account/affiliate`→`/account`, `/account/cancel`→`/account`, `/checkout/club`→`/#plans`; `/personal-plan` 200 sa „Why not just the $19 Toolkit?“; `/`, `/pricing`, `/terms` bez „Crew Club“, „affiliate“ i `$39`; oba uzorka 200. Creem arhiviranje nije urađeno jer Luka dashboard nije bio dostupan u browseru; Luka treba da arhivira `prod_3mmyLBzga7NpdbgE3WZmzP` (The 30-Day Reset), `prod_6d142HGVXIBWDbZCmMRYBn` (Reset + cards) i `prod_PWUqmqrxx9yjrMRWFC6tI` (Upgrade).

