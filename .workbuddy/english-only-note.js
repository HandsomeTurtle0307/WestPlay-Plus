// One line under the language bar explaining why three supported languages have no README.
const fs = require('fs')
const path = require('path')

const root = 'D:/Projects/WestPlay-CN-Plus'
const folder = 'docs/readme'

const T = {
  'README.md': 'Silesian, Basque and Georgian are supported by the app but have no README yet: nobody has been able to check a translation in those languages. This English version covers everything.',
  'README.zh-CN.md': '西里西亚语、巴斯克语、格鲁吉亚语在软件里都支持，但暂时没有 README：这三种语言的译文还没人校对过。仓库首页的英文版内容是全的。',
  'README.zh-TW.md': '西里西亞語、巴斯克語、喬治亞語在軟體裡都支援，但暫時沒有 README：這三種語言的譯文還沒人校對過。倉庫首頁的英文版內容是全的。',
  'README.ja.md': 'シレジア語・バスク語・ジョージア語はアプリで対応していますが、README はまだありません。この3言語は訳文を確認できる人がいないためです。内容はリポジトリ直下の英語版にすべて載っています。',
  'README.ko.md': '실레시아어, 바스크어, 조지아어는 앱에서 지원하지만 README는 아직 없습니다. 이 세 언어는 번역을 검토해 줄 사람이 없기 때문입니다. 전체 내용은 저장소 최상단의 영어판에 있습니다.',
  'README.de.md': 'Schlesisch, Baskisch und Georgisch unterstützt die App, aber eine README gibt es dafür noch nicht: Niemand konnte bisher eine Übersetzung in diese Sprachen prüfen. Alle Inhalte stehen in der englischen Fassung im Repository-Stamm.',
  'README.fr.md': "Le silésien, le basque et le géorgien sont pris en charge par l'application, mais n'ont pas encore de README : personne n'a pu vérifier une traduction dans ces langues. La version anglaise à la racine du dépôt contient tout.",
  'README.fr-CA.md': "Le silésien, le basque pis le géorgien sont pris en charge par l'application, mais n'ont pas encore de README : personne n'a pu vérifier une traduction dans ces langues. La version anglaise à la racine du dépôt contient tout.",
  'README.es.md': 'El silesio, el vasco y el georgiano están soportados por la aplicación, pero aún no tienen README: nadie ha podido revisar una traducción en esos idiomas. La versión inglesa en la raíz del repositorio lo contiene todo.',
  'README.es-419.md': 'El silesio, el vasco y el georgiano están soportados por la aplicación, pero todavía no tienen README: nadie ha podido revisar una traducción en esos idiomas. La versión inglesa en la raíz del repositorio lo contiene todo.',
  'README.it.md': "Lo slesiano, il basco e il georgiano sono supportati dall'app, ma non hanno ancora un README: nessuno ha potuto controllare una traduzione in quelle lingue. La versione inglese nella radice del repository contiene tutto.",
  'README.pt-BR.md': 'O silesiano, o basco e o georgiano são suportados pelo app, mas ainda não têm README: ninguém conseguiu revisar uma tradução nesses idiomas. A versão em inglês na raiz do repositório tem tudo.',
  'README.pt-PT.md': 'O silesiano, o basco e o georgiano são suportados pela aplicação, mas ainda não têm README: ninguém conseguiu rever uma tradução nesses idiomas. A versão inglesa na raiz do repositório tem tudo.',
  'README.ru.md': 'Силезский, баскский и грузинский приложение поддерживает, но README для них пока нет: проверить перевод на эти языки было некому. Всё содержимое есть в английской версии в корне репозитория.',
  'README.pl.md': 'Śląski, baskijski i gruziński są obsługiwane przez aplikację, ale nie mają jeszcze README: nie było komu sprawdzić tłumaczenia na te języki. Całość jest w wersji angielskiej w katalogu głównym repozytorium.',
  'README.nl.md': 'Silezisch, Baskisch en Georgisch worden door de app ondersteund, maar hebben nog geen README: er was niemand om een vertaling in die talen na te kijken. De Engelse versie in de root van de repository bevat alles.',
  'README.tr.md': "Silezyaca, Baskça ve Gürcüce uygulamada destekleniyor ama henüz README'leri yok: bu dillere yapılan çeviriyi kontrol edebilecek kimse olmadı. Tüm içerik depo kökündeki İngilizce sürümde.",
  'README.uk.md': 'Сілезьку, баскську та грузинську застосунок підтримує, але README для них поки немає: перевірити переклад цими мовами не було кому. Увесь вміст є в англійській версії в корені репозиторію.',
  'README.cs.md': 'Slezštinu, baskičtinu a gruzínštinu aplikace podporuje, ale README zatím nemají: na kontrolu překladu do těchto jazyků nebyl nikdo. Vše je v anglické verzi v kořeni repozitáře.',
  'README.sk.md': 'Sliezštinu, baskičtinu a gruzínčinu aplikácia podporuje, ale README zatiaľ nemajú: na kontrolu prekladu do týchto jazykov nebol nikto. Všetko je v anglickej verzii v koreni repozitára.',
  'README.hu.md': 'A sziléziai, a baszk és a grúz támogatott az alkalmazásban, de README-jük még nincs: nem volt, aki ellenőrizze a fordításukat. Minden tartalom a tároló gyökerében lévő angol változatban van.',
  'README.ro.md': 'Sileziana, basca și georgiana sunt acceptate de aplicație, dar nu au încă README: nu a existat cineva care să verifice o traducere în aceste limbi. Tot conținutul este în versiunea engleză din rădăcina depozitului.',
  'README.bg.md': 'Силезийски, баски и грузински приложението поддържа, но още нямат README: нямаше кой да провери превод на тези езици. Цялото съдържание е в английската версия в основата на хранилището.',
  'README.hr.md': 'Šleski, baskijski i gruzijski aplikacija podržava, ali još nemaju README: nije bilo nikoga da provjeri prijevod na te jezike. Sav sadržaj je u engleskoj verziji u korijenu repozitorija.',
  'README.sr-Latn.md': 'Šleski, baskijski i gruzijski aplikacija podržava, ali još nemaju README: nije bilo nikoga da proveri prevod na te jezike. Sav sadržaj je u engleskoj verziji u korenu repozitorijuma.',
  'README.sr-Cyrl.md': 'Шлески, баскијски и грузијски апликација подржава, али још немају README: није било никога да провери превод на те језике. Сав садржај је у енглеској верзији у корену репозиторијума.',
  'README.sl.md': 'Šlezijščino, baskovščino in gruzinščino aplikacija podpira, a README-ja še nimajo: ni bilo nikogar, ki bi pregledal prevod v te jezike. Vsa vsebina je v angleški različici v korenu repozitorija.',
  'README.mk.md': 'Шлезиски, баскиски и грузиски апликацијата ги поддржува, но сè уште немаат README: немаше кого да го провери преводот на тие јазици. Целата содржина е во англиската верзија во коренот на репозиториумот.',
  'README.el.md': 'Τα σιλεσικά, τα βασκικά και τα γεωργιανά υποστηρίζονται από την εφαρμογή, αλλά δεν έχουν ακόμη README: δεν υπήρχε κάποιος να ελέγξει μια μετάφραση σε αυτές τις γλώσσες. Όλο το περιεχόμενο υπάρχει στην αγγλική έκδοση στη ρίζα του αποθετηρίου.',
  'README.sv.md': 'Schlesiska, baskiska och georgiska stöds av appen men har ännu ingen README: det har inte funnits någon som kunnat granska en översättning till de språken. Allt innehåll finns i den engelska versionen i repots rot.',
  'README.da.md': 'Schlesisk, baskisk og georgisk understøttes af appen, men har endnu ingen README: der har ikke været nogen til at gennemgå en oversættelse til de sprog. Alt indhold findes i den engelske version i repositoriets rod.',
  'README.no.md': 'Schlesisk, baskisk og georgisk støttes av appen, men har ennå ingen README: det har ikke vært noen som kunne gå gjennom en oversettelse til disse språkene. Alt innholdet finnes i den engelske versjonen i repoets rot.',
  'README.fi.md': 'Sleesia, baski ja georgia ovat tuettuja sovelluksessa, mutta niillä ei ole vielä README:tä: kukaan ei ole voinut tarkistaa käännöstä näille kielille. Kaikki sisältö on repositorion juuressa olevassa englanninkielisessä versiossa.',
  'README.et.md': 'Sileesia, baski ja gruusia on rakenduses toetatud, aga neil pole veel README-t: neisse keeltesse tehtud tõlget pole kellelgi olnud kontrollida. Kogu sisu on hoidla juures olevas ingliskeelses versioonis.',
  'README.lt.md': 'Sileziečių, baskų ir gruzinų kalbas programa palaiko, bet README jų dar nėra: nebuvo kam patikrinti vertimo į šias kalbas. Visas turinys yra angliškoje versijoje saugyklos šaknyje.',
  'README.lv.md': 'Sileziešu, basku un gruzīnu valodas lietotne atbalsta, bet tām vēl nav README: nebija neviena, kas pārbaudītu tulkojumu šajās valodās. Viss saturs ir angļu versijā repozitorija saknē.',
  'README.ca.md': "El silesià, el basc i el georgià són compatibles amb l'aplicació, però encara no tenen README: no hi ha hagut ningú que revisés una traducció en aquestes llengües. Tot el contingut és a la versió anglesa de l'arrel del repositori.",
  'README.gl.md': 'O silesiano, o vasco e o xeorxiano están soportados pola aplicación, pero aínda non teñen README: non houbo quen revisase unha tradución nesas linguas. Todo o contido está na versión inglesa na raíz do repositorio.',
  'README.vi.md': 'Tiếng Silesia, tiếng Basque và tiếng Gruzia được ứng dụng hỗ trợ nhưng chưa có README: chưa có ai kiểm tra bản dịch sang các ngôn ngữ này. Toàn bộ nội dung nằm trong bản tiếng Anh ở thư mục gốc của kho lưu trữ.',
}

const files = [{ file: 'README.md', dir: root }]
for (const f of fs.readdirSync(path.join(root, folder))) {
  if (/^README\..+\.md$/.test(f)) files.push({ file: f, dir: path.join(root, folder) })
}

let done = 0
const bad = []

for (const { file, dir } of files) {
  const full = path.join(dir, file)
  let text = fs.readFileSync(full, 'utf8')
  const sentence = T[file]
  if (!sentence) {
    bad.push(file + ' (no sentence)')
    continue
  }
  const block = `<!-- english-only:start -->\n<p align="center"><sub>${sentence}</sub></p>\n<!-- english-only:end -->`

  if (/<!-- english-only:start -->[\s\S]*?<!-- english-only:end -->/.test(text)) {
    text = text.replace(/<!-- english-only:start -->[\s\S]*?<!-- english-only:end -->/, block)
  } else {
    const anchor = '<!-- languages:end -->'
    const at = text.indexOf(anchor)
    if (at < 0) {
      bad.push(file + ' (no language bar)')
      continue
    }
    const cut = at + anchor.length
    text = text.slice(0, cut) + '\n\n' + block + text.slice(cut)
  }
  fs.writeFileSync(full, text, 'utf8')
  done++
}

console.log(`updated: ${done}/${files.length}`)
console.log(bad.length ? 'PROBLEMS:\n' + bad.join('\n') : 'note added under the language bar in every file')
