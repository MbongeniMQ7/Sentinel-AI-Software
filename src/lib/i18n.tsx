import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'af' | 'zu'

export const languages: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'af', label: 'Afrikaans', native: 'Afrikaans' },
  { code: 'zu', label: 'Zulu', native: 'isiZulu' },
]

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

const dictionaries: Record<Lang, Dict> = { en, af, zu }

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
