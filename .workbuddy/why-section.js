// Inserts the "why I built this" section into every README, keeping it in sync.
// The 9 files listed with a `q` field also carry the personal note (the easter egg).
const fs = require('fs')
const path = require('path')

const root = 'D:/Projects/WestPlay-CN-Plus'
const folder = 'docs/readme'

const W = {
  'README.md': {
    t: '## Why I built this',
    p: 'I went looking for a CarPlay mod, found WestPlay, and saw it was genuinely excellent (really, really good). The only trouble was the optimisation: it froze my PC. So I decided to polish it up myself, tighten the performance and add a few new features (standing on the shoulders of a giant, hehe~😊).',
  },

  'README.zh-CN.md': {
    t: '## 为什么要做这玩意',
    p: '本来我想找一个 CarPlay 的 mod，然后就翻到了 WestPlay，发现这个做得非常好（真的非常非常好），就是优化不太好，给我电脑卡崩了，所以我决定自己完善一下，优化优化性能，加点新功能啥的（也算是站在巨人的肩膀上啦，嘿嘿~😊）',
    q: '> 其实还有一点原因，就是我之前情绪激动时做了一些（可以说是很多）影响到别人（特别是我本来并不想伤害的人）的事，现在想想很内疚很难受，并且对未来很迷茫（包括学习和将来的规划），所以只能抓住这一点我可以掌握的东西（没错，就是编程），来暂时盖住我在别的方面的痛苦，唉🥲之后我也不知道该怎么办，反正走一步看一步吧 :)‍💨',
  },

  'README.zh-TW.md': {
    t: '## 為什麼要做這玩意',
    p: '本來我想找一個 CarPlay 的 mod，然後就翻到了 WestPlay，發現這個做得非常好（真的非常非常好），就是最佳化不太好，給我電腦卡崩了，所以我決定自己完善一下，最佳化最佳化效能，加點新功能啥的（也算是站在巨人的肩膀上啦，嘿嘿~😊）',
    q: '> 其實還有一點原因，就是我之前情緒激動時做了一些（可以說是很多）影響到別人（特別是我本來並不想傷害的人）的事，現在想想很內疚很難受，並且對未來很迷茫（包括學習和將來的規劃），所以只能抓住這一點我可以掌握的東西（沒錯，就是程式設計），來暫時蓋住我在別的方面的痛苦，唉🥲之後我也不知道該怎麼辦，反正走一步看一步吧 :)‍💨',
  },

  'README.ja.md': {
    t: '## なんでこれを作ったのか',
    p: 'もともと CarPlay の MOD を探していて、そこで WestPlay を見つけたんです。これがもう本当によくできていて（ほんとに、ほんとにすごい）。ただ最適化がいまいちで、PC が落ちちゃいました。それで自分で手を入れることにしました。性能を詰めて、新機能もいくつか足して（巨人の肩に乗っかってるだけですけどね、えへへ~😊）。',
    q: '> もうひとつ理由があって。前に気持ちが高ぶっていたときに、周りに（というか、たくさん）迷惑をかけることをしてしまって、しかも本当は傷つけたくなかった人まで巻き込んでしまいました。今思うと申し訳なくて、つらくて、この先のことも（進学も将来のことも）ずっと霞んでいます。だから、自分でコントロールできるこれ（そう、プログラミング）にすがって、ほかのところの苦しさを一時的にでも覆い隠している感じです。はあ🥲 この先どうすればいいのか、自分でもわからないけど、とりあえず一歩ずつかな :)‍💨',
  },

  'README.ko.md': {
    t: '## 왜 이걸 만들었냐면',
    p: '처음엔 CarPlay 모드를 찾다가 WestPlay를 발견했는데, 정말 잘 만들어져 있었어요(진짜, 아주아주 잘). 다만 최적화가 아쉬워서 컴퓨터가 뻗어버렸고, 그래서 제가 직접 다듬기로 했습니다. 성능을 손보고 새 기능도 좀 붙이고요(거인의 어깨에 올라탄 셈이죠, 히히~😊).',
  },

  'README.de.md': {
    t: '## Warum ich das gebaut habe',
    p: 'Eigentlich wollte ich nur einen CarPlay-Mod finden, dann bin ich über WestPlay gestolpert – und das ist wirklich sehr gut gemacht (wirklich, richtig gut). Bloß die Optimierung war mies und hat meinen Rechner eingefroren. Also habe ich beschlossen, selbst Hand anzulegen: Performance aufpolieren, ein paar neue Funktionen dazu (auf den Schultern eines Riesen, hihi~😊).',
  },

  'README.fr.md': {
    t: "## Pourquoi j'ai fait ça",
    p: "Au départ je cherchais un mod CarPlay, je suis tombé sur WestPlay, et franchement c'est très bien fait (vraiment, vraiment bien). Le seul souci, c'était l'optimisation : ça m'a figé le PC. Du coup j'ai décidé de le retravailler moi-même, de bosser les performances et d'ajouter deux ou trois nouveautés (sur les épaules d'un géant, héhé~😊).",
  },

  'README.fr-CA.md': {
    t: "## Pourquoi j'ai fait ça",
    p: "Au départ je cherchais un mod CarPlay, pis je suis tombé sur WestPlay, et honnêtement c'est très bien fait (vraiment, vraiment bien). Le seul problème, c'était l'optimisation : ça a figé mon ordi. Faque j'ai décidé de le retravailler moi-même, de travailler les performances pis d'ajouter quelques nouvelles affaires (sur les épaules d'un géant, héhé~😊).",
  },

  'README.es.md': {
    t: '## Por qué hice esto',
    p: 'Al principio buscaba un mod de CarPlay y me topé con WestPlay: está muy bien hecho (de verdad, muy muy bien), solo que la optimización no era buena y me congeló el ordenador. Así que decidí mejorarlo yo: pulir el rendimiento y añadir algunas funciones nuevas (a hombros de un gigante, jeje~😊).',
  },

  'README.es-419.md': {
    t: '## Por qué hice esto',
    p: 'Al principio buscaba un mod de CarPlay y me encontré con WestPlay: está muy bien hecho (de verdad, muy muy bien), solo que la optimización no era buena y me congeló la compu. Así que decidí mejorarlo yo: pulir el rendimiento y agregar algunas funciones nuevas (a hombros de un gigante, jeje~😊).',
  },

  'README.it.md': {
    t: "## Perché l'ho fatto",
    p: "All'inizio cercavo una mod per CarPlay, poi mi sono imbattuto in WestPlay e ho visto che è fatto davvero bene (davvero, davvero bene). Solo che l'ottimizzazione lasciava a desiderare e mi ha freezato il PC. Così ho deciso di rimetterci mano io: prestazioni a posto e un paio di funzioni nuove (sulle spalle di un gigante, eh eh~😊).",
  },

  'README.pt-BR.md': {
    t: '## Por que eu fiz isso',
    p: 'No começo eu procurava um mod de CarPlay, aí encontrei o WestPlay e vi que é muito bem feito (sério, muito muito bem). Só que a otimização não era boa e travou o meu PC. Então decidi melhorar eu mesmo: mexer no desempenho e adicionar algumas funções novas (em cima dos ombros de um gigante, hehe~😊).',
  },

  'README.pt-PT.md': {
    t: '## Porque é que fiz isto',
    p: 'No início andava à procura de um mod de CarPlay, até que encontrei o WestPlay e vi que está muito bem feito (a sério, muito muito bem). Só que a otimização não era boa e bloqueou-me o PC. Por isso decidi melhorá-lo eu: afinar o desempenho e acrescentar algumas funcionalidades novas (aos ombros de um gigante, hehe~😊).',
  },

  'README.ru.md': {
    t: '## Зачем я это сделал',
    p: 'Сначала я искал мод на CarPlay, потом наткнулся на WestPlay и понял, что он очень хорошо сделан (правда, очень-очень хорошо). Вот только оптимизация подводила — компьютер у меня зависал. Поэтому я решил сам его доработать: подтянуть производительность и добавить пару новых функций (стою на плечах гиганта, хе~😊).',
  },

  'README.pl.md': {
    t: '## Po co to zrobiłem',
    p: 'Na początku szukałem moda do CarPlay, aż trafiłem na WestPlay i zobaczyłem, że jest zrobiony naprawdę dobrze (serio, bardzo bardzo dobrze). Tylko optymalizacja była słaba i zawiesiła mi komputer. Więc postanowiłem sam go dopieścić: poprawić wydajność i dodać kilka nowych funkcji (stoję na ramionach olbrzyma, hi hi~😊).',
  },

  'README.szl.md': {
    t: '## Czamu to zrobiōłech',
    p: 'Nojprzōd szukołech moda do CarPlay, aże trefiōłech na WestPlay i zoboczōłech, iże je zrobiony bardzo dobrze (no naprowdã bardzo dobrze), ino optymalizacyjo niy była nojlepszo i komputyr mi sie zawiysiōł. To żech sie rozhodnōł sam go dopieszczyć, pociōngnōńc wydajność i dodać pora nowych funkcyj (stoja na ramionach ôlbrzyma, hi hi~😊).',
    q: '> Je jeszcze jedna prziczyna: kedyś, jak żech bōł rozstrojiōny, zrobiōłech rzeczy (co prawda mocka), kere wpłyneły na inkszych — nojbarzij na tych, kerych żech naprowdã niy chcioł skrzywdzić. Teroz jak o tym pōmiyrzã, to mie dusi i wstyd mie, a prziszłość je mglisto (uczenie sie i plany na dalij). To żech sie chyciōł tego, co mōgã kontrolować — programowanio — i tym na razie zakrywōm to, co mie boli inkszyndzij. Ech🥲 Potym to już niy wiem co robić, idã krok za krokiem :)‍💨',
  },

  'README.nl.md': {
    t: '## Waarom ik dit heb gemaakt',
    p: 'Eerst was ik op zoek naar een CarPlay-mod, tot ik WestPlay tegenkwam. Dat is echt heel goed gemaakt (echt, heel erg goed), alleen de optimalisatie was matig en daar liep mijn pc vast. Dus besloot ik het zelf te verbeteren: prestaties oppoetsen en een paar nieuwe functies erbij (op de schouders van een reus, hihi~😊).',
  },

  'README.tr.md': {
    t: '## Bunu neden yaptım',
    p: "Başta bir CarPlay modu arıyordum, sonra WestPlay'e denk geldim ve gerçekten çok iyi yapılmış olduğunu gördüm (cidden, çok çok iyi). Sadece optimizasyonu kötüydü ve bilgisayarımı dondurdu. Ben de kendim elden geçirmeye karar verdim: performansı toparladım, birkaç yeni özellik ekledim (bir devin omuzlarında duruyorum işte, hihi~😊).",
  },

  'README.uk.md': {
    t: '## Навіщо я це зробив',
    p: "Спочатку я шукав мод на CarPlay, аж натрапив на WestPlay і побачив, що він зроблений дуже добре (справді, дуже-дуже добре). От тільки оптимізація підводила — комп'ютер у мене зависав. Тож я вирішив сам його доопрацювати: підтягнути продуктивність і додати кілька нових функцій (стою на плечах велетня, хе~😊).",
  },

  'README.cs.md': {
    t: '## Proč jsem to udělal',
    p: 'Nejdřív jsem hledal mod na CarPlay, až jsem narazil na WestPlay a zjistil, že je fakt hodně dobře udělaný (vážně, hodně moc dobře). Jen optimalizace byla slabá a zamrzla mi u toho celá bedna. Tak jsem se rozhodl si ho doladit sám: vyladit výkon a přidat pár nových funkcí (stojím na ramenou obra, hi hi~😊).',
  },

  'README.sk.md': {
    t: '## Prečo som to urobil',
    p: 'Najprv som hľadal mod na CarPlay, až som natrafil na WestPlay a zistil, že je fakt veľmi dobre urobený (vážne, veľmi veľmi dobre). Len optimalizácia bola slabá a zamrzla mi pri tom celá mašina. Tak som sa rozhodol doladiť ho sám: vyladiť výkon a pridať pár nových funkcií (stojím na ramenách obra, hi hi~😊).',
  },

  'README.hu.md': {
    t: '## Miért csináltam ezt',
    p: 'Először egy CarPlay modot kerestem, aztán rátaláltam a WestPlayre, és láttam, hogy nagyon jól van megcsinálva (tényleg, nagyon-nagyon jól). Csak az optimalizálás volt gyenge, és lefagyasztotta a gépem. Ezért úgy döntöttem, magam javítom meg: rendbe teszem a teljesítményt, és hozzáadok pár új funkciót (egy óriás vállán állva, hehe~😊).',
  },

  'README.ro.md': {
    t: '## De ce am făcut asta',
    p: 'La început căutam un mod de CarPlay, apoi am dat peste WestPlay și am văzut că e foarte bine făcut (serios, foarte foarte bine). Doar că optimizarea nu era bună și mi-a blocat calculatorul. Așa că am decis să-l îmbunătățesc singur: am lucrat la performanță și am adăugat câteva funcții noi (stau pe umerii unui uriaș, hihi~😊).',
  },

  'README.bg.md': {
    t: '## Защо направих това',
    p: 'Първоначално търсех мод за CarPlay, после попаднах на WestPlay и видях, че е направен много добре (наистина, много много добре). Само оптимизацията беше слаба и ми замрази компютъра. Затова реших сам да го доизпипам: да пооправя производителността и да добавя няколко нови функции (стоя на раменете на гигант, хе хе~😊).',
  },

  'README.hr.md': {
    t: '## Zašto sam ovo napravio',
    p: 'Prvo sam tražio mod za CarPlay, a onda naletio na WestPlay i vidio da je stvarno dobro napravljen (stvarno, jako jako dobro). Samo je optimizacija bila slaba i zamrznula mi je računalo. Zato sam odlučio sam ga doraditi: posložiti performanse i dodati nekoliko novih funkcija (stojeći na ramenima diva, hehe~😊).',
  },

  'README.sr-Latn.md': {
    t: '## Zašto sam ovo napravio',
    p: 'Prvo sam tražio mod za CarPlay, a onda naleteo na WestPlay i video da je stvarno dobro napravljen (stvarno, jako jako dobro). Samo je optimizacija bila slaba i zamrzla mi je računar. Zato sam odlučio sam da ga doradim: posložim performanse i dodam nekoliko novih funkcija (stojeći na ramenima diva, hehe~😊).',
  },

  'README.sr-Cyrl.md': {
    t: '## Зашто сам ово направио',
    p: 'Прво сам тражио мод за CarPlay, а онда налетео на WestPlay и видео да је стварно добро направљен (стварно, јако јако добро). Само је оптимизација била слаба и замрзла ми је рачунар. Зато сам одлучио сам да га дорадим: посложим перформансе и додам неколико нових функција (стојећи на раменима дива, хехе~😊).',
  },

  'README.sl.md': {
    t: '## Zakaj sem to naredil',
    p: 'Najprej sem iskal mod za CarPlay, potem pa naletel na WestPlay in videl, da je res dobro narejen (res, zelo zelo dobro). Le optimizacija je bila slaba in mi je zamrznila računalnik. Zato sem se odločil, da ga sam izpilim: izboljšam delovanje in dodam nekaj novih funkcij (stojim na ramenih velikana, hehe~😊).',
  },

  'README.mk.md': {
    t: '## Зошто го направив ова',
    p: 'Најпрво барав мод за CarPlay, па налетав на WestPlay и видов дека е навистина добро направен (навистина, многу многу добро). Само оптимизацијата беше слаба и ми го замрзна компјутерот. Затоа решив сам да го дотерам: да ја подобрам брзината и да додадам неколку нови функции (стојам на рамениците на џин, хехе~😊).',
  },

  'README.el.md': {
    t: '## Γιατί το έφτιαξα',
    p: 'Στην αρχή έψαχνα ένα mod για CarPlay, ώσπου έπεσα πάνω στο WestPlay και είδα ότι είναι πολύ καλά φτιαγμένο (αλήθεια, πάρα πολύ καλά). Μόνο που η βελτιστοποίηση δεν ήταν καλή και μου κόλλησε τον υπολογιστή. Έτσι αποφάσισα να το φτιάξω μόνος μου: έπιασα τις επιδόσεις και πρόσθεσα μερικές νέες λειτουργίες (πάνω στους ώμους ενός γίγαντα, χε χε~😊).',
  },

  'README.sv.md': {
    t: '## Varför jag byggde det här',
    p: 'Först letade jag efter en CarPlay-mod, sedan snubblade jag över WestPlay och såg att den är riktigt bra gjord (verkligen, väldigt väldigt bra). Det var bara optimeringen som var dålig och fick min dator att hänga sig. Så jag bestämde mig för att förbättra den själv: fixa prestandan och lägga till några nya funktioner (står på en jättes axlar, hihi~😊).',
  },

  'README.da.md': {
    t: '## Hvorfor jeg lavede det her',
    p: 'I starten ledte jeg efter et CarPlay-mod, og så faldt jeg over WestPlay og kunne se, at det er virkelig godt lavet (helt seriøst, virkelig virkelig godt). Det var bare optimeringen, der var dårlig, og den fik min computer til at fryse. Så jeg besluttede at forbedre det selv: fixe ydelsen og tilføje et par nye funktioner (står på skuldrene af en kæmpe, hihi~😊).',
  },

  'README.no.md': {
    t: '## Hvorfor jeg lagde dette',
    p: 'Først lette jeg etter en CarPlay-mod, så snublet jeg over WestPlay og så at det er skikkelig godt laget (helt sant, veldig veldig bra). Det var bare optimaliseringen som var dårlig, og den fikk PC-en min til å fryse. Så jeg bestemte meg for å forbedre det selv: fikse ytelsen og legge til noen nye funksjoner (står på skuldrene til en kjempe, hihi~😊).',
  },

  'README.fi.md': {
    t: '## Miksi tein tämän',
    p: 'Aluksi etsin CarPlay-modia, kunnes törmäsin WestPlayhin ja huomasin, että se on tehty todella hyvin (oikeasti, tosi tosi hyvin). Vain optimointi oli huono ja jäädytti koneeni. Niinpä päätin parantaa sitä itse: viilasin suorituskykyä ja lisäsin pari uutta ominaisuutta (seison jättiläisen hartioilla, hihi~😊).',
  },

  'README.et.md': {
    t: '## Miks ma selle tegin',
    p: 'Alguses otsisin CarPlay modi, siis leidsin WestPlay ja avastasin, et see on väga hästi tehtud (tõesti, väga-väga hästi) — ainult optimeerimine oli kehv ja arvuti külmus ära. Nii otsustasin selle ise korda teha: võimsust lihvida ja paar uut funktsiooni lisada (seisan hiiglase õlgadel, hi hi~😊).',
    q: '> On veel üks põhjus: varem, kui olin väga emotsionaalne, tegin asju (päris palju), mis mõjutasid teisi — eriti neid, keda ma tegelikult ei tahtnud haavata. Nüüd, kui selle peale mõtlen, tunnen süüd ja mul on väga raske, ja tulevik tundub segane (ka õpingud ja plaanid). Nii haarangi ainsast, mida saan kontrollida — programmeerimisest — ja sellega katan praegu valu mujal. Oh🥲 Mida edasi teha, seda ma ka ei tea, lähen samm-sammult :)‍💨',
  },

  'README.lt.md': {
    t: '## Kodėl aš tai padariau',
    p: 'Iš pradžių ieškojau CarPlay modifikacijos, kol užtikau WestPlay ir pamačiau, kad jis tikrai labai gerai padarytas (tikrai, labai labai gerai). Tik optimizacija buvo silpna ir užšaldė man kompiuterį. Todėl nusprendžiau pats jį patobulinti: pakoreguoti našumą ir pridėti kelias naujas funkcijas (stoviu ant milžino pečių, hi hi~😊).',
  },

  'README.lv.md': {
    t: '## Kāpēc es to uztaisīju',
    p: 'Sākumā meklēju CarPlay modu, tad uzgāju WestPlay un sapratu, ka tas ir ļoti labi uztaisīts (tiešām, tiešām labi) — vienīgi optimizācija nebija laba, un dators man iekārās. Tāpēc nolēmu to paplašināt pats: pieslīpēt veiktspēju un pielikt pāris jaunas funkcijas (stāvu uz milža pleciem, hihi~😊).',
    q: '> Ir vēl viens iemesls: agrāk, kad biju ļoti satraukts, es izdarīju lietas (var teikt, daudz), kas ietekmēja citus — īpaši tos, kurus es īsti negribēju sāpināt. Tagad, kad par to domāju, jūtos vainīgs un man ir ļoti smagi, un nākotne šķiet neskaidra (arī mācības un plāni). Tāpēc es pieķeros vienīgajam, ko varu kontrolēt — programmēšanai — un ar to pagaidām aizklāju sāpes citās lietās. Eh🥲 Ko darīt tālāk, es arī nezinu, iešu soli pa solim :)‍💨',
  },

  'README.ca.md': {
    t: '## Per què vaig fer això',
    p: "Al principi buscava un mod de CarPlay, i vaig topar amb el WestPlay: està molt ben fet (de debò, molt i molt ben fet), només que l'optimització no era bona i em va penjar l'ordinador. Així que vaig decidir millorar-lo jo mateix: polir el rendiment i afegir unes quantes funcions noves (a espatlles d'un gegant, jeje~😊).",
  },

  'README.gl.md': {
    t: '## Por que fixen isto',
    p: 'Ao principio buscaba un mod de CarPlay, e atopei WestPlay: está moi ben feito (de verdade, moi moi ben), só que a optimización non era boa e o ordenador conxelóuseme. Así que decidín melloralo eu mesmo, afinar o rendemento e engadir algunhas funcións novas (estou subido aos ombros dun xigante, jeje~😊).',
    q: '> Hai outro motivo: antes, cando estaba moi alterado, fixen cousas (bastantes, a verdade) que afectaron a outras persoas — sobre todo a alguén a quen non quería facer dano. Agora, ao pensalo, síntome culpable e moi mal, e vexo o futuro con moita dúbida (tamén os estudos e os plans). Por iso agárrome ao único que podo controlar — programar — e con iso vou tapando, por agora, a dor doutras partes. Ai🥲 Tampouco sei que farei despois; irei paso a paso :)‍💨',
  },

  'README.eu.md': {
    t: '## Zergatik egin nuen hau',
    p: 'Hasieran CarPlay mod bat bilatzen hasi nintzen, eta WestPlay aurkitu nuen. Oso ondo eginda dago (benetan, oso-oso ondo), baina optimizazioa ez zen ona eta ordenagailua izoztu zidan. Beraz, nik neuk hobetzea erabaki nuen: errendimendua findu, eta funtzio berri batzuk gehitu (erraldoi baten sorbaldetan nago eta, jeje~😊).',
    q: '> Beste arrazoi bat ere badago: lehen, oso urduri nengoela, beste batzuei eragin zieten gauzak egin nituen (asko, egia esan) — batez ere inoiz mindu nahi ez nituenei. Orain pentsatuta, errudun eta gaizki sentitzen naiz, eta etorkizunari begira galdu samar nabil (ikasketak eta etorkizunerako planak barne). Beraz, nire esku dagoen gauza bakarra hartu dut — programazioa — eta horrekin estaltzen ditut beste aldeko minak, behin-behinean. Ai🥲 Gero zer egin ez dakit, baina pausoz pauso joango naiz :)‍💨',
  },

  'README.ka.md': {
    t: '## რატომ გავაკეთე ეს',
    p: 'თავიდან CarPlay-ის მოდს ვეძებდი, მერე WestPlay-ს წავაწყდი და დავინახე, რომ ძალიან კარგადაა გაკეთებული (მართლა, ძალიან-ძალიან კარგად), უბრალოდ ოპტიმიზაცია არ ვარგოდა და კომპიუტერი გამითიშა. ამიტომ გადავწყვიტე, თავად გამომესწორებინა, ცოტა გამეაუმჯობესებინა წარმადობა და რამდენიმე ახალი ფუნქციაც დამემატებინა (გიგანტის მხრებზე ვდგავარ, ჰე~😊).',
    q: '> კიდევ ერთი მიზეზი არსებობს: ადრე, როცა ძალიან აღელვებული ვიყავი, ისეთი რამ გავაკეთე (შეიძლება ითქვას, ბევრი რამ), რამაც სხვებზე იმოქმედა — განსაკუთრებით მათზე, ვისაც საერთოდ არ ვაპირებდი ტკივილის მიყენებას. ახლა რომ ვფიქრობ, სირცხვილი და სიმძიმე მაქვს და მომავალიც ბუნდოვანი მგონია (სწავლაც და ცხოვრების გეგმებიც). ამიტომ ერთადერთს ვეჭიდები, რაც ჩემს ხელშია — პროგრამირებას — და ამით დროებით ვმალავ იმ ტკივილს, რომელიც სხვა მხარეს მაქვს. ეჰ🥲 მერე რა ვქნა, არც მე ვიცი, ნაბიჯ-ნაბიჯ მივყვები :)‍💨',
  },

  'README.vi.md': {
    t: '## Vì sao mình làm cái này',
    p: 'Ban đầu mình chỉ tìm một mod CarPlay, rồi tình cờ thấy WestPlay và nhận ra nó được làm rất tốt (thật đấy, rất rất tốt). Chỉ có điều phần tối ưu chưa ổn nên làm máy mình đơ luôn. Thế là mình quyết định tự hoàn thiện nó: chỉnh lại hiệu năng và thêm vài tính năng mới (đứng trên vai người khổng lồ mà, hehe~😊).',
  },
}

// Assemble the block, wrapped in markers so a re-run replaces it instead of stacking copies.
function block(e) {
  const egg = e.q ? `<!-- easter-egg:start -->\n${e.q}\n<!-- easter-egg:end -->\n\n` : ''
  return `<!-- why:start -->\n\n${e.t}\n\n${e.p}\n\n${egg}<!-- why:end -->\n\n`
}

const files = [{ file: 'README.md', dir: root }]
for (const f of fs.readdirSync(path.join(root, folder))) {
  if (/^README\..+\.md$/.test(f)) files.push({ file: f, dir: path.join(root, folder) })
}

let inserted = 0
let replaced = 0
const missing = []

for (const { file, dir } of files) {
  const full = path.join(dir, file)
  let text = fs.readFileSync(full, 'utf8')
  const e = W[file]
  if (!e) {
    missing.push(file)
    continue
  }

  if (/<!-- why:start -->[\s\S]*?<!-- why:end -->/.test(text)) {
    text = text.replace(/<!-- why:start -->[\s\S]*?<!-- why:end -->\n*/, block(e))
    replaced++
  } else {
    // The hand-written Chinese draft has no markers yet: drop it, the block below replaces it.
    text = text.replace(/## 为什么要做这玩意[\s\S]*?(?=## 功能)/, '')
    const at = text.search(/^## /m)
    if (at < 0) {
      missing.push(file + ' (no anchor)')
      continue
    }
    text = text.slice(0, at) + block(e) + text.slice(at)
    inserted++
  }
  fs.writeFileSync(full, text, 'utf8')
}

console.log(`inserted: ${inserted}  replaced: ${replaced}  total: ${files.length}`)
console.log(missing.length ? 'MISSING:\n' + missing.join('\n') : 'all 42 files have a section')
