# Little Brain Crew — funnel, ponude i churn

> **2026-10-26: brend je preimenovan iz VIBE LIFE CODE u Little Brain Crew**, a ebook „The Crew Code“ je sada **The Kid Brain Toolkit**. Stariji odeljci ispod još pominju stara imena; važeće stanje je u odeljku 10.

Ovaj dokument objašnjava **zašto** sajt izgleda i prodaje ovako. Copy na sajtu je na engleskom (tržište je US, cene u $), objašnjenja su na srpskom za tim.

Cene i tekst svih ponuda menjaš na jednom mestu: [`lib/funnel.ts`](lib/funnel.ts).

---

## 1. Naslov i početna strana

**Besplatni kviz je uklonjen** (odluka 2026-10-25). Početna strana sada direktno prodaje, a sve tri ponude stoje jedna pored druge: ebook $9, 30-Day Reset $39 i Crew Club $9/mes. Stari linkovi i reklame na `/quiz` vode na `/#plans`.

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

**Bez kviza više nema glavnog hvatanja emaila.** Ostale su samo forme na `/free` (lista „15 ways to end screen time“, stikeri, izazov). Ako reklame budu skupe, vredi ponovo dodati lead magnet.

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
- **Bez garancije** (odluka 2026-10-26). Pošto je proizvod digitalan i odmah dostupan, svuda jasno piše da je prodaja konačna („all sales are final“). Ako link ili fajl ne radi, popravljamo. Stripe i PayPal traže da politika refundacije bude vidljiva, pa je to u FAQ-u i na checkout-u.
- **Za koga jeste / nije** smanjuje pogrešne kupce i reklamacije.
- **Cena po danu** ($1.30) kao sidro, umesto izmišljenih „vrednost $X“ brojki.
- **Downsell na istoj stranici:** „Not ready for 30 days? Start with the $9 guide.“

---

## 3. Mapa funnela

```
Početna / pricing / Dopa članak
   ├─► The Crew Code $9 + bump Bedtime & Screen-Off Kit $7 ─► Upsell: upgrade na program $30 ──► Downsell: Screen-Off Week $12 ─► Crew Club $1/14 dana ─► Club Lite $4/mes ─► Thank you
   │                                                         (tvojih $9 se računa)              (7 dana sa Dopom, računa se       (pa $9/mes)          (manje, jeftinije)
   │                                                                                             u Reset kasnije)
   ├─► 30-Day Reset $39 + bump karte $7 ───────────────────────────────────────────► Crew Club $1 ─► Club Lite ─► Thank you
   └─► Crew Club mesečno $9 / godišnje $79 ──────────────────────────────────────────────────────────────────────► Thank you
/gift ──► ebook ili program kao poklon (bez upsella) ────────────────────────────────────────────────────────────► Thank you
footer ─► Support the crew ($3/$5/$10/$20/drugo) ────────────────────────────────────────────────────────────────► Thank you
```

| Stranica | Ruta |
|---|---|
| Checkout | `/checkout/guide`, `/checkout/program`, `/checkout/club?plan=monthly|yearly` (+ `?crew=dopa` za lično poglavlje, `?gift=1` sa poklona) |
| Upsell / downsell | `/offer/upgrade`, `/offer/screen-off-week`, `/offer/club`, `/offer/club-lite` |
| Kraj | `/thank-you` |
| Podrška | `/support` |
| Članstvo | `/account`, `/account/cancel` |

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
| **Godišnji plan** sa uštedom 27% ($79 umesto $108); na `/account` je ponuda „Save $29 a year“ | `/pricing`, checkout, `/account` |
| **Pauza umesto otkazivanja** (1, 2 ili 3 meseca, bez naplate) | `/account` → „Pause for a while“, i u cancel flow-u |
| **Cancel flow sa razlogom** → jedna ponuda koja odgovara razlogu | `/account/cancel` |
| · „Preskupo“ → pola cene 3 meseca ($4.50) | |
| · „Nemam vremena“ → pauza | |
| · „Dobili smo šta treba“ → prelazak na Lite ($4) | |
| · „Ne odgovara uzrastu“ → promena uzrasne grupe + mesec gratis | |
| · „Nešto ne radi“ → popravka + mesec gratis | |
| **Downgrade umesto odlaska** (Club Lite $4) | upsell funnel i cancel flow |
| **Win-back:** posle otkazivanja ostaje sačuvan napredak, dugme „Restart my membership“, jedno pitanje za feedback | kraj cancel flow-a |
| **Navika i napredak:** „This week“ crtać i streak na nalogu | `/account` |
| **Trial bez iznenađenja:** „we email you 3 days before the trial ends“ | ponuda za Club |

### Zakon i poverenje (obavezno)
- Dugme **„Cancel now“ je vidljivo na svakom koraku**; ponuda za spas nikad ne blokira otkazivanje. Zakoni o auto-obnavljanju (npr. Kalifornija) traže lako online otkazivanje.
- Pre svake obnove i pre kraja triala šalje se email.
- Na checkout-u za članstvo postoji **obavezan checkbox** da korisnik razume da se članstvo obnavlja.

### Uraditi kad se poveže Stripe (nije još urađeno)
1. **Dunning:** Stripe Smart Retries + emailovi za neuspelo plaćanje (dan 0, 3, 7) + link za promenu kartice. Ovo je obično najveći izvor „nevoljnog“ churna.
2. **Upozorenje pre isteka kartice** (Stripe to šalje automatski kad se uključi).
3. **Onboarding do prvog rezultata za 48 h:** email 1 „uradi ovo večeras“, email 2 „kako je prošlo?“.
4. **Zakazani sadržaj:** svake nedelje novi crtać, svakog meseca izazov, plus najava „sledeće nedelje stiže…“, da uvek postoji razlog da se ostane.
5. **Merenje:** churn po mesecu i po razlogu iz cancel flow-a; koja save ponuda najčešće uspeva.

---

## 5. Support the crew (umesto „Donate“)

VIBE LIFE CODE je firma, ne registrovana neprofitna organizacija, pa dugme **ne sme da se zove „Donate“**: PayPal Donate je samo za humanitarne organizacije, a reč „donacija“ ljudi shvataju kao poreski odbitak. Zato:
- Footer na svakoj stranici ima „♥ Support the crew“ → `/support`, a link postoji i na thank-you strani.
- Iznosi $3 / $5 / $10 / $20 / drugo, plaćanje karticom ili PayPal-om.
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
- **Crew Club ($9/mes) i Club Lite ($4/mes):** nedeljni crtać, mesečni izazov, priče za laku noć, privatna grupa. Ne naplaćivati dok sadržaj ne postoji.
- **Crew Habit Cards** (bump $7 uz program): 30 kartica.

## 7. Povezivanje plaćanja (sledeći korak)

Sve je u preview modu (`PREVIEW = true` u `lib/funnel.ts`): dugmad prolaze kroz funnel bez naplate, a žuta traka to piše na svakoj checkout strani. Za pravu naplatu treba zameniti `charge()` u [`lib/payments.ts`](lib/payments.ts):

- **Kartica:** Stripe Checkout Session (ili Payment Element) sa `setup_future_usage`, da upsell bude **one-click** (naplata sačuvane kartice bez ponovnog unosa).
- **PayPal:** PayPal JS SDK; za one-click upsell treba PayPal vault, inače se na svakoj ponudi ponovo potvrđuje.
- **Članstvo:** Stripe Subscriptions (trial 14 dana za $1, pauza = `pause_collection`, pola cene = kupon, otkaz = `cancel_at_period_end`).
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
| **The Crew Club, $9/mes ili $79/god** (zajednica) | novi lik svakog meseca (sa mape od 156), mesečna Q&A epizoda, privatna zajednica roditelja, vodiči po uzrastu, mesečni izazov i priče |

**Šta još fali:**
- **Sadržaj Toolkita: urađeno 2026-10-26.** `products/pdf/The Kid Brain Toolkit.pdf`, 34 strane: dva pravila (Plasti, Duo), 12 likova, 12 trenutaka (isti kao decoder na početnoj), 6 zlikovaca, 6 uzrasta i izvori (samo iz `products/content/_sources.md`, numerisani u tekstu). Stari „The Crew Code“ PDF je obrisan.
- **30-Day Reset po novim nedeljama** i sadržaj Crew Club-a.
- **Provera žiga** za „Little Brain Crew“ i za nadimke likova.
- **Pedijatar savetnik** za mesečnu proveru scenarija.
