export const appCopy = {
  app: {
    name: "Paws for Life",
    eyebrow: "Adăpost Canin Craiova",
    title: "Câini disponibili pentru adopție",
    tagline: "Descoperă un suflet vesel, pe rând.",
    sourceNotice: "Datele vin din anunțurile oficiale ale adăpostului.",
    sourceLink: "Vezi anunțul oficial",
    lastSyncPrefix: "Ultima sincronizare",
    menuOpen: "Meniu",
    menuClose: "Închide meniul"
  },
  filters: {
    label: "Filtre",
    open: "Filtre",
    close: "Închide filtrele",
    searchLabel: "Caută",
    searchPlaceholder: "cartier, culoare, vârstă",
    sexLabel: "Sex",
    sizeLabel: "Talie",
    all: "Toți",
    female: "Femelă",
    male: "Mascul",
    unknown: "Necunoscut",
    small: "Mică",
    medium: "Mijlocie",
    large: "Mare",
    reset: "Resetează filtrele"
  },
  deck: {
    next: "Următorul",
    like: "Îmi place",
    verified: "Profil verificat",
    profilePhotoAction: "Reacționează la fotografie",
    about: "Despre mine",
    lookingFor: "Caut o familie",
    emptyTitle: "Nu mai sunt căței în lista curentă",
    emptyBody: "Schimbă filtrele sau revino după următoarea sincronizare.",
    unavailable: "Nu mai apare pe site",
    registryPrefix: "Registru",
    captureDate: "Data capturării",
    captureLocation: "Locul capturării",
    approximateAge: "Vârstă aproximativă",
    sex: "Sex",
    size: "Talie",
    color: "Culoare",
    characteristics: "Alte caracteristici"
  },
  match: {
    title: "E potrivire!",
    body: "L-am adăugat în lista ta scurtă.",
    close: "Continuă"
  },
  adoption: {
    cta: "Adoptă acum",
    title: "Informații pentru adopție",
    intro: "Sună adăpostul și verifică pașii oficiali înainte de vizită.",
    addressLabel: "Adresă Adăpost Canin",
    address: "Dolj, Craiova, Tarlaua 44 NP 311",
    mapsUrl: "https://maps.app.goo.gl/KdVBTt2Lj7HAGSkXA",
    dispatchPhoneLabel: "Dispecerat non-stop",
    dispatchPhone: "0251.422.733",
    shelterPhoneLabel: "Adăpost 07:00-19:00",
    shelterPhone: "0722.328.442",
    scheduleLabel: "Program",
    weekdaySchedule: "Luni - Vineri: 10:00 - 18:00",
    weekendSchedule: "Sâmbăta, Duminica, Sărbători legale: 11:00 - 13:00",
    linksLabel: "Linkuri utile",
    links: [
      {
        label: "Norme privind adopția",
        href: "https://www.adapostcanincraiova.ro/norme-privind-adoptia/"
      },
      {
        label: "Procedura de adopție",
        href: "https://www.adapostcanincraiova.ro/procedura-de-adoptie/"
      },
      {
        label: "Documente pentru adopție",
        href: "https://www.adapostcanincraiova.ro/documente-pentru-adoptie/"
      }
    ]
  },
  shortlist: {
    title: "Lista scurtă",
    open: "Lista scurtă",
    close: "Închide lista",
    empty: "Alege câinii care ți-au atras atenția și îi vei vedea aici.",
    remove: "Scoate din listă",
    countSuffix: "în listă"
  },
  status: {
    loading: "Se încarcă...",
    syncNever: "nesincronizat încă",
    syncFailed: "ultima sincronizare a eșuat",
    imageAltPrefix: "Fotografie câine registru"
  }
} as const;

export type AppCopy = typeof appCopy;
