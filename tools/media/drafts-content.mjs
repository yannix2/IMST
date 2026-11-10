// Draft texts for maarifcms (wave 3, task E2), loaded as UNPUBLISHED drafts by seed-drafts.mjs.
// Staff complete them, the lawyer reviews the legal notices, a reviewer publishes. English and
// French are written; Arabic and Turkish wait for translation (status "draft": the site never
// shows a language that is not marked Ready). Items in [brackets] must be confirmed or filled.
// Nothing here states a fact the school has not confirmed.
//
// Rich text is written as blocks: ["h2", text] | ["p", text] | ["ul", [items]].

const EMAIL = "info@tn.maarifschools.org";

export const legal = {
  privacy: {
    en: {
      title: "Privacy notice",
      seo: "How International Maarif Schools of Tunisia handles the personal data sent through this website.",
      body: [
        ["p", "[Draft for lawyer review under Tunisian Organic Law 2004-63 on the protection of personal data. Remove this line once approved.]"],
        ["h2", "Who is responsible"],
        ["p", `International Maarif Schools of Tunisia [legal name and registration number of the school to confirm], campuses in Le Kram and Charguia 2, Tunis. Contact for any question about your data: ${EMAIL}.`],
        ["h2", "What we collect and why"],
        ["ul", [
          "Visit requests: parent's name, phone, email if given, the grade and the preferred day and time, to organise your visit.",
          "Pre-registration: the child's name, the parent's name, the grade, phone, email if given, city or area and your message, to process the admission request.",
          "Messages, suggestions and concerns: your name, phone or email, the topic, your message and, if you give it, your child's level, to answer you.",
          "Job applications: your name, email, phone, the position, your message and your CV (PDF), to consider you for a position.",
          "Visits to the website: only if you accept cookies, Google Analytics measures visits (pages viewed, type of device, approximate area) with shortened IP addresses.",
          "Newsletter: your email address and language, the date you gave your consent and the date you confirmed it, to send you the newsletter. Only people who sign up and confirm by clicking the link in our email receive it; every newsletter has a link to unsubscribe in one click.",
          "Emails we send you: when you send a form with your email address, an automatic confirmation with your reference; when the admissions office confirms a visit, an email with the day, time and campus. They come from noreply@[school domain] and answers go to contact@[school domain].",
          "Security: Cloudflare Turnstile checks that a form is sent by a person, and our hosting keeps short technical logs to protect the site.",
        ]],
        ["h2", "On what basis"],
        ["p", "Your consent, given with the box on each form, and the school's interest in answering the requests families and candidates send. [Lawyer to confirm the legal basis and any declaration to the INPDP.]"],
        ["h2", "Who can see your data"],
        ["p", "Only authorised school staff: the admissions office and the administration for requests and messages, and the school's administrators alone for job applications and CVs. Your data is never sold or used for advertising. Our technical providers process it only on our instructions: Cloudflare, Inc. (hosting, storage, security, sending our emails) and, only with your consent, Google (visit statistics)."],
        ["h2", "Where it is stored"],
        ["p", "On Cloudflare's servers, which may be located outside Tunisia. [Lawyer to confirm whether an authorisation from the INPDP is needed for storage abroad.]"],
        ["h2", "How long we keep it"],
        ["ul", [
          "Visit requests, pre-registrations and messages: 24 months, then deleted automatically.",
          "Job applications and CVs: 6 months, then deleted automatically.",
          "Newsletter: as long as you stay subscribed. A sign-up not confirmed within 30 days is deleted. After you unsubscribe, the school keeps only your address marked \"unsubscribed\", so that it never writes to you again; ask us to delete it completely.",
          "Copies of the website's content kept for safety: 30 days.",
        ]],
        ["h2", "Your rights"],
        ["p", `You can ask to see the data the school holds about you, to correct it, or to object to its use, by writing to ${EMAIL}. We answer within [one month, to confirm]. You can also contact the Instance Nationale de Protection des Données Personnelles (INPDP) [address and website to confirm].`],
        ["h2", "Children"],
        ["p", "The forms are for parents and guardians. Photos of pupils on this website show no recognisable child unless the school holds written permission from the parents."],
      ],
    },
    fr: {
      title: "Politique de confidentialité",
      seo: "Comment les Écoles internationales Maarif de Tunisie traitent les données personnelles envoyées par ce site.",
      body: [
        ["p", "[Projet à faire relire par un juriste selon la loi organique tunisienne 2004-63 relative à la protection des données à caractère personnel. Supprimer cette ligne après validation.]"],
        ["h2", "Responsable du traitement"],
        ["p", `Écoles internationales Maarif de Tunisie [raison sociale et numéro d’immatriculation à confirmer], campus du Kram et de Charguia 2, Tunis. Contact pour toute question sur vos données : ${EMAIL}.`],
        ["h2", "Ce que nous collectons et pourquoi"],
        ["ul", [
          "Demandes de visite : nom du parent, téléphone, e-mail s’il est donné, la classe, le jour et le créneau souhaités, pour organiser votre visite.",
          "Préinscription : nom de l’enfant, nom du parent, classe, téléphone, e-mail s’il est donné, ville ou quartier et votre message, pour traiter la demande d’admission.",
          "Messages, suggestions et réclamations : votre nom, téléphone ou e-mail, le sujet, votre message et, si vous l’indiquez, le niveau de votre enfant, pour vous répondre.",
          "Candidatures : nom, e-mail, téléphone, poste, message et CV (PDF), pour étudier votre candidature.",
          "Visites du site : seulement si vous acceptez les cookies, Google Analytics mesure les visites (pages vues, type d’appareil, zone approximative) avec des adresses IP raccourcies.",
          "Lettre d’information : votre adresse e-mail et votre langue, la date de votre consentement et celle de votre confirmation, pour vous envoyer la lettre. Seules les personnes qui s’inscrivent et confirment en cliquant sur le lien de notre e-mail la reçoivent ; chaque lettre contient un lien de désinscription en un clic.",
          "E-mails que nous vous envoyons : quand vous envoyez un formulaire avec votre adresse e-mail, une confirmation automatique avec votre référence ; quand le service des admissions confirme une visite, un e-mail avec le jour, l’heure et le campus. Ils viennent de noreply@[domaine de l’école] et les réponses arrivent à contact@[domaine de l’école].",
          "Sécurité : Cloudflare Turnstile vérifie qu’un formulaire est envoyé par une personne, et notre hébergeur conserve de courts journaux techniques pour protéger le site.",
        ]],
        ["h2", "Sur quelle base"],
        ["p", "Votre consentement, donné avec la case de chaque formulaire, et l’intérêt de l’école à répondre aux demandes des familles et des candidats. [Le juriste confirme la base légale et toute déclaration à l’INPDP.]"],
        ["h2", "Qui voit vos données"],
        ["p", "Uniquement le personnel autorisé de l’école : le service des admissions et la direction pour les demandes et messages, et les seuls administrateurs de l’école pour les candidatures et CV. Vos données ne sont jamais vendues ni utilisées pour de la publicité. Nos prestataires techniques ne les traitent que sur nos instructions : Cloudflare, Inc. (hébergement, stockage, sécurité, envoi de nos e-mails) et, seulement avec votre accord, Google (statistiques de visite)."],
        ["h2", "Où elles sont stockées"],
        ["p", "Sur les serveurs de Cloudflare, qui peuvent se trouver hors de Tunisie. [Le juriste confirme si une autorisation de l’INPDP est nécessaire pour un stockage à l’étranger.]"],
        ["h2", "Durée de conservation"],
        ["ul", [
          "Demandes de visite, préinscriptions et messages : 24 mois, puis suppression automatique.",
          "Candidatures et CV : 6 mois, puis suppression automatique.",
          "Lettre d’information : tant que vous restez inscrit. Une inscription non confirmée sous 30 jours est supprimée. Après une désinscription, l’école garde seulement votre adresse marquée « désinscrite », pour ne plus jamais vous écrire ; demandez-nous de la supprimer complètement.",
          "Copies de sécurité du contenu du site : 30 jours.",
        ]],
        ["h2", "Vos droits"],
        ["p", `Vous pouvez demander à consulter les données que l’école détient sur vous, à les corriger ou à vous opposer à leur utilisation en écrivant à ${EMAIL}. Nous répondons sous [un mois, à confirmer]. Vous pouvez aussi saisir l’Instance Nationale de Protection des Données Personnelles (INPDP) [adresse et site à confirmer].`],
        ["h2", "Enfants"],
        ["p", "Les formulaires s’adressent aux parents et tuteurs. Les photos d’élèves de ce site ne montrent aucun enfant reconnaissable, sauf autorisation écrite des parents."],
      ],
    },
  },
  cookies: {
    en: {
      title: "Cookie notice",
      seo: "Which cookies this website uses and how to change your choice.",
      body: [
        ["p", "[Draft for lawyer review. Remove this line once approved.]"],
        ["h2", "Cookies that are always used"],
        ["ul", [
          "maarif-locale: remembers the language you read the site in, so the home address opens in that language. Kept for one year.",
          "Your cookie choice itself is kept in your browser's storage (not a cookie) so the site does not ask again.",
          "Cloudflare Turnstile, on the forms only: checks that a person is sending the form; it may set a short-lived security cookie. [To confirm.]",
        ]],
        ["h2", "Cookies used only if you accept"],
        ["ul", ["Google Analytics (_ga and _ga_ followed by an identifier): counts visits and pages viewed so the school can improve the site. Kept for up to [2 years, to confirm in Google Analytics settings]. Nothing is sent to Google if you refuse."]],
        ["h2", "Changing your choice"],
        ["p", "Use \"Cookie settings\" at the bottom of every page, or delete this site's cookies in your browser."],
        ["h2", "Emails"],
        ["p", "The school's emails (form confirmations, the newsletter) contain no tracking image and no tracking links."],
        ["h2", "Staff only"],
        ["p", "The school's content management site (maarifcms) uses a login cookie for staff accounts. Visitors never receive it."],
      ],
    },
    fr: {
      title: "Politique de cookies",
      seo: "Les cookies utilisés par ce site et comment modifier votre choix.",
      body: [
        ["p", "[Projet à faire relire par un juriste. Supprimer cette ligne après validation.]"],
        ["h2", "Cookies toujours utilisés"],
        ["ul", [
          "maarif-locale : retient la langue dans laquelle vous lisez le site, pour que l’adresse d’accueil s’ouvre dans cette langue. Conservé un an.",
          "Votre choix concernant les cookies est lui-même conservé dans le stockage de votre navigateur (pas un cookie), pour ne pas vous le redemander.",
          "Cloudflare Turnstile, sur les formulaires uniquement : vérifie qu’une personne envoie le formulaire ; il peut déposer un cookie de sécurité de courte durée. [À confirmer.]",
        ]],
        ["h2", "Cookies utilisés seulement si vous acceptez"],
        ["ul", ["Google Analytics (_ga et _ga_ suivi d’un identifiant) : compte les visites et les pages vues pour améliorer le site. Conservés jusqu’à [2 ans, à confirmer dans les réglages de Google Analytics]. Rien n’est envoyé à Google si vous refusez."]],
        ["h2", "Modifier votre choix"],
        ["p", "Utilisez « Réglages des cookies » en bas de chaque page, ou supprimez les cookies de ce site dans votre navigateur."],
        ["h2", "E-mails"],
        ["p", "Les e-mails de l’école (confirmations de formulaires, lettre d’information) ne contiennent ni image de suivi ni liens de suivi."],
        ["h2", "Personnel uniquement"],
        ["p", "Le site de gestion des contenus de l’école (maarifcms) utilise un cookie de connexion pour les comptes du personnel. Les visiteurs ne le reçoivent jamais."],
      ],
    },
  },
  terms: {
    en: {
      title: "Terms of use",
      seo: "The rules for using the website of International Maarif Schools of Tunisia.",
      body: [
        ["p", "[Draft for lawyer review. Remove this line once approved.]"],
        ["h2", "About this website"],
        ["p", `This website is published by International Maarif Schools of Tunisia [legal name and registration number to confirm]. Contact: ${EMAIL}.`],
        ["h2", "Information on the site"],
        ["p", "The school keeps the information on this site up to date, but it is given for information only. Admissions, places, dates and any fees are confirmed by the admissions office."],
        ["h2", "Texts, photos and logos"],
        ["p", "Texts and photos belong to the school or are used with permission. The Türkiye Maarif Foundation and Cambridge names and logos belong to their owners. Please ask the school before reusing any content."],
        ["h2", "Using the forms"],
        ["p", "Please send true information and only about yourself or a child in your care. Messages that are abusive or automated may be deleted."],
        ["h2", "Links"],
        ["p", "Links to other websites are given for convenience; the school is not responsible for their content."],
        ["h2", "Law"],
        ["p", "These terms are governed by Tunisian law. [Competent courts to confirm.]"],
      ],
    },
    fr: {
      title: "Conditions d’utilisation",
      seo: "Les règles d’utilisation du site des Écoles internationales Maarif de Tunisie.",
      body: [
        ["p", "[Projet à faire relire par un juriste. Supprimer cette ligne après validation.]"],
        ["h2", "À propos de ce site"],
        ["p", `Ce site est édité par les Écoles internationales Maarif de Tunisie [raison sociale et numéro d’immatriculation à confirmer]. Contact : ${EMAIL}.`],
        ["h2", "Informations du site"],
        ["p", "L’école tient les informations de ce site à jour, mais elles sont données à titre indicatif. Les admissions, places, dates et frais éventuels sont confirmés par le service des admissions."],
        ["h2", "Textes, photos et logos"],
        ["p", "Les textes et photos appartiennent à l’école ou sont utilisés avec autorisation. Les noms et logos de la Fondation Maarif de Türkiye et de Cambridge appartiennent à leurs propriétaires. Merci de demander l’accord de l’école avant toute réutilisation."],
        ["h2", "Utilisation des formulaires"],
        ["p", "Merci d’envoyer des informations exactes, vous concernant ou concernant un enfant dont vous avez la charge. Les messages abusifs ou automatiques peuvent être supprimés."],
        ["h2", "Liens"],
        ["p", "Les liens vers d’autres sites sont donnés pour votre commodité ; l’école n’est pas responsable de leur contenu."],
        ["h2", "Droit applicable"],
        ["p", "Ces conditions sont régies par le droit tunisien. [Tribunaux compétents à confirmer.]"],
      ],
    },
  },
};

// Clubs mentioned in the school's own posts (archery club 2025, robotics, Math Olympiads, pupil
// elections). Days, times, levels and campuses are left for the activities coordinator.
export const clubs = [
  {
    order: 10,
    en: { name: "Archery", summary: "Traditional archery with the Ethnosports programme, in the school sports hall. [Levels, day and time to confirm.]" },
    fr: { name: "Tir à l’arc", summary: "Tir à l’arc traditionnel avec le programme Ethnosports, dans la salle de sport de l’école. [Niveaux, jour et horaire à confirmer.]" },
  },
  {
    order: 20,
    en: { name: "Robotics", summary: "Pupils design, build and program robots, and prepare for robotics competitions. [Levels, day and time to confirm.]" },
    fr: { name: "Robotique", summary: "Les élèves conçoivent, construisent et programment des robots, et préparent des concours de robotique. [Niveaux, jour et horaire à confirmer.]" },
  },
  {
    order: 30,
    en: { name: "Mathematics Olympiad", summary: "Problem-solving sessions that prepare pupils for mathematics competitions. [Levels, day and time to confirm.]" },
    fr: { name: "Olympiades de mathématiques", summary: "Des séances de résolution de problèmes qui préparent les élèves aux concours de mathématiques. [Niveaux, jour et horaire à confirmer.]" },
  },
  {
    order: 40,
    en: { name: "Student council", summary: "Elected pupils represent their classmates, run campaigns and debates, and take part in school life. [Levels and how elections work to confirm.]" },
    fr: { name: "Conseil des élèves", summary: "Des élèves élus représentent leurs camarades, mènent des campagnes et des débats, et participent à la vie de l’école. [Niveaux et déroulement des élections à confirmer.]" },
  },
];

// The 14 destinations listed on the old website's Field Trips page (maarif_site_data.json).
// Descriptions say only what each place is; levels and dates are for the teachers to add.
const tripNote = { en: " [Levels and last visit to confirm.]", fr: " [Niveaux et dernière visite à confirmer.]" };
const tripList = [
  ["The GUAYA organisation", "L’organisation GUAYA", "", "", "A visit to the GUAYA organisation. [What pupils do there to confirm.]", "Une visite à l’organisation GUAYA. [Activité des élèves à confirmer.]"],
  ["Tunis Science City", "Cité des sciences de Tunis", "Tunis", "Tunis", "Science exhibitions, a planetarium and hands-on workshops.", "Expositions scientifiques, planétarium et ateliers pratiques."],
  ["Higher Institute of Aeronautics and Technologies", "Institut supérieur de l’aéronautique et des technologies", "", "", "A discovery visit of an aeronautics school and its workshops.", "Une visite découverte d’une école d’aéronautique et de ses ateliers."],
  ["Water Temple", "Temple des Eaux", "Zaghouan", "Zaghouan", "The Roman Water Temple at the source of the aqueduct that once supplied Carthage.", "Le temple romain des Eaux, à la source de l’aqueduc qui alimentait Carthage."],
  ["Carthage Land", "Carthage Land", "Tunis", "Tunis", "A day at an amusement park.", "Une journée dans un parc d’attractions."],
  ["The farm", "La ferme", "", "", "A visit to a farm to discover animals and how food is grown.", "Une visite à la ferme pour découvrir les animaux et l’origine des aliments."],
  ["Beach picnic", "Pique-nique à la plage", "", "", "A picnic and outdoor games at the beach.", "Un pique-nique et des jeux en plein air à la plage."],
  ["Salammbô museum", "Musée de Salammbô", "Salammbô, Carthage", "Salammbô, Carthage", "A museum visit in Salammbô. [Exact museum to confirm.]", "Une visite de musée à Salammbô. [Musée exact à confirmer.]"],
  ["3D Museum", "Musée 3D", "", "", "A visit to a museum of three-dimensional illusions. [Place to confirm.]", "Une visite d’un musée d’illusions en trois dimensions. [Lieu à confirmer.]"],
  ["Bardo National Museum", "Musée national du Bardo", "Tunis", "Tunis", "Tunisia's national museum, known for its Roman mosaics.", "Le musée national de Tunisie, connu pour ses mosaïques romaines."],
  ["Carthage", "Carthage", "Carthage", "Carthage", "The archaeological site of ancient Carthage.", "Le site archéologique de la Carthage antique."],
  ["Belvédère Park", "Parc du Belvédère", "Tunis", "Tunis", "Tunis's large park and its zoo.", "Le grand parc de Tunis et son zoo."],
  ["Friguia Park", "Parc Friguia", "Bouficha", "Bouficha", "An animal park with African wildlife.", "Un parc animalier consacré à la faune africaine."],
  ["Sidi Bou Said park", "Parc de Sidi Bou Saïd", "Sidi Bou Said", "Sidi Bou Saïd", "A walk in the park and the village of Sidi Bou Said.", "Une promenade dans le parc et le village de Sidi Bou Saïd."],
];
export const trips = tripList.map(([en, fr, placeEn, placeFr, sumEn, sumFr], i) => ({
  order: (i + 1) * 10,
  en: { destination: en, place: placeEn, summary: sumEn + (sumEn.includes("[") ? "" : tripNote.en) },
  fr: { destination: fr, place: placeFr, summary: sumFr + (sumFr.includes("[") ? "" : tripNote.fr) },
}));
