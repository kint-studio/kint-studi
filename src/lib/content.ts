/** I dati della landing per gli studi professionali, in italiano. Le traduzioni stanno in `landing-i18n.ts`. */

export const SITE = {
  name: "kint",
  domain: "kint.ch",
  email: "info@kint.ch",
  city: "Lugano",
  since: 2020,
};

/** Un servizio della landing: titolo, motto, testo e punti dell'elenco. */
export type LandingService = {
  id: string;
  title: string;
  tagline: string;
  text: string;
  points: string[];
};

export type Landing = {
  /** nome del pubblico, per la versione testuale */
  label: string;
  /** settore gia' scelto nel modulo di contatto */
  sector: string;
  /** nome di esempio nel campo "Attivita'" del modulo */
  exampleBusiness: string;
  title: { before: string; accent: string };
  subtitle: string;
  /** titolo della sezione servizi: `lead` sbiadito, `accent` in oro */
  servicesHeading: { lead: string; accent: string };
  services: LandingService[];
  faq: { q: string; a: string }[];
  /** titolo e descrizione della pagina (metadata) */
  meta: { title: string; description: string };
};

const STUDI_SERVICES: LandingService[] = [
  {
    id: "sito",
    title: "Sito web",
    tagline: "Autorevole fin dal primo sguardo",
    text: "Un sito sobrio e veloce, pensato per il telefono, che presenta lo studio, il team e le aree di competenza e dà al cliente un motivo per contattarti.",
    points: [
      "Pagina del team e delle aree di competenza",
      "Servizi e modo di lavorare spiegati con chiarezza",
      "Contatto o richiesta di appuntamento con un tocco",
      "In italiano, tedesco e inglese",
      "Privacy e cookie conformi alla LPD",
    ],
  },
  {
    id: "social",
    title: "Social media",
    tagline: "Competenza che si vede",
    text: "LinkedIn e gli altri canali curati da chi lo fa di mestiere: contenuti utili che raccontano la tua competenza senza rubarti tempo.",
    points: [
      "Impostazione e cura del profilo LinkedIn dello studio",
      "Strategia e calendario dei contenuti, concordati con te",
      "Un articolo al mese scritto con l'AI e rivisto da una persona",
      "Ogni contenuto lo approvi tu prima della pubblicazione",
    ],
  },
  {
    id: "google",
    title: "Google e visibilità",
    tagline: "Ti trovano quando serve",
    text: "Quando qualcuno cerca «avvocato» o «commercialista vicino a me», devi esserci, con scheda, recensioni e sito in ordine.",
    points: [
      "Scheda Google Business Profile ottimizzata, con foto, orari e pulsante di contatto",
      "Recensioni: richiesta automatica e risposte assistite dall'AI, riviste da una persona",
      "SEO locale per chi cerca in zona, anche in tedesco e inglese",
      "Visibilità su ChatGPT e AI Overview, report mensile",
    ],
  },
  {
    id: "ai",
    title: "AI e automazioni",
    tagline: "Il lavoro ripetitivo, in automatico",
    text: "Chatbot, preventivi e flussi automatici che rispondono ai clienti e sbrigano le attività ripetitive, anche fuori orario, così il tuo tempo va alle pratiche.",
    points: [
      "Chatbot sul sito che risponde alle domande più frequenti e raccoglie le richieste",
      "Bozze di preventivi e risposte preparate dall'AI e riviste da una persona",
      "Flussi automatici per promemoria, scadenze e comunicazioni ai clienti",
      "Policy scritta sull'uso dei dati negli strumenti AI, in linea con la LPD",
    ],
  },
];

const STUDI_FAQ = [
  { q: "Quanto costa?", a: "Prezzi fissi, senza sorprese. In call, dopo aver visto il tuo studio, ti diciamo quanto costa e in quanto tempo è pronto, prima di firmare qualsiasi cosa." },
  { q: "Devo prendere tutti i servizi?", a: "No. Si parte da quello che ti serve di più, per esempio il sito con la visibilità su Google, e si aggiunge il resto quando vuoi." },
  { q: "Come tutelate i dati dei miei clienti?", a: "Hosting in Svizzera, privacy e cookie conformi alla LPD e una policy scritta sull'uso dei dati negli strumenti AI. Per uno studio professionale è anche un argomento da spiegare ai clienti." },
  { q: "Chi scrive i contenuti?", a: "Li prepariamo noi con l'aiuto dell'AI, e ogni testo lo rivede una persona prima di andare online. Tu ci dici se ti rappresenta." },
  { q: "Quanto tempo ci vuole per essere online?", a: "Circa dieci giorni lavorativi dalla call. Di solito il tempo se ne va per raccogliere foto e informazioni sul team, per questo ti chiediamo solo un modulo di dieci minuti." },
];

export const LANDING: Landing = {
  label: "Studi professionali",
  sector: "Studi professionali & consulenti",
  exampleBusiness: "Studio Verdi",
  title: { before: "kint per il ", accent: "tuo studio" },
  subtitle: "I servizi di cui hai bisogno offerti da professionisti nel settore.",
  servicesHeading: { lead: "Il digitale,", accent: "che serve al tuo studio." },
  services: STUDI_SERVICES,
  faq: STUDI_FAQ,
  meta: {
    title: "Per gli studi professionali",
    description: "Sito, social media, visibilità su Google, AI e automazioni: il partner digitale a prezzo fisso di avvocati, consulenti e commercialisti.",
  },
};
