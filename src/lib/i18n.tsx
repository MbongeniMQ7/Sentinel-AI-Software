import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang =
  | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ar' | 'hi' | 'ru' | 'ja'
  | 'af' | 'zu' | 'xh' | 'nso' | 'st' | 'tn' | 'ss' | 'nr' | 'ts' | 've'
  | 'it' | 'nl' | 'ko' | 'sw'

export const languages: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'nl', label: 'Dutch', native: 'Nederlands' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'ko', label: 'Korean', native: '한국어' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  // South African official languages
  { code: 'af', label: 'Afrikaans', native: 'Afrikaans' },
  { code: 'zu', label: 'Zulu', native: 'isiZulu' },
  { code: 'xh', label: 'Xhosa', native: 'isiXhosa' },
  { code: 'nso', label: 'Northern Sotho', native: 'Sepedi' },
  { code: 'st', label: 'Sesotho', native: 'Sesotho' },
  { code: 'tn', label: 'Tswana', native: 'Setswana' },
  { code: 'ss', label: 'Swati', native: 'siSwati' },
  { code: 'nr', label: 'Ndebele', native: 'isiNdebele' },
  { code: 'ts', label: 'Tsonga', native: 'Xitsonga' },
  { code: 've', label: 'Venda', native: 'Tshivenḓa' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
]

const RTL_LANGS: Lang[] = ['ar']

type Dict = Record<string, string>

const en: Dict = {
  'nav.pricing': 'Pricing',
  'nav.features': 'Features',
  'nav.how': 'How it works',
  'nav.platform': 'Platform',
  'cta.signIn': 'Sign in',
  'cta.bookDemo': 'Book a demo',
  'cta.tryDemo': 'Try the live demo',
  'cta.explore': 'Explore platform',
  'cta.startDemo': 'Start the demo',
  'cta.getStarted': 'Get started',

  'hero.badge': 'AI workforce wellness, in real time',
  'hero.title1': 'Keep your people',
  'hero.titleHi': 'alert, safe',
  'hero.title2': 'and at their best',
  'hero.subtitle':
    'SentinelAI continuously monitors fatigue and wellness across your workforce — detecting risk early and guiding healthier shifts with privacy-first AI.',
  'hero.trusted': 'Trusted by safety teams at 120+ industrial sites',

  'stats.title': 'Built for high-stakes operations',
  'stats.uptime': 'Monitoring uptime',
  'stats.alerts': 'Faster risk response',
  'stats.sites': 'Industrial sites',
  'stats.workers': 'Workers protected',

  'features.title': 'Everything you need to protect your workforce',
  'features.subtitle': 'A complete fatigue and wellness platform — from the wristband to the boardroom.',
  'features.f1.title': 'Real-time vitals',
  'features.f1.desc': 'Heart rate, fatigue and risk streamed live from each wearable band.',
  'features.f2.title': 'Early risk alerts',
  'features.f2.desc': 'Detect drowsiness and fatigue before it becomes an incident.',
  'features.f3.title': 'Privacy-first',
  'features.f3.desc': 'Wearable-only monitoring — no cameras, no surveillance.',
  'features.f4.title': 'Smart breaks',
  'features.f4.desc': 'Automatic break nudges keep teams rested and compliant.',
  'features.f5.title': 'Branded reports',
  'features.f5.desc': 'Export PDF, Excel and CSV reports for audits and leadership.',
  'features.f6.title': 'Role-based access',
  'features.f6.desc': 'Tailored views for employees, managers and owners.',

  'how.title': 'How SentinelAI works',
  'how.subtitle': 'From signal to safety in three simple steps.',
  'how.s1.title': 'Wear the band',
  'how.s1.desc': 'Workers wear a lightweight wristband that streams vitals securely.',
  'how.s2.title': 'AI watches for risk',
  'how.s2.desc': 'Our models flag fatigue and drowsiness the moment it appears.',
  'how.s3.title': 'Act early',
  'how.s3.desc': 'Managers get instant alerts and guide safer, healthier shifts.',

  'roles.title': 'One platform, three experiences',
  'roles.subtitle': 'Purpose-built workspaces for every part of your operation.',
  'roles.employee.title': 'Employee',
  'roles.employee.desc': 'Live vitals, break reminders and wellness reports.',
  'roles.manager.title': 'Manager',
  'roles.manager.desc': 'Workforce monitoring, alerts and approvals in one view.',
  'roles.owner.title': 'Owner',
  'roles.owner.desc': 'Fleet-wide oversight, revenue and company management.',

  'quote.text':
    '"SentinelAI gave our safety team eyes on fatigue we simply could not see before. Incidents are down and our crews feel looked after."',
  'quote.author': 'Head of Safety, industrial operator',

  'final.title': 'See SentinelAI on your shop floor',
  'final.subtitle': 'Launch the interactive demo and explore the Employee, Manager and Owner experiences.',
  'final.b1': 'No installation',
  'final.b2': 'Full demo data',
  'final.b3': 'All three roles',

  'footer.rights': '© 2026 SentinelAI. All rights reserved.',
  'footer.privacy': 'Privacy',
  'footer.security': 'Security',
  'footer.terms': 'Terms',
}

const af: Dict = {
  'nav.pricing': 'Pryse',
  'nav.features': 'Kenmerke',
  'nav.how': 'Hoe dit werk',
  'nav.platform': 'Platform',
  'cta.signIn': 'Meld aan',
  'cta.bookDemo': 'Bespreek \u2019n demo',
  'cta.tryDemo': 'Probeer die lewendige demo',
  'cta.explore': 'Verken platform',
  'cta.startDemo': 'Begin die demo',
  'cta.getStarted': 'Begin nou',

  'hero.badge': 'KI-werksmagwelstand, intyds',
  'hero.title1': 'Hou jou mense',
  'hero.titleHi': 'wakker, veilig',
  'hero.title2': 'en op hul beste',
  'hero.subtitle':
    'SentinelAI monitor deurlopend vermoeidheid en welstand oor jou werksmag \u2014 dit bespeur risiko vroeg en lei gesonder skofte met privaatheid-eerste KI.',
  'hero.trusted': 'Vertrou deur veiligheidspanne by 120+ industri\u00eble terreine',

  'stats.title': 'Gebou vir ho\u00eb-risiko bedrywighede',
  'stats.uptime': 'Monitering-beskikbaarheid',
  'stats.alerts': 'Vinniger risiko-reaksie',
  'stats.sites': 'Industri\u00eble terreine',
  'stats.workers': 'Werkers beskerm',

  'features.title': 'Alles wat jy nodig het om jou werksmag te beskerm',
  'features.subtitle': '\u2019n Volledige vermoeidheid- en welstandplatform \u2014 van die polsband tot die direksiekamer.',
  'features.f1.title': 'Intydse lewenstekens',
  'features.f1.desc': 'Harttempo, vermoeidheid en risiko lewendig vanaf elke draagbare band.',
  'features.f2.title': 'Vroe\u00eb risiko-waarskuwings',
  'features.f2.desc': 'Bespeur slaperigheid en vermoeidheid voordat dit \u2019n voorval word.',
  'features.f3.title': 'Privaatheid-eerste',
  'features.f3.desc': 'Slegs draagbare monitering \u2014 geen kameras, geen toesig nie.',
  'features.f4.title': 'Slim rustye',
  'features.f4.desc': 'Outomatiese rustyd-aansporings hou spanne uitgerus en voldoenend.',
  'features.f5.title': 'Gemerkte verslae',
  'features.f5.desc': 'Voer PDF-, Excel- en CSV-verslae uit vir oudits en leierskap.',
  'features.f6.title': 'Rolgebaseerde toegang',
  'features.f6.desc': 'Pasgemaakte aansigte vir werknemers, bestuurders en eienaars.',

  'how.title': 'Hoe SentinelAI werk',
  'how.subtitle': 'Van sein tot veiligheid in drie eenvoudige stappe.',
  'how.s1.title': 'Dra die band',
  'how.s1.desc': 'Werkers dra \u2019n ligte polsband wat lewenstekens veilig stroom.',
  'how.s2.title': 'KI hou risiko dop',
  'how.s2.desc': 'Ons modelle merk vermoeidheid en slaperigheid sodra dit verskyn.',
  'how.s3.title': 'Tree vroeg op',
  'how.s3.desc': 'Bestuurders kry onmiddellike waarskuwings en lei veiliger skofte.',

  'roles.title': 'Een platform, drie ervarings',
  'roles.subtitle': 'Doelgeboude werkruimtes vir elke deel van jou bedryf.',
  'roles.employee.title': 'Werknemer',
  'roles.employee.desc': 'Lewendige lewenstekens, rustyd-herinneringe en welstandverslae.',
  'roles.manager.title': 'Bestuurder',
  'roles.manager.desc': 'Werksmagmonitering, waarskuwings en goedkeurings in een aansig.',
  'roles.owner.title': 'Eienaar',
  'roles.owner.desc': 'Vloot-wye toesig, inkomste en maatskappybestuur.',

  'quote.text':
    '\u201cSentinelAI het ons veiligheidspan o\u00eb gegee vir vermoeidheid wat ons eenvoudig nie kon sien nie. Voorvalle is af en ons spanne voel versorg.\u201d',
  'quote.author': 'Hoof van Veiligheid, industri\u00eble operateur',

  'final.title': 'Sien SentinelAI op jou werksvloer',
  'final.subtitle': 'Begin die interaktiewe demo en verken die Werknemer-, Bestuurder- en Eienaar-ervarings.',
  'final.b1': 'Geen installasie',
  'final.b2': 'Volledige demodata',
  'final.b3': 'Al drie rolle',

  'footer.rights': '\u00a9 2026 SentinelAI. Alle regte voorbehou.',
  'footer.privacy': 'Privaatheid',
  'footer.security': 'Sekuriteit',
  'footer.terms': 'Bepalings',
}

const zu: Dict = {
  'nav.pricing': 'Amanani',
  'nav.features': 'Izici',
  'nav.how': 'Indlela esebenza ngayo',
  'nav.platform': 'Ipulatifomu',
  'cta.signIn': 'Ngena',
  'cta.bookDemo': 'Bhuka idemo',
  'cta.tryDemo': 'Zama idemo ebukhoma',
  'cta.explore': 'Hlola ipulatifomu',
  'cta.startDemo': 'Qala idemo',
  'cta.getStarted': 'Qalisa',

  'hero.badge': 'Impilo yabasebenzi nge-AI, ngesikhathi sangempela',
  'hero.title1': 'Gcina abantu bakho',
  'hero.titleHi': 'baphapheme, bephephile',
  'hero.title2': 'futhi besesimweni esihle',
  'hero.subtitle':
    'I-SentinelAI iqhubeka iqaphe ukukhathala kanye nempilo kubo bonke abasebenzi bakho \u2014 ithola ubungozi kusenesikhathi futhi iqondise amashifu anempilo nge-AI ebeka ubumfihlo phambili.',
  'hero.trusted': 'Ithenjwa amaqembu ezokuphepha ezindaweni zezimboni ezingaphezu kuka-120',

  'stats.title': 'Yakhelwe imisebenzi ephezulu yobungozi',
  'stats.uptime': 'Ukusebenza kokuqapha',
  'stats.alerts': 'Ukuphendula ubungozi okusheshayo',
  'stats.sites': 'Izindawo zezimboni',
  'stats.workers': 'Abasebenzi abavikelwe',

  'features.title': 'Konke okudingayo ukuvikela abasebenzi bakho',
  'features.subtitle': 'Ipulatifomu ephelele yokukhathala nempilo \u2014 kusukela esibhandeni sesihlakala kuya egumbini lebhodi.',
  'features.f1.title': 'Izimpawu zempilo zangempela',
  'features.f1.desc': 'Izinga lenhliziyo, ukukhathala nobungozi okusakazwa bukhoma kusukela kusibhande ngasinye.',
  'features.f2.title': 'Izexwayiso zobungozi ezisheshayo',
  'features.f2.desc': 'Thola ubuthongo nokukhathala ngaphambi kokuba kube isigameko.',
  'features.f3.title': 'Ubumfihlo phambili',
  'features.f3.desc': 'Ukuqapha kwesibhande kuphela \u2014 awekho amakhamera, akukho ukugada.',
  'features.f4.title': 'Amakhefu ahlakaniphile',
  'features.f4.desc': 'Izikhumbuzo zekhefu ezizenzakalelayo zigcina amaqembu ephumule futhi ethobela.',
  'features.f5.title': 'Imibiko enophawu',
  'features.f5.desc': 'Khipha imibiko ye-PDF, i-Excel ne-CSV yokuhlola nobuholi.',
  'features.f6.title': 'Ukufinyelela okusekelwe endimeni',
  'features.f6.desc': 'Imibono eyenzelwe abasebenzi, abaphathi nabanikazi.',

  'how.title': 'Indlela i-SentinelAI esebenza ngayo',
  'how.subtitle': 'Kusukela esibonisweni kuya ekuphepheni ngezinyathelo ezintathu ezilula.',
  'how.s1.title': 'Gqoka isibhande',
  'how.s1.desc': 'Abasebenzi bagqoka isibhande sesihlakala esilula esisakaza izimpawu zempilo ngokuphepha.',
  'how.s2.title': 'I-AI iqapha ubungozi',
  'how.s2.desc': 'Amamodeli ethu aphawula ukukhathala nobuthongo ngaso leso sikhathi okuvela ngaso.',
  'how.s3.title': 'Thatha isinyathelo kusenesikhathi',
  'how.s3.desc': 'Abaphathi bathola izexwayiso ngokushesha futhi baqondise amashifu aphephile.',

  'roles.title': 'Ipulatifomu eyodwa, izipiliyoni ezintathu',
  'roles.subtitle': 'Izindawo zokusebenza ezakhelwe inhloso yengxenye ngayinye yomsebenzi wakho.',
  'roles.employee.title': 'Isisebenzi',
  'roles.employee.desc': 'Izimpawu zempilo ezibukhoma, izikhumbuzo zekhefu nemibiko yempilo.',
  'roles.manager.title': 'Umphathi',
  'roles.manager.desc': 'Ukuqapha abasebenzi, izexwayiso nezimvume embukweni owodwa.',
  'roles.owner.title': 'Umnikazi',
  'roles.owner.desc': 'Ukwengamela imikhumbi yonke, imali engenayo nokuphathwa kwenkampani.',

  'quote.text':
    '\u201cI-SentinelAI inike iqembu lethu lezokuphepha amehlo okubona ukukhathala ebesingakwazi ukukubona. Izigameko zehlile futhi amaqembu ethu azizwa enakekelwa.\u201d',
  'quote.author': 'Inhloko Yezokuphepha, umsebenzisi wezimboni',

  'final.title': 'Bona i-SentinelAI endaweni yakho yokusebenza',
  'final.subtitle': 'Qalisa idemo ehlanganyelayo futhi uhlole izipiliyoni zeSisebenzi, zoMphathi nezoMnikazi.',
  'final.b1': 'Akukho ukufaka',
  'final.b2': 'Idatha yedemo egcwele',
  'final.b3': 'Zonke izindima ezintathu',

  'footer.rights': '\u00a9 2026 SentinelAI. Wonke amalungelo agodliwe.',
  'footer.privacy': 'Ubumfihlo',
  'footer.security': 'Ezokuphepha',
  'footer.terms': 'Imigomo',
}

const es: Dict = {
  'nav.pricing': 'Precios',
  'nav.features': 'Funciones',
  'nav.how': 'Cómo funciona',
  'nav.platform': 'Plataforma',
  'cta.signIn': 'Iniciar sesión',
  'cta.bookDemo': 'Reservar demo',
  'cta.tryDemo': 'Probar la demo en vivo',
  'cta.explore': 'Explorar plataforma',
  'cta.startDemo': 'Iniciar la demo',
  'cta.getStarted': 'Comenzar',

  'hero.badge': 'Bienestar laboral con IA, en tiempo real',
  'hero.title1': 'Mantenga a su gente',
  'hero.titleHi': 'alerta, segura',
  'hero.title2': 'y en su mejor momento',
  'hero.subtitle':
    'SentinelAI monitorea continuamente la fatiga y el bienestar de su personal, detectando riesgos a tiempo y guiando turnos más saludables con IA centrada en la privacidad.',
  'hero.trusted': 'Con la confianza de equipos de seguridad en más de 120 sitios industriales',

  'stats.title': 'Diseñado para operaciones de alto riesgo',
  'stats.uptime': 'Tiempo de monitoreo activo',
  'stats.alerts': 'Respuesta a riesgos más rápida',
  'stats.sites': 'Sitios industriales',
  'stats.workers': 'Trabajadores protegidos',

  'features.title': 'Todo lo que necesita para proteger a su personal',
  'features.subtitle': 'Una plataforma completa de fatiga y bienestar, desde la pulsera hasta la dirección.',
  'features.f1.title': 'Signos vitales en tiempo real',
  'features.f1.desc': 'Frecuencia cardíaca, fatiga y riesgo transmitidos en vivo desde cada pulsera.',
  'features.f2.title': 'Alertas tempranas de riesgo',
  'features.f2.desc': 'Detecte somnolencia y fatiga antes de que se convierta en un incidente.',
  'features.f3.title': 'Privacidad ante todo',
  'features.f3.desc': 'Monitoreo solo con dispositivos portátiles: sin cámaras, sin vigilancia.',
  'features.f4.title': 'Descansos inteligentes',
  'features.f4.desc': 'Recordatorios automáticos mantienen a los equipos descansados y en cumplimiento.',
  'features.f5.title': 'Informes con marca',
  'features.f5.desc': 'Exporte informes en PDF, Excel y CSV para auditorías y dirección.',
  'features.f6.title': 'Acceso por roles',
  'features.f6.desc': 'Vistas adaptadas para empleados, gerentes y propietarios.',

  'how.title': 'Cómo funciona SentinelAI',
  'how.subtitle': 'De la señal a la seguridad en tres simples pasos.',
  'how.s1.title': 'Use la pulsera',
  'how.s1.desc': 'Los trabajadores usan una pulsera ligera que transmite signos vitales de forma segura.',
  'how.s2.title': 'La IA vigila el riesgo',
  'how.s2.desc': 'Nuestros modelos detectan fatiga y somnolencia en el momento en que aparecen.',
  'how.s3.title': 'Actúe a tiempo',
  'how.s3.desc': 'Los gerentes reciben alertas instantáneas y guían turnos más seguros y saludables.',

  'roles.title': 'Una plataforma, tres experiencias',
  'roles.subtitle': 'Espacios de trabajo diseñados para cada parte de su operación.',
  'roles.employee.title': 'Empleado',
  'roles.employee.desc': 'Signos vitales en vivo, recordatorios de descanso e informes de bienestar.',
  'roles.manager.title': 'Gerente',
  'roles.manager.desc': 'Monitoreo del personal, alertas y aprobaciones en una sola vista.',
  'roles.owner.title': 'Propietario',
  'roles.owner.desc': 'Supervisión de toda la flota, ingresos y gestión de la empresa.',

  'quote.text':
    '«SentinelAI dio a nuestro equipo de seguridad visibilidad sobre la fatiga que antes no podíamos ver. Los incidentes bajaron y nuestros equipos se sienten cuidados.»',
  'quote.author': 'Jefe de Seguridad, operador industrial',

  'final.title': 'Vea SentinelAI en su planta',
  'final.subtitle': 'Inicie la demo interactiva y explore las experiencias de Empleado, Gerente y Propietario.',
  'final.b1': 'Sin instalación',
  'final.b2': 'Datos de demo completos',
  'final.b3': 'Los tres roles',

  'footer.rights': '© 2026 SentinelAI. Todos los derechos reservados.',
  'footer.privacy': 'Privacidad',
  'footer.security': 'Seguridad',
  'footer.terms': 'Términos',
}

const fr: Dict = {
  'nav.pricing': 'Tarifs',
  'nav.features': 'Fonctionnalités',
  'nav.how': 'Comment ça marche',
  'nav.platform': 'Plateforme',
  'cta.signIn': 'Se connecter',
  'cta.bookDemo': 'Réserver une démo',
  'cta.tryDemo': 'Essayer la démo en direct',
  'cta.explore': 'Explorer la plateforme',
  'cta.startDemo': 'Lancer la démo',
  'cta.getStarted': 'Commencer',

  'hero.badge': 'Bien-être des équipes par IA, en temps réel',
  'hero.title1': 'Gardez vos équipes',
  'hero.titleHi': 'alertes, en sécurité',
  'hero.title2': 'et au meilleur de leur forme',
  'hero.subtitle':
    'SentinelAI surveille en continu la fatigue et le bien-être de vos équipes, détectant les risques tôt et favorisant des quarts plus sains grâce à une IA respectueuse de la vie privée.',
  'hero.trusted': 'Approuvé par les équipes de sécurité de plus de 120 sites industriels',

  'stats.title': 'Conçu pour les opérations à enjeux élevés',
  'stats.uptime': 'Disponibilité de la surveillance',
  'stats.alerts': 'Réponse aux risques plus rapide',
  'stats.sites': 'Sites industriels',
  'stats.workers': 'Travailleurs protégés',

  'features.title': 'Tout ce dont vous avez besoin pour protéger vos équipes',
  'features.subtitle': 'Une plateforme complète de fatigue et de bien-être, du bracelet à la direction.',
  'features.f1.title': 'Signes vitaux en temps réel',
  'features.f1.desc': 'Fréquence cardiaque, fatigue et risque diffusés en direct depuis chaque bracelet.',
  'features.f2.title': 'Alertes de risque précoces',
  'features.f2.desc': 'Détectez la somnolence et la fatigue avant qu’elles ne deviennent un incident.',
  'features.f3.title': 'Priorité à la vie privée',
  'features.f3.desc': 'Surveillance uniquement par bracelet : pas de caméras, pas de surveillance.',
  'features.f4.title': 'Pauses intelligentes',
  'features.f4.desc': 'Des rappels automatiques gardent les équipes reposées et conformes.',
  'features.f5.title': 'Rapports personnalisés',
  'features.f5.desc': 'Exportez des rapports PDF, Excel et CSV pour les audits et la direction.',
  'features.f6.title': 'Accès par rôle',
  'features.f6.desc': 'Vues adaptées pour les employés, les responsables et les propriétaires.',

  'how.title': 'Comment fonctionne SentinelAI',
  'how.subtitle': 'Du signal à la sécurité en trois étapes simples.',
  'how.s1.title': 'Portez le bracelet',
  'how.s1.desc': 'Les travailleurs portent un bracelet léger qui transmet les signes vitaux en toute sécurité.',
  'how.s2.title': 'L’IA surveille le risque',
  'how.s2.desc': 'Nos modèles signalent la fatigue et la somnolence dès leur apparition.',
  'how.s3.title': 'Agissez tôt',
  'how.s3.desc': 'Les responsables reçoivent des alertes instantanées et guident des quarts plus sûrs.',

  'roles.title': 'Une plateforme, trois expériences',
  'roles.subtitle': 'Des espaces de travail conçus pour chaque partie de votre activité.',
  'roles.employee.title': 'Employé',
  'roles.employee.desc': 'Signes vitaux en direct, rappels de pause et rapports de bien-être.',
  'roles.manager.title': 'Responsable',
  'roles.manager.desc': 'Surveillance des équipes, alertes et approbations dans une seule vue.',
  'roles.owner.title': 'Propriétaire',
  'roles.owner.desc': 'Supervision de toute la flotte, revenus et gestion de l’entreprise.',

  'quote.text':
    '« SentinelAI a donné à notre équipe de sécurité une visibilité sur la fatigue que nous ne pouvions pas voir auparavant. Les incidents ont diminué et nos équipes se sentent prises en charge. »',
  'quote.author': 'Responsable de la sécurité, opérateur industriel',

  'final.title': 'Découvrez SentinelAI dans votre atelier',
  'final.subtitle': 'Lancez la démo interactive et explorez les expériences Employé, Responsable et Propriétaire.',
  'final.b1': 'Aucune installation',
  'final.b2': 'Données de démo complètes',
  'final.b3': 'Les trois rôles',

  'footer.rights': '© 2026 SentinelAI. Tous droits réservés.',
  'footer.privacy': 'Confidentialité',
  'footer.security': 'Sécurité',
  'footer.terms': 'Conditions',
}

const de: Dict = {
  'nav.pricing': 'Preise',
  'nav.features': 'Funktionen',
  'nav.how': 'So funktioniert es',
  'nav.platform': 'Plattform',
  'cta.signIn': 'Anmelden',
  'cta.bookDemo': 'Demo buchen',
  'cta.tryDemo': 'Live-Demo testen',
  'cta.explore': 'Plattform erkunden',
  'cta.startDemo': 'Demo starten',
  'cta.getStarted': 'Loslegen',

  'hero.badge': 'KI-Mitarbeiterwohl, in Echtzeit',
  'hero.title1': 'Halten Sie Ihre Mitarbeiter',
  'hero.titleHi': 'wach, sicher',
  'hero.title2': 'und in Bestform',
  'hero.subtitle':
    'SentinelAI überwacht kontinuierlich Müdigkeit und Wohlbefinden Ihrer Belegschaft, erkennt Risiken frühzeitig und ermöglicht gesündere Schichten mit datenschutzorientierter KI.',
  'hero.trusted': 'Vertraut von Sicherheitsteams an über 120 Industriestandorten',

  'stats.title': 'Entwickelt für anspruchsvolle Einsätze',
  'stats.uptime': 'Überwachungsverfügbarkeit',
  'stats.alerts': 'Schnellere Risikoreaktion',
  'stats.sites': 'Industriestandorte',
  'stats.workers': 'Geschützte Mitarbeiter',

  'features.title': 'Alles, was Sie zum Schutz Ihrer Belegschaft brauchen',
  'features.subtitle': 'Eine komplette Plattform für Müdigkeit und Wohlbefinden – vom Armband bis zur Chefetage.',
  'features.f1.title': 'Echtzeit-Vitalwerte',
  'features.f1.desc': 'Herzfrequenz, Müdigkeit und Risiko live von jedem Armband übertragen.',
  'features.f2.title': 'Frühe Risikowarnungen',
  'features.f2.desc': 'Erkennen Sie Schläfrigkeit und Müdigkeit, bevor ein Vorfall entsteht.',
  'features.f3.title': 'Datenschutz zuerst',
  'features.f3.desc': 'Nur Wearable-Überwachung – keine Kameras, keine Überwachung.',
  'features.f4.title': 'Intelligente Pausen',
  'features.f4.desc': 'Automatische Pausenhinweise halten Teams ausgeruht und konform.',
  'features.f5.title': 'Gebrandete Berichte',
  'features.f5.desc': 'Exportieren Sie PDF-, Excel- und CSV-Berichte für Audits und Führung.',
  'features.f6.title': 'Rollenbasierter Zugriff',
  'features.f6.desc': 'Maßgeschneiderte Ansichten für Mitarbeiter, Manager und Inhaber.',

  'how.title': 'So funktioniert SentinelAI',
  'how.subtitle': 'Vom Signal zur Sicherheit in drei einfachen Schritten.',
  'how.s1.title': 'Armband tragen',
  'how.s1.desc': 'Mitarbeiter tragen ein leichtes Armband, das Vitalwerte sicher überträgt.',
  'how.s2.title': 'KI überwacht Risiken',
  'how.s2.desc': 'Unsere Modelle erkennen Müdigkeit und Schläfrigkeit, sobald sie auftreten.',
  'how.s3.title': 'Früh handeln',
  'how.s3.desc': 'Manager erhalten sofortige Warnungen und steuern sicherere Schichten.',

  'roles.title': 'Eine Plattform, drei Erlebnisse',
  'roles.subtitle': 'Zweckmäßige Arbeitsbereiche für jeden Teil Ihres Betriebs.',
  'roles.employee.title': 'Mitarbeiter',
  'roles.employee.desc': 'Live-Vitalwerte, Pausenerinnerungen und Wohlbefindensberichte.',
  'roles.manager.title': 'Manager',
  'roles.manager.desc': 'Belegschaftsüberwachung, Warnungen und Genehmigungen in einer Ansicht.',
  'roles.owner.title': 'Inhaber',
  'roles.owner.desc': 'Flottenweite Aufsicht, Umsatz und Unternehmensverwaltung.',

  'quote.text':
    '„SentinelAI gab unserem Sicherheitsteam Einblick in Müdigkeit, die wir zuvor einfach nicht sehen konnten. Vorfälle sind zurückgegangen und unsere Teams fühlen sich umsorgt.“',
  'quote.author': 'Leiter Sicherheit, Industriebetreiber',

  'final.title': 'Erleben Sie SentinelAI in Ihrer Halle',
  'final.subtitle': 'Starten Sie die interaktive Demo und erkunden Sie die Mitarbeiter-, Manager- und Inhaber-Erlebnisse.',
  'final.b1': 'Keine Installation',
  'final.b2': 'Vollständige Demodaten',
  'final.b3': 'Alle drei Rollen',

  'footer.rights': '© 2026 SentinelAI. Alle Rechte vorbehalten.',
  'footer.privacy': 'Datenschutz',
  'footer.security': 'Sicherheit',
  'footer.terms': 'Bedingungen',
}

const pt: Dict = {
  'nav.pricing': 'Preços',
  'nav.features': 'Recursos',
  'nav.how': 'Como funciona',
  'nav.platform': 'Plataforma',
  'cta.signIn': 'Entrar',
  'cta.bookDemo': 'Agendar demo',
  'cta.tryDemo': 'Experimentar a demo ao vivo',
  'cta.explore': 'Explorar plataforma',
  'cta.startDemo': 'Iniciar a demo',
  'cta.getStarted': 'Começar',

  'hero.badge': 'Bem-estar da equipe com IA, em tempo real',
  'hero.title1': 'Mantenha sua equipe',
  'hero.titleHi': 'alerta, segura',
  'hero.title2': 'e no seu melhor',
  'hero.subtitle':
    'A SentinelAI monitora continuamente a fadiga e o bem-estar da sua equipe, detectando riscos cedo e orientando turnos mais saudáveis com IA focada em privacidade.',
  'hero.trusted': 'Confiável para equipes de segurança em mais de 120 locais industriais',

  'stats.title': 'Feito para operações de alto risco',
  'stats.uptime': 'Disponibilidade de monitoramento',
  'stats.alerts': 'Resposta a riscos mais rápida',
  'stats.sites': 'Locais industriais',
  'stats.workers': 'Trabalhadores protegidos',

  'features.title': 'Tudo o que você precisa para proteger sua equipe',
  'features.subtitle': 'Uma plataforma completa de fadiga e bem-estar — da pulseira à diretoria.',
  'features.f1.title': 'Sinais vitais em tempo real',
  'features.f1.desc': 'Frequência cardíaca, fadiga e risco transmitidos ao vivo de cada pulseira.',
  'features.f2.title': 'Alertas precoces de risco',
  'features.f2.desc': 'Detecte sonolência e fadiga antes que se tornem um incidente.',
  'features.f3.title': 'Privacidade em primeiro lugar',
  'features.f3.desc': 'Monitoramento apenas por wearable — sem câmeras, sem vigilância.',
  'features.f4.title': 'Pausas inteligentes',
  'features.f4.desc': 'Lembretes automáticos mantêm as equipes descansadas e em conformidade.',
  'features.f5.title': 'Relatórios com marca',
  'features.f5.desc': 'Exporte relatórios em PDF, Excel e CSV para auditorias e liderança.',
  'features.f6.title': 'Acesso por função',
  'features.f6.desc': 'Visões personalizadas para funcionários, gerentes e proprietários.',

  'how.title': 'Como a SentinelAI funciona',
  'how.subtitle': 'Do sinal à segurança em três passos simples.',
  'how.s1.title': 'Use a pulseira',
  'how.s1.desc': 'Os trabalhadores usam uma pulseira leve que transmite sinais vitais com segurança.',
  'how.s2.title': 'A IA observa o risco',
  'how.s2.desc': 'Nossos modelos sinalizam fadiga e sonolência no momento em que aparecem.',
  'how.s3.title': 'Aja cedo',
  'how.s3.desc': 'Os gerentes recebem alertas instantâneos e orientam turnos mais seguros.',

  'roles.title': 'Uma plataforma, três experiências',
  'roles.subtitle': 'Espaços de trabalho criados para cada parte da sua operação.',
  'roles.employee.title': 'Funcionário',
  'roles.employee.desc': 'Sinais vitais ao vivo, lembretes de pausa e relatórios de bem-estar.',
  'roles.manager.title': 'Gerente',
  'roles.manager.desc': 'Monitoramento da equipe, alertas e aprovações em uma só visão.',
  'roles.owner.title': 'Proprietário',
  'roles.owner.desc': 'Supervisão de toda a frota, receita e gestão da empresa.',

  'quote.text':
    '“A SentinelAI deu à nossa equipe de segurança visibilidade sobre a fadiga que antes não conseguíamos ver. Os incidentes caíram e nossas equipes se sentem cuidadas.”',
  'quote.author': 'Chefe de Segurança, operador industrial',

  'final.title': 'Veja a SentinelAI no seu chão de fábrica',
  'final.subtitle': 'Inicie a demo interativa e explore as experiências de Funcionário, Gerente e Proprietário.',
  'final.b1': 'Sem instalação',
  'final.b2': 'Dados de demo completos',
  'final.b3': 'Os três papéis',

  'footer.rights': '© 2026 SentinelAI. Todos os direitos reservados.',
  'footer.privacy': 'Privacidade',
  'footer.security': 'Segurança',
  'footer.terms': 'Termos',
}

const zh: Dict = {
  'nav.pricing': '价格',
  'nav.features': '功能',
  'nav.how': '工作原理',
  'nav.platform': '平台',
  'cta.signIn': '登录',
  'cta.bookDemo': '预约演示',
  'cta.tryDemo': '试用实时演示',
  'cta.explore': '探索平台',
  'cta.startDemo': '开始演示',
  'cta.getStarted': '开始使用',

  'hero.badge': '实时 AI 员工健康监测',
  'hero.title1': '让您的员工',
  'hero.titleHi': '警觉、安全',
  'hero.title2': '保持最佳状态',
  'hero.subtitle':
    'SentinelAI 持续监测员工的疲劳和健康状况，及早发现风险，并通过注重隐私的 AI 指导更健康的轮班。',
  'hero.trusted': '受到 120 多个工业基地安全团队的信赖',

  'stats.title': '专为高风险作业打造',
  'stats.uptime': '监测正常运行时间',
  'stats.alerts': '更快的风险响应',
  'stats.sites': '工业基地',
  'stats.workers': '受保护的员工',

  'features.title': '保护员工所需的一切',
  'features.subtitle': '完整的疲劳与健康平台——从腕带到董事会。',
  'features.f1.title': '实时生命体征',
  'features.f1.desc': '心率、疲劳和风险由每个腕带实时传输。',
  'features.f2.title': '早期风险警报',
  'features.f2.desc': '在事故发生之前检测困倦和疲劳。',
  'features.f3.title': '隐私优先',
  'features.f3.desc': '仅可穿戴设备监测——无摄像头，无监控。',
  'features.f4.title': '智能休息',
  'features.f4.desc': '自动休息提醒让团队保持充分休息和合规。',
  'features.f5.title': '品牌报告',
  'features.f5.desc': '导出 PDF、Excel 和 CSV 报告，用于审计和管理层。',
  'features.f6.title': '基于角色的访问',
  'features.f6.desc': '为员工、经理和所有者量身定制的视图。',

  'how.title': 'SentinelAI 如何运作',
  'how.subtitle': '三个简单步骤，从信号到安全。',
  'how.s1.title': '佩戴腕带',
  'how.s1.desc': '员工佩戴轻便腕带，安全传输生命体征。',
  'how.s2.title': 'AI 监测风险',
  'how.s2.desc': '我们的模型在疲劳和困倦出现的那一刻就发出警示。',
  'how.s3.title': '及早行动',
  'how.s3.desc': '经理可即时收到警报，指导更安全、更健康的轮班。',

  'roles.title': '一个平台，三种体验',
  'roles.subtitle': '为您运营的每个环节量身打造的工作空间。',
  'roles.employee.title': '员工',
  'roles.employee.desc': '实时生命体征、休息提醒和健康报告。',
  'roles.manager.title': '经理',
  'roles.manager.desc': '在一个视图中进行员工监测、警报和审批。',
  'roles.owner.title': '所有者',
  'roles.owner.desc': '全车队监督、收入和公司管理。',

  'quote.text':
    '“SentinelAI 让我们的安全团队看到了以前根本无法察觉的疲劳。事故减少了，团队也感到被关怀。”',
  'quote.author': '安全主管，工业运营商',

  'final.title': '在您的车间见证 SentinelAI',
  'final.subtitle': '启动交互式演示，探索员工、经理和所有者的体验。',
  'final.b1': '无需安装',
  'final.b2': '完整演示数据',
  'final.b3': '全部三种角色',

  'footer.rights': '© 2026 SentinelAI。保留所有权利。',
  'footer.privacy': '隐私',
  'footer.security': '安全',
  'footer.terms': '条款',
}

const ar: Dict = {
  'nav.pricing': 'الأسعار',
  'nav.features': 'الميزات',
  'nav.how': 'كيف يعمل',
  'nav.platform': 'المنصة',
  'cta.signIn': 'تسجيل الدخول',
  'cta.bookDemo': 'احجز عرضًا توضيحيًا',
  'cta.tryDemo': 'جرّب العرض المباشر',
  'cta.explore': 'استكشف المنصة',
  'cta.startDemo': 'ابدأ العرض التوضيحي',
  'cta.getStarted': 'ابدأ الآن',

  'hero.badge': 'رفاهية القوى العاملة بالذكاء الاصطناعي، في الوقت الفعلي',
  'hero.title1': 'حافظ على موظفيك',
  'hero.titleHi': 'يقظين وآمنين',
  'hero.title2': 'وفي أفضل حالاتهم',
  'hero.subtitle':
    'تراقب SentinelAI باستمرار الإرهاق والعافية لدى القوى العاملة لديك، وتكتشف المخاطر مبكرًا وتوجّه نوبات عمل أكثر صحة بذكاء اصطناعي يضع الخصوصية أولاً.',
  'hero.trusted': 'موثوقة من فرق السلامة في أكثر من 120 موقعًا صناعيًا',

  'stats.title': 'مصممة للعمليات عالية المخاطر',
  'stats.uptime': 'وقت تشغيل المراقبة',
  'stats.alerts': 'استجابة أسرع للمخاطر',
  'stats.sites': 'المواقع الصناعية',
  'stats.workers': 'العمال المحميون',

  'features.title': 'كل ما تحتاجه لحماية القوى العاملة لديك',
  'features.subtitle': 'منصة كاملة للإرهاق والعافية — من السوار إلى مجلس الإدارة.',
  'features.f1.title': 'العلامات الحيوية في الوقت الفعلي',
  'features.f1.desc': 'معدل ضربات القلب والإرهاق والمخاطر تُبث مباشرة من كل سوار.',
  'features.f2.title': 'تنبيهات مبكرة للمخاطر',
  'features.f2.desc': 'اكتشف النعاس والإرهاق قبل أن يتحول إلى حادث.',
  'features.f3.title': 'الخصوصية أولاً',
  'features.f3.desc': 'المراقبة عبر الأجهزة القابلة للارتداء فقط — بدون كاميرات أو مراقبة.',
  'features.f4.title': 'استراحات ذكية',
  'features.f4.desc': 'تذكيرات الاستراحة التلقائية تُبقي الفرق مرتاحة وملتزمة.',
  'features.f5.title': 'تقارير بعلامة تجارية',
  'features.f5.desc': 'صدّر تقارير PDF وExcel وCSV لعمليات التدقيق والقيادة.',
  'features.f6.title': 'وصول حسب الدور',
  'features.f6.desc': 'عروض مخصصة للموظفين والمديرين والملاك.',

  'how.title': 'كيف تعمل SentinelAI',
  'how.subtitle': 'من الإشارة إلى السلامة في ثلاث خطوات بسيطة.',
  'how.s1.title': 'ارتدِ السوار',
  'how.s1.desc': 'يرتدي العمال سوارًا خفيفًا يبث العلامات الحيوية بأمان.',
  'how.s2.title': 'الذكاء الاصطناعي يراقب المخاطر',
  'how.s2.desc': 'تكتشف نماذجنا الإرهاق والنعاس في لحظة ظهورهما.',
  'how.s3.title': 'تصرّف مبكرًا',
  'how.s3.desc': 'يتلقى المديرون تنبيهات فورية ويوجهون نوبات عمل أكثر أمانًا وصحة.',

  'roles.title': 'منصة واحدة، ثلاث تجارب',
  'roles.subtitle': 'مساحات عمل مصممة لكل جزء من عملياتك.',
  'roles.employee.title': 'الموظف',
  'roles.employee.desc': 'علامات حيوية مباشرة وتذكيرات بالاستراحة وتقارير العافية.',
  'roles.manager.title': 'المدير',
  'roles.manager.desc': 'مراقبة القوى العاملة والتنبيهات والموافقات في عرض واحد.',
  'roles.owner.title': 'المالك',
  'roles.owner.desc': 'إشراف على الأسطول بالكامل والإيرادات وإدارة الشركة.',

  'quote.text':
    '«منحت SentinelAI فريق السلامة لدينا رؤية للإرهاق الذي لم نكن نراه من قبل. انخفضت الحوادث ويشعر طاقمنا بالاهتمام.»',
  'quote.author': 'رئيس السلامة، مشغّل صناعي',

  'final.title': 'شاهد SentinelAI في موقع عملك',
  'final.subtitle': 'ابدأ العرض التفاعلي واستكشف تجارب الموظف والمدير والمالك.',
  'final.b1': 'بدون تثبيت',
  'final.b2': 'بيانات عرض كاملة',
  'final.b3': 'جميع الأدوار الثلاثة',

  'footer.rights': '© 2026 SentinelAI. جميع الحقوق محفوظة.',
  'footer.privacy': 'الخصوصية',
  'footer.security': 'الأمان',
  'footer.terms': 'الشروط',
}

const hi: Dict = {
  'nav.pricing': 'मूल्य निर्धारण',
  'nav.features': 'विशेषताएँ',
  'nav.how': 'यह कैसे काम करता है',
  'nav.platform': 'प्लेटफ़ॉर्म',
  'cta.signIn': 'साइन इन करें',
  'cta.bookDemo': 'डेमो बुक करें',
  'cta.tryDemo': 'लाइव डेमो आज़माएँ',
  'cta.explore': 'प्लेटफ़ॉर्म देखें',
  'cta.startDemo': 'डेमो शुरू करें',
  'cta.getStarted': 'शुरू करें',

  'hero.badge': 'वास्तविक समय में एआई कार्यबल कल्याण',
  'hero.title1': 'अपने लोगों को रखें',
  'hero.titleHi': 'सतर्क, सुरक्षित',
  'hero.title2': 'और सर्वश्रेष्ठ स्थिति में',
  'hero.subtitle':
    'SentinelAI आपके कार्यबल में थकान और कल्याण की निरंतर निगरानी करता है — जोखिम का जल्दी पता लगाता है और गोपनीयता-प्रथम एआई के साथ स्वस्थ शिफ्टों का मार्गदर्शन करता है।',
  'hero.trusted': '120+ औद्योगिक स्थलों की सुरक्षा टीमों द्वारा विश्वसनीय',

  'stats.title': 'उच्च-जोखिम संचालन के लिए निर्मित',
  'stats.uptime': 'निगरानी अपटाइम',
  'stats.alerts': 'तेज़ जोखिम प्रतिक्रिया',
  'stats.sites': 'औद्योगिक स्थल',
  'stats.workers': 'संरक्षित कर्मचारी',

  'features.title': 'अपने कार्यबल की रक्षा के लिए आवश्यक सब कुछ',
  'features.subtitle': 'रिस्टबैंड से बोर्डरूम तक — एक संपूर्ण थकान और कल्याण प्लेटफ़ॉर्म।',
  'features.f1.title': 'वास्तविक समय महत्वपूर्ण संकेत',
  'features.f1.desc': 'हृदय गति, थकान और जोखिम प्रत्येक रिस्टबैंड से लाइव प्रसारित।',
  'features.f2.title': 'जल्दी जोखिम अलर्ट',
  'features.f2.desc': 'किसी घटना बनने से पहले उनींदापन और थकान का पता लगाएँ।',
  'features.f3.title': 'गोपनीयता-प्रथम',
  'features.f3.desc': 'केवल पहनने योग्य निगरानी — कोई कैमरा नहीं, कोई निगरानी नहीं।',
  'features.f4.title': 'स्मार्ट ब्रेक',
  'features.f4.desc': 'स्वचालित ब्रेक रिमाइंडर टीमों को आराम और अनुपालन में रखते हैं।',
  'features.f5.title': 'ब्रांडेड रिपोर्ट',
  'features.f5.desc': 'ऑडिट और नेतृत्व के लिए PDF, Excel और CSV रिपोर्ट निर्यात करें।',
  'features.f6.title': 'भूमिका-आधारित पहुँच',
  'features.f6.desc': 'कर्मचारियों, प्रबंधकों और मालिकों के लिए अनुकूलित दृश्य।',

  'how.title': 'SentinelAI कैसे काम करता है',
  'how.subtitle': 'तीन सरल चरणों में संकेत से सुरक्षा तक।',
  'how.s1.title': 'बैंड पहनें',
  'how.s1.desc': 'कर्मचारी एक हल्का रिस्टबैंड पहनते हैं जो महत्वपूर्ण संकेतों को सुरक्षित रूप से प्रसारित करता है।',
  'how.s2.title': 'एआई जोखिम पर नज़र रखता है',
  'how.s2.desc': 'हमारे मॉडल थकान और उनींदापन को उसी क्षण चिह्नित करते हैं जब वे दिखाई देते हैं।',
  'how.s3.title': 'जल्दी कार्रवाई करें',
  'how.s3.desc': 'प्रबंधकों को तुरंत अलर्ट मिलते हैं और वे सुरक्षित, स्वस्थ शिफ्टों का मार्गदर्शन करते हैं।',

  'roles.title': 'एक प्लेटफ़ॉर्म, तीन अनुभव',
  'roles.subtitle': 'आपके संचालन के हर भाग के लिए विशेष रूप से निर्मित कार्यक्षेत्र।',
  'roles.employee.title': 'कर्मचारी',
  'roles.employee.desc': 'लाइव महत्वपूर्ण संकेत, ब्रेक रिमाइंडर और कल्याण रिपोर्ट।',
  'roles.manager.title': 'प्रबंधक',
  'roles.manager.desc': 'एक ही दृश्य में कार्यबल निगरानी, अलर्ट और अनुमोदन।',
  'roles.owner.title': 'मालिक',
  'roles.owner.desc': 'फ्लीट-व्यापी निगरानी, राजस्व और कंपनी प्रबंधन।',

  'quote.text':
    '«SentinelAI ने हमारी सुरक्षा टीम को थकान देखने की क्षमता दी जिसे हम पहले बिल्कुल नहीं देख सकते थे। घटनाएँ कम हुई हैं और हमारे कर्मचारी देखभाल महसूस करते हैं।»',
  'quote.author': 'सुरक्षा प्रमुख, औद्योगिक ऑपरेटर',

  'final.title': 'अपने कार्यस्थल पर SentinelAI देखें',
  'final.subtitle': 'इंटरैक्टिव डेमो शुरू करें और कर्मचारी, प्रबंधक और मालिक अनुभवों का अन्वेषण करें।',
  'final.b1': 'कोई इंस्टॉलेशन नहीं',
  'final.b2': 'पूर्ण डेमो डेटा',
  'final.b3': 'तीनों भूमिकाएँ',

  'footer.rights': '© 2026 SentinelAI. सर्वाधिकार सुरक्षित।',
  'footer.privacy': 'गोपनीयता',
  'footer.security': 'सुरक्षा',
  'footer.terms': 'शर्तें',
}

const ru: Dict = {
  'nav.pricing': 'Цены',
  'nav.features': 'Возможности',
  'nav.how': 'Как это работает',
  'nav.platform': 'Платформа',
  'cta.signIn': 'Войти',
  'cta.bookDemo': 'Заказать демо',
  'cta.tryDemo': 'Попробовать живое демо',
  'cta.explore': 'Изучить платформу',
  'cta.startDemo': 'Запустить демо',
  'cta.getStarted': 'Начать',

  'hero.badge': 'ИИ-благополучие персонала в реальном времени',
  'hero.title1': 'Держите своих людей',
  'hero.titleHi': 'бодрыми, в безопасности',
  'hero.title2': 'и в наилучшей форме',
  'hero.subtitle':
    'SentinelAI непрерывно отслеживает усталость и благополучие вашего персонала, рано выявляя риски и помогая планировать более здоровые смены с ИИ, ставящим конфиденциальность на первое место.',
  'hero.trusted': 'Нам доверяют команды безопасности более чем 120 промышленных объектов',

  'stats.title': 'Создано для операций с высокими ставками',
  'stats.uptime': 'Время непрерывного мониторинга',
  'stats.alerts': 'Более быстрая реакция на риски',
  'stats.sites': 'Промышленные объекты',
  'stats.workers': 'Защищённые работники',

  'features.title': 'Всё необходимое для защиты вашего персонала',
  'features.subtitle': 'Полная платформа усталости и благополучия — от браслета до совета директоров.',
  'features.f1.title': 'Показатели в реальном времени',
  'features.f1.desc': 'Пульс, усталость и риск передаются в реальном времени с каждого браслета.',
  'features.f2.title': 'Ранние оповещения о рисках',
  'features.f2.desc': 'Выявляйте сонливость и усталость до того, как это станет инцидентом.',
  'features.f3.title': 'Конфиденциальность прежде всего',
  'features.f3.desc': 'Только носимый мониторинг — без камер и слежки.',
  'features.f4.title': 'Умные перерывы',
  'features.f4.desc': 'Автоматические напоминания о перерывах сохраняют команды отдохнувшими и соответствующими нормам.',
  'features.f5.title': 'Брендированные отчёты',
  'features.f5.desc': 'Экспортируйте отчёты в PDF, Excel и CSV для аудита и руководства.',
  'features.f6.title': 'Доступ по ролям',
  'features.f6.desc': 'Индивидуальные представления для сотрудников, менеджеров и владельцев.',

  'how.title': 'Как работает SentinelAI',
  'how.subtitle': 'От сигнала к безопасности в три простых шага.',
  'how.s1.title': 'Наденьте браслет',
  'how.s1.desc': 'Работники носят лёгкий браслет, безопасно передающий жизненные показатели.',
  'how.s2.title': 'ИИ следит за риском',
  'how.s2.desc': 'Наши модели отмечают усталость и сонливость в момент их появления.',
  'how.s3.title': 'Действуйте заранее',
  'how.s3.desc': 'Менеджеры получают мгновенные оповещения и направляют более безопасные смены.',

  'roles.title': 'Одна платформа, три опыта',
  'roles.subtitle': 'Специально созданные рабочие пространства для каждой части вашей работы.',
  'roles.employee.title': 'Сотрудник',
  'roles.employee.desc': 'Живые показатели, напоминания о перерывах и отчёты о благополучии.',
  'roles.manager.title': 'Менеджер',
  'roles.manager.desc': 'Мониторинг персонала, оповещения и согласования в одном представлении.',
  'roles.owner.title': 'Владелец',
  'roles.owner.desc': 'Надзор за всем парком, доходы и управление компанией.',

  'quote.text':
    '«SentinelAI дал нашей команде безопасности возможность видеть усталость, которую мы просто не могли заметить раньше. Инцидентов стало меньше, и наши бригады чувствуют заботу.»',
  'quote.author': 'Руководитель по безопасности, промышленный оператор',

  'final.title': 'Увидьте SentinelAI на вашем производстве',
  'final.subtitle': 'Запустите интерактивное демо и изучите опыт Сотрудника, Менеджера и Владельца.',
  'final.b1': 'Без установки',
  'final.b2': 'Полные демо-данные',
  'final.b3': 'Все три роли',

  'footer.rights': '© 2026 SentinelAI. Все права защищены.',
  'footer.privacy': 'Конфиденциальность',
  'footer.security': 'Безопасность',
  'footer.terms': 'Условия',
}

const ja: Dict = {
  'nav.pricing': '料金',
  'nav.features': '機能',
  'nav.how': '仕組み',
  'nav.platform': 'プラットフォーム',
  'cta.signIn': 'サインイン',
  'cta.bookDemo': 'デモを予約',
  'cta.tryDemo': 'ライブデモを試す',
  'cta.explore': 'プラットフォームを見る',
  'cta.startDemo': 'デモを開始',
  'cta.getStarted': '始める',

  'hero.badge': 'リアルタイムのAI労働者ウェルネス',
  'hero.title1': '従業員を',
  'hero.titleHi': '注意力高く、安全に',
  'hero.title2': '最高の状態に保つ',
  'hero.subtitle':
    'SentinelAIは従業員の疲労と健康を継続的に監視し、リスクを早期に検出し、プライバシー優先のAIでより健康的なシフトを導きます。',
  'hero.trusted': '120以上の産業施設の安全チームに信頼されています',

  'stats.title': '高リスク業務のために構築',
  'stats.uptime': '監視稼働時間',
  'stats.alerts': 'より迅速なリスク対応',
  'stats.sites': '産業施設',
  'stats.workers': '保護された従業員',

  'features.title': '従業員を守るために必要なすべて',
  'features.subtitle': 'リストバンドから経営層まで、完全な疲労とウェルネスのプラットフォーム。',
  'features.f1.title': 'リアルタイムのバイタル',
  'features.f1.desc': '心拍数、疲労、リスクを各リストバンドからライブ配信。',
  'features.f2.title': '早期リスク警告',
  'features.f2.desc': '事故になる前に眠気と疲労を検出します。',
  'features.f3.title': 'プライバシー優先',
  'features.f3.desc': 'ウェアラブルのみの監視——カメラも監視もありません。',
  'features.f4.title': 'スマートな休憩',
  'features.f4.desc': '自動休憩リマインダーがチームを休息させ、コンプライアンスを維持します。',
  'features.f5.title': 'ブランド入りレポート',
  'features.f5.desc': '監査や経営層向けにPDF、Excel、CSVレポートを出力します。',
  'features.f6.title': '役割ベースのアクセス',
  'features.f6.desc': '従業員、マネージャー、オーナー向けにカスタマイズされたビュー。',

  'how.title': 'SentinelAIの仕組み',
  'how.subtitle': 'シグナルから安全まで、3つの簡単なステップ。',
  'how.s1.title': 'バンドを装着',
  'how.s1.desc': '従業員はバイタルを安全に配信する軽量リストバンドを装着します。',
  'how.s2.title': 'AIがリスクを監視',
  'how.s2.desc': '当社のモデルは疲労と眠気が現れた瞬間にフラグを立てます。',
  'how.s3.title': '早期に対応',
  'how.s3.desc': 'マネージャーは即座に警告を受け取り、より安全で健康的なシフトを導きます。',

  'roles.title': '1つのプラットフォーム、3つの体験',
  'roles.subtitle': '業務のあらゆる部分のために専用設計されたワークスペース。',
  'roles.employee.title': '従業員',
  'roles.employee.desc': 'ライブバイタル、休憩リマインダー、ウェルネスレポート。',
  'roles.manager.title': 'マネージャー',
  'roles.manager.desc': '1つのビューで労働者の監視、警告、承認。',
  'roles.owner.title': 'オーナー',
  'roles.owner.desc': '車両全体の監督、収益、会社管理。',

  'quote.text':
    '「SentinelAIは、これまで見えなかった疲労を安全チームに可視化してくれました。インシデントは減り、現場は大切にされていると感じています。」',
  'quote.author': '安全責任者、産業オペレーター',

  'final.title': '現場でSentinelAIを体験',
  'final.subtitle': 'インタラクティブなデモを起動し、従業員、マネージャー、オーナーの体験を探索してください。',
  'final.b1': 'インストール不要',
  'final.b2': '完全なデモデータ',
  'final.b3': '3つの役割すべて',

  'footer.rights': '© 2026 SentinelAI. 全著作権所有。',
  'footer.privacy': 'プライバシー',
  'footer.security': 'セキュリティ',
  'footer.terms': '利用規約',
}

// ---------------------------------------------------------------------------
// Additional languages. These provide native translations for the most visible
// UI strings; any key not present here falls back to English automatically.
// ---------------------------------------------------------------------------

const xh: Dict = {
  'nav.pricing': 'Amaxabiso',
  'nav.features': 'Iimpawu',
  'nav.how': 'Indlela esebenza ngayo',
  'nav.platform': 'Iqonga',
  'cta.signIn': 'Ngena',
  'cta.bookDemo': 'Bhukisha idemo',
  'cta.tryDemo': 'Zama idemo ebukhoma',
  'cta.explore': 'Hlola iqonga',
  'cta.startDemo': 'Qalisa idemo',
  'cta.getStarted': 'Qalisa',
  'hero.title1': 'Gcina abantu bakho',
  'hero.titleHi': 'bephaphile, bekhuselekile',
  'hero.title2': 'kwaye besesimeni esihle',
  'footer.rights': '© 2026 SentinelAI. Onke amalungelo agciniwe.',
  'footer.privacy': 'Ubumfihlo',
  'footer.security': 'Ukhuseleko',
  'footer.terms': 'Imigaqo nemiqathango',
}

const nso: Dict = {
  'nav.pricing': 'Ditheko',
  'nav.features': 'Dikarolo',
  'nav.how': 'Ka moo e šomago ka gona',
  'nav.platform': 'Sephlatfomo',
  'cta.signIn': 'Tsena',
  'cta.bookDemo': 'Boka pontšho',
  'cta.tryDemo': 'Leka pontšho ya nako ya nnete',
  'cta.explore': 'Hlahloba sephlatfomo',
  'cta.startDemo': 'Thoma pontšho',
  'cta.getStarted': 'Thoma',
  'hero.title1': 'Boloka batho ba gago',
  'hero.titleHi': 'ba phafogile, ba šireletšegile',
  'hero.title2': 'gomme ba le maemong a makaone',
  'footer.rights': '© 2026 SentinelAI. Ditshwanelo ka moka di bolokilwe.',
  'footer.privacy': 'Sephiri',
  'footer.security': 'Tšhireletšo',
  'footer.terms': 'Dipeelano',
}

const st: Dict = {
  'nav.pricing': 'Litheko',
  'nav.features': 'Likarolo',
  'nav.how': 'Kamoo e sebetsang kateng',
  'nav.platform': 'Sethala',
  'cta.signIn': 'Kena',
  'cta.bookDemo': 'Boka pontsho',
  'cta.tryDemo': 'Leka pontsho ea sebele',
  'cta.explore': 'Hlahloba sethala',
  'cta.startDemo': 'Qala pontsho',
  'cta.getStarted': 'Qala',
  'hero.title1': 'Boloka batho ba hao',
  'hero.titleHi': 'ba falimehile, ba sireletsehile',
  'hero.title2': 'mme ba le boemong bo botle',
  'footer.rights': '© 2026 SentinelAI. Litokelo tsohle li sireletsoe.',
  'footer.privacy': 'Lekunutu',
  'footer.security': 'Tšhireletso',
  'footer.terms': 'Lipehelo',
}

const tn: Dict = {
  'nav.pricing': 'Ditlhwatlhwa',
  'nav.features': 'Dikarolo',
  'nav.how': 'Ka fa e dirang ka teng',
  'nav.platform': 'Sethala',
  'cta.signIn': 'Tsena',
  'cta.bookDemo': 'Bea pontsho',
  'cta.tryDemo': 'Leka pontsho e e tshelang',
  'cta.explore': 'Sekaseka sethala',
  'cta.startDemo': 'Simolola pontsho',
  'cta.getStarted': 'Simolola',
  'hero.title1': 'Boloka batho ba gago',
  'hero.titleHi': 'ba thantse, ba sireletsegile',
  'hero.title2': 'mme ba le mo seemong se se molemo',
  'footer.rights': '© 2026 SentinelAI. Ditshwanelo tsotlhe di sireletsegile.',
  'footer.privacy': 'Sephiri',
  'footer.security': 'Tshireletso',
  'footer.terms': 'Dipeelano',
}

const ss: Dict = {
  'nav.pricing': 'Emanani',
  'nav.features': 'Tici',
  'nav.how': 'Indlela lesebenta ngayo',
  'nav.platform': 'Inkhundla',
  'cta.signIn': 'Ngena',
  'cta.bookDemo': 'Bhukha idemo',
  'cta.tryDemo': 'Zama idemo lebukhoma',
  'cta.explore': 'Hlola inkhundla',
  'cta.startDemo': 'Cala idemo',
  'cta.getStarted': 'Cala',
  'hero.title1': 'Gcina bantfu bakho',
  'hero.titleHi': 'baphapheme, baphephile',
  'hero.title2': 'futsi basesimweni lesihle',
  'footer.rights': '© 2026 SentinelAI. Onkhe emalungelo agcinakele.',
  'footer.privacy': 'Imfihlo',
  'footer.security': 'Kuphepha',
  'footer.terms': 'Imibandzela',
}

const nr: Dict = {
  'nav.pricing': 'Amanani',
  'nav.how': 'Indlela esebenza ngayo',
  'nav.platform': 'Ipulatifomu',
  'cta.signIn': 'Ngena',
  'cta.explore': 'Hlola ipulatifomu',
  'cta.startDemo': 'Thoma idemo',
  'cta.getStarted': 'Thoma',
  'hero.title1': 'Gcina abantu bakho',
  'hero.titleHi': 'baphapheme, bavikelekile',
  'hero.title2': 'begodu basesimweni esihle',
  'footer.rights': '© 2026 SentinelAI. Woke amalungelo agodliwe.',
  'footer.privacy': 'Ubufihlo',
  'footer.security': 'Ezokuvikela',
  'footer.terms': 'Imigomo',
}

const ts: Dict = {
  'nav.pricing': 'Mintsengo',
  'nav.how': 'Ndlela leyi yi tirhaka ha yona',
  'nav.platform': 'Pulatifomo',
  'cta.signIn': 'Nghena',
  'cta.explore': 'Kambela pulatifomo',
  'cta.startDemo': 'Sungula demo',
  'cta.getStarted': 'Sungula',
  'hero.title1': 'Hlayisa vanhu va wena',
  'footer.rights': '© 2026 SentinelAI. Timfanelo hinkwato ti hlayisiwile.',
  'footer.security': 'Nsirhelelo',
  'footer.terms': 'Swipimelo',
}

const ve: Dict = {
  'nav.pricing': 'Mitengo',
  'nav.how': 'Nḓila ine ya shuma ngayo',
  'cta.signIn': 'Dzhena',
  'cta.startDemo': 'Thoma demo',
  'cta.getStarted': 'Thoma',
  'hero.title1': 'Vhulungani vhathu vhaṋu',
  'footer.rights': '© 2026 SentinelAI. Pfanelo dzoṱhe dzo vhulungwa.',
  'footer.privacy': 'Tshidzumbe',
  'footer.security': 'Tsireledzo',
}

const it: Dict = {
  'nav.pricing': 'Prezzi',
  'nav.features': 'Funzionalità',
  'nav.how': 'Come funziona',
  'nav.platform': 'Piattaforma',
  'cta.signIn': 'Accedi',
  'cta.bookDemo': 'Prenota una demo',
  'cta.tryDemo': 'Prova la demo dal vivo',
  'cta.explore': 'Esplora la piattaforma',
  'cta.startDemo': 'Avvia la demo',
  'cta.getStarted': 'Inizia',
  'hero.title1': 'Mantieni le tue persone',
  'hero.titleHi': 'attente, al sicuro',
  'hero.title2': 'e al massimo',
  'footer.rights': '© 2026 SentinelAI. Tutti i diritti riservati.',
  'footer.privacy': 'Privacy',
  'footer.security': 'Sicurezza',
  'footer.terms': 'Termini',
}

const nl: Dict = {
  'nav.pricing': 'Prijzen',
  'nav.features': 'Functies',
  'nav.how': 'Hoe het werkt',
  'nav.platform': 'Platform',
  'cta.signIn': 'Inloggen',
  'cta.bookDemo': 'Boek een demo',
  'cta.tryDemo': 'Probeer de live demo',
  'cta.explore': 'Verken het platform',
  'cta.startDemo': 'Start de demo',
  'cta.getStarted': 'Aan de slag',
  'hero.title1': 'Houd je mensen',
  'hero.titleHi': 'alert, veilig',
  'hero.title2': 'en op hun best',
  'footer.rights': '© 2026 SentinelAI. Alle rechten voorbehouden.',
  'footer.privacy': 'Privacy',
  'footer.security': 'Beveiliging',
  'footer.terms': 'Voorwaarden',
}

const ko: Dict = {
  'nav.pricing': '요금제',
  'nav.features': '기능',
  'nav.how': '작동 방식',
  'nav.platform': '플랫폼',
  'cta.signIn': '로그인',
  'cta.bookDemo': '데모 예약',
  'cta.tryDemo': '라이브 데모 체험',
  'cta.explore': '플랫폼 둘러보기',
  'cta.startDemo': '데모 시작',
  'cta.getStarted': '시작하기',
  'hero.title1': '직원을',
  'hero.titleHi': '깨어 있고 안전하게',
  'hero.title2': '최상의 상태로 유지하세요',
  'footer.rights': '© 2026 SentinelAI. 모든 권리 보유.',
  'footer.privacy': '개인정보',
  'footer.security': '보안',
  'footer.terms': '약관',
}

const sw: Dict = {
  'nav.pricing': 'Bei',
  'nav.features': 'Vipengele',
  'nav.how': 'Jinsi inavyofanya kazi',
  'nav.platform': 'Jukwaa',
  'cta.signIn': 'Ingia',
  'cta.bookDemo': 'Weka miadi ya onyesho',
  'cta.tryDemo': 'Jaribu onyesho la moja kwa moja',
  'cta.explore': 'Chunguza jukwaa',
  'cta.startDemo': 'Anza onyesho',
  'cta.getStarted': 'Anza',
  'hero.title1': 'Walinde watu wako',
  'hero.titleHi': 'wakiwa macho, salama',
  'hero.title2': 'na katika hali bora',
  'footer.rights': '© 2026 SentinelAI. Haki zote zimehifadhiwa.',
  'footer.privacy': 'Faragha',
  'footer.security': 'Usalama',
  'footer.terms': 'Masharti',
}

const dictionaries: Record<Lang, Dict> = {
  en, es, fr, de, pt, zh, ar, hi, ru, ja,
  af, zu, xh, nso, st, tn, ss, nr, ts, ve,
  it, nl, ko, sw,
}

interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'sentinel.lang'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    return stored && dictionaries[stored] ? stored : 'en'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'
  }, [lang])

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang: setLangState,
      t: (key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key,
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
