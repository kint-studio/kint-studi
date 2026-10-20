import { frenchTypography, type Lang } from "./i18n";
import type { Landing } from "./content";

/** I testi della landing in un'altra lingua. L'italiano resta in `content.ts`; qui ci sono inglese, francese e tedesco.
 *  Tono: "you" in inglese, "vous" in francese e "Sie" in tedesco (come si scrive a un cliente in Svizzera), con
 *  l'ortografia svizzera in tedesco (ss al posto di ß, «Reservation», «Abonnement» ecc.). */
type ServiceText = { title: string; tagline: string; text: string; points: string[] };
export type LandingText = {
  label: string;
  sector: string;
  exampleBusiness: string;
  title: { before: string; accent: string };
  subtitle: string;
  servicesHeading: { lead: string; accent: string };
  services: Record<string, ServiceText>;
  faq: { q: string; a: string }[];
  meta: { title: string; description: string };
};

type Translated = Record<Exclude<Lang, "it">, LandingText>;

const SUBTITLE = {
  en: "The services you need, delivered by professionals in the field.",
  fr: "Les services dont vous avez besoin, assurés par des professionnels du secteur.",
  de: "Die Leistungen, die Sie brauchen, von Fachleuten der Branche.",
};

const REVIEWS = {
  en: "Reviews: automatic requests and AI-assisted replies, checked by a person",
  fr: "Avis : demande automatique et réponses assistées par l'IA, relues par une personne",
  de: "Bewertungen: automatische Anfrage und KI-gestützte Antworten, von einer Person geprüft",
};
const AI_VISIBILITY = {
  en: "Visibility on ChatGPT and AI Overviews, monthly report",
  fr: "Visibilité sur ChatGPT et AI Overview, rapport mensuel",
  de: "Sichtbarkeit in ChatGPT und AI Overviews, Monatsbericht",
};
const TIME_Q = {
  en: "How long does it take to go online?",
  fr: "Combien de temps faut-il pour être en ligne ?",
  de: "Wie lange dauert es, bis ich online bin?",
};

export const TRANSLATIONS: Translated = {
  en: {
    label: "Professional firms",
    sector: "Professional firms",
    exampleBusiness: "Verdi & Partners",
    title: { before: "kint for your ", accent: "firm" },
    subtitle: SUBTITLE.en,
    servicesHeading: { lead: "Digital,", accent: "built for your firm." },
    services: {
      sito: {
        title: "Website",
        tagline: "Authoritative at first glance",
        text: "A sober, fast website designed for the phone, presenting the firm, the team and the areas of expertise and giving clients a reason to contact you.",
        points: [
          "Team and areas-of-expertise page",
          "Services and way of working explained clearly",
          "Contact or appointment request with a tap",
          "In Italian, German and English",
          "Privacy and cookies compliant with the Swiss Federal Act on Data Protection (FADP)",
        ],
      },
      social: {
        title: "Social media",
        tagline: "Expertise you can see",
        text: "LinkedIn and the other channels run by people who do this for a living: useful content that shows your expertise without taking up your time.",
        points: [
          "Setting up and looking after the firm's LinkedIn profile",
          "Content strategy and calendar, agreed with you",
          "One article a month written with AI and reviewed by a person",
          "You approve every piece of content before it is published",
        ],
      },
      google: {
        title: "Google and visibility",
        tagline: "They find you when it matters",
        text: "When someone searches for “lawyer near me” or “accountant near me”, you need to be there, with your listing, reviews and website in order.",
        points: [
          "Optimised Google Business Profile, with photos, opening hours and a contact button",
          REVIEWS.en,
          "Local SEO for people searching in your area, in German and English too",
          AI_VISIBILITY.en,
        ],
      },
      ai: {
        title: "AI and automation",
        tagline: "Repetitive work, on autopilot",
        text: "Chatbots, quotes and automatic workflows that answer clients and handle repetitive tasks, even outside office hours, so your time goes to client work.",
        points: [
          "Website chatbot that answers common questions and collects enquiries",
          "Draft quotes and replies prepared by AI and checked by a person",
          "Automatic workflows for reminders, deadlines and client communications",
          "A written policy on the use of data in AI tools, in line with the FADP",
        ],
      },
    },
    faq: [
      { q: "How much does it cost?", a: "Fixed prices, no surprises. On the call, after seeing your firm, we tell you what it costs and how long it takes, before you sign anything." },
      { q: "Do I have to take all the services?", a: "No. We start with what you need most, for example the website with Google visibility, and add the rest whenever you like." },
      { q: "How do you protect my clients' data?", a: "Hosting in Switzerland, privacy and cookies compliant with the FADP, and a written policy on the use of data in AI tools. For a professional firm it is also something you will want to explain to your clients." },
      { q: "Who writes the content?", a: "We prepare it with the help of AI, and a person reviews every text before it goes online. You tell us whether it represents you." },
      { q: TIME_Q.en, a: "About ten working days from the call. Most of the time goes into collecting photos and information about the team, which is why we only ask you for a ten-minute form." },
    ],
    meta: { title: "For professional firms", description: "Website, social media, Google visibility, AI and automation: the fixed-price digital partner for lawyers, consultants and accountants." },
  },
  fr: {
    label: "Cabinets professionnels",
    sector: "Cabinets professionnels",
    exampleBusiness: "Cabinet Verdi",
    title: { before: "kint pour votre ", accent: "cabinet" },
    subtitle: SUBTITLE.fr,
    servicesHeading: { lead: "Le numérique,", accent: "conçu pour votre cabinet." },
    services: {
      sito: {
        title: "Site web",
        tagline: "Crédible dès le premier regard",
        text: "Un site sobre et rapide, pensé pour le téléphone, qui présente le cabinet, l'équipe et les domaines de compétence et donne au client une raison de vous contacter.",
        points: [
          "Page de l'équipe et des domaines de compétence",
          "Services et manière de travailler expliqués clairement",
          "Contact ou demande de rendez-vous en un geste",
          "En italien, allemand et anglais",
          "Confidentialité et cookies conformes à la LPD",
        ],
      },
      social: {
        title: "Réseaux sociaux",
        tagline: "Une compétence qui se voit",
        text: "LinkedIn et les autres canaux gérés par des professionnels : des contenus utiles qui font valoir votre compétence sans vous prendre de temps.",
        points: [
          "Mise en place et suivi du profil LinkedIn du cabinet",
          "Stratégie et calendrier des contenus, définis avec vous",
          "Un article par mois rédigé avec l'IA et relu par une personne",
          "Vous approuvez chaque contenu avant sa publication",
        ],
      },
      google: {
        title: "Google et visibilité",
        tagline: "On vous trouve quand il le faut",
        text: "Quand quelqu'un cherche « avocat près de chez moi » ou « comptable près de chez moi », vous devez y être, avec une fiche, des avis et un site soignés.",
        points: [
          "Fiche Google Business Profile optimisée, avec photos, horaires et bouton de contact",
          REVIEWS.fr,
          "SEO local pour ceux qui cherchent dans la région, y compris en allemand et en anglais",
          AI_VISIBILITY.fr,
        ],
      },
      ai: {
        title: "IA et automatisations",
        tagline: "Le travail répétitif, en automatique",
        text: "Des chatbots, des devis et des flux automatiques qui répondent aux clients et prennent en charge les tâches répétitives, même en dehors des heures de bureau, pour que votre temps aille au travail avec vos clients.",
        points: [
          "Chatbot sur le site qui répond aux questions les plus fréquentes et recueille les demandes",
          "Brouillons de devis et de réponses préparés par l'IA et relus par une personne",
          "Flux automatiques pour les rappels, les échéances et les communications aux clients",
          "Politique écrite sur l'utilisation des données dans les outils d'IA, conforme à la LPD",
        ],
      },
    },
    faq: [
      { q: "Combien ça coûte ?", a: "Des prix fixes, sans surprise. Pendant l'appel, après avoir vu votre cabinet, nous vous disons combien cela coûte et en combien de temps c'est prêt, avant que vous ne signiez quoi que ce soit." },
      { q: "Dois-je prendre tous les services ?", a: "Non. On commence par ce dont vous avez le plus besoin, par exemple le site avec la visibilité sur Google, et on ajoute le reste quand vous le souhaitez." },
      { q: "Comment protégez-vous les données de mes clients ?", a: "Hébergement en Suisse, confidentialité et cookies conformes à la LPD, et une politique écrite sur l'utilisation des données dans les outils d'IA. Pour un cabinet professionnel, c'est aussi un sujet à expliquer aux clients." },
      { q: "Qui rédige les contenus ?", a: "Nous les préparons avec l'aide de l'IA, et chaque texte est relu par une personne avant d'être mis en ligne. Vous nous dites s'il vous représente." },
      { q: TIME_Q.fr, a: "Environ dix jours ouvrables à partir de l'appel. Le temps passe surtout à rassembler photos et informations sur l'équipe, c'est pourquoi nous ne vous demandons qu'un formulaire de dix minutes." },
    ],
    meta: { title: "Pour les cabinets professionnels", description: "Site web, réseaux sociaux, visibilité sur Google, IA et automatisations : le partenaire numérique à prix fixe des avocats, consultants et comptables." },
  },
  de: {
    label: "Kanzleien und Beratungen",
    sector: "Kanzleien und Beratungen",
    exampleBusiness: "Kanzlei Verdi",
    title: { before: "kint für ", accent: "Ihre Kanzlei" },
    subtitle: SUBTITLE.de,
    servicesHeading: { lead: "Das Digitale,", accent: "das Ihrer Kanzlei dient." },
    services: {
      sito: {
        title: "Website",
        tagline: "Überzeugend auf den ersten Blick",
        text: "Eine sachliche, schnelle, aufs Handy ausgerichtete Website, die die Kanzlei, das Team und die Fachgebiete vorstellt und Ihren Klientinnen und Klienten einen Grund gibt, Sie zu kontaktieren.",
        points: [
          "Seite zu Team und Fachgebieten",
          "Leistungen und Arbeitsweise klar erklärt",
          "Kontakt oder Terminanfrage mit einem Fingertipp",
          "Auf Italienisch, Deutsch und Englisch",
          "Datenschutz und Cookies gemäss DSG",
        ],
      },
      social: {
        title: "Social Media",
        tagline: "Kompetenz, die man sieht",
        text: "LinkedIn und die anderen Kanäle, betreut von Profis: nützliche Inhalte, die Ihre Kompetenz zeigen, ohne Ihnen Zeit zu rauben.",
        points: [
          "Einrichtung und Pflege des LinkedIn-Profils der Kanzlei",
          "Inhaltsstrategie und Kalender, mit Ihnen abgestimmt",
          "Ein Artikel pro Monat, mit KI geschrieben und von einer Person geprüft",
          "Jeden Inhalt geben Sie vor der Veröffentlichung frei",
        ],
      },
      google: {
        title: "Google und Sichtbarkeit",
        tagline: "Man findet Sie, wenn es darauf ankommt",
        text: "Wenn jemand «Anwalt in meiner Nähe» oder «Treuhänder in meiner Nähe» sucht, müssen Sie dabei sein, mit Eintrag, Bewertungen und Website in Ordnung.",
        points: [
          "Optimiertes Google Business Profile, mit Fotos, Öffnungszeiten und Kontakt-Button",
          REVIEWS.de,
          "Lokales SEO für alle, die in Ihrer Region suchen, auch auf Deutsch und Englisch",
          AI_VISIBILITY.de,
        ],
      },
      ai: {
        title: "KI und Automatisierung",
        tagline: "Routinearbeit läuft automatisch",
        text: "Chatbots, Offerten und automatische Abläufe, die Anfragen beantworten und wiederkehrende Aufgaben übernehmen, auch ausserhalb der Bürozeiten, damit Ihre Zeit der eigentlichen Arbeit gehört.",
        points: [
          "Chatbot auf der Website, der häufige Fragen beantwortet und Anfragen aufnimmt",
          "Offertentwürfe und Antworten, von der KI vorbereitet und von einer Person geprüft",
          "Automatische Abläufe für Erinnerungen, Fristen und Mitteilungen an Klientinnen und Klienten",
          "Schriftliche Richtlinie zur Verwendung von Daten in KI-Tools, im Einklang mit dem DSG",
        ],
      },
    },
    faq: [
      { q: "Was kostet das?", a: "Feste Preise, keine Überraschungen. Im Call sagen wir Ihnen, nachdem wir Ihre Kanzlei gesehen haben, was es kostet und wie lange es dauert, bevor Sie irgendetwas unterschreiben." },
      { q: "Muss ich alle Leistungen nehmen?", a: "Nein. Wir beginnen mit dem, was Sie am meisten brauchen, zum Beispiel der Website mit Sichtbarkeit auf Google, und ergänzen den Rest, wann Sie möchten." },
      { q: "Wie schützen Sie die Daten meiner Klientinnen und Klienten?", a: "Hosting in der Schweiz, Datenschutz und Cookies gemäss DSG und eine schriftliche Richtlinie zur Verwendung von Daten in KI-Tools. Für eine Kanzlei ist das auch ein Thema, das Sie Ihren Klientinnen und Klienten erklären können." },
      { q: "Wer schreibt die Inhalte?", a: "Wir bereiten sie mit Hilfe von KI vor, und jeder Text wird von einer Person geprüft, bevor er online geht. Sie sagen uns, ob er Sie repräsentiert." },
      { q: TIME_Q.de, a: "Etwa zehn Arbeitstage ab dem Call. Die Zeit geht meist für das Sammeln von Fotos und Informationen zum Team drauf, deshalb bitten wir Sie nur um ein Formular von zehn Minuten." },
    ],
    meta: { title: "Für Kanzleien und Beratungen", description: "Website, Social Media, Sichtbarkeit auf Google, KI und Automatisierung: der digitale Partner zum Fixpreis für Anwälte, Berater und Treuhänder." },
  },
};

/** I testi della landing nella lingua scelta (null per l'italiano, che sta gia' in `content.ts`). */
export function landingText(lang: Lang): LandingText | null {
  if (lang === "it") return null;
  const t = TRANSLATIONS[lang];
  return lang === "fr" ? frenchTypography(t) : t;
}

/** La stessa landing con i testi nella lingua scelta: struttura e ordine dei servizi restano quelli dell'originale. */
export function translateLanding(landing: Landing, lang: Lang): Landing {
  const t = landingText(lang);
  if (!t) return landing;
  return {
    ...landing,
    label: t.label,
    sector: t.sector,
    exampleBusiness: t.exampleBusiness,
    title: t.title,
    subtitle: t.subtitle,
    servicesHeading: t.servicesHeading,
    services: landing.services.map((s) => ({ ...s, ...(t.services[s.id] ?? {}) })),
    faq: t.faq,
    meta: t.meta,
  };
}
