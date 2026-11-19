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
    q: '> 사실 이유가 하나 더 있어요. 예전에 제가 많이 흥분했을 때, 다른 사람들에게 영향을 준 일을 했어요(많이요). 특히 정말 상처 주고 싶지 않았던 사람에게요. 지금 생각하면 미안하고 너무 힘들고, 앞날도 막막해요(공부도, 계획도). 그래서 제가 통제할 수 있는 유일한 것, 그러니까 프로그래밍에 매달려서 다른 쪽의 아픔을 잠시 덮고 있는 거예요. 하🥲 앞으로 어떻게 해야 할지는 저도 모르겠어요. 그냥 한 걸음씩 가려고요 :)‍💨',
  },

  'README.de.md': {
    t: '## Warum ich das gebaut habe',
    p: 'Eigentlich wollte ich nur einen CarPlay-Mod finden, dann bin ich über WestPlay gestolpert – und das ist wirklich sehr gut gemacht (wirklich, richtig gut). Bloß die Optimierung war mies und hat meinen Rechner eingefroren. Also habe ich beschlossen, selbst Hand anzulegen: Performance aufpolieren, ein paar neue Funktionen dazu (auf den Schultern eines Riesen, hihi~😊).',
    q: '> Eigentlich gibt es noch einen Grund: Früher, wenn ich sehr aufgewühlt war, habe ich Dinge getan (man kann sagen: viele), die andere getroffen haben – vor allem jemanden, den ich wirklich nicht verletzen wollte. Wenn ich heute daran denke, fühle ich mich schuldig und es tut mir sehr weh, und die Zukunft kommt mir neblig vor (auch Studium und Pläne). Deshalb klammere ich mich an das Einzige, was ich kontrollieren kann – das Programmieren – und decke damit vorerst den Schmerz an anderen Stellen zu. Ach🥲 Was ich weiter machen soll, weiß ich auch nicht, ich gehe Schritt für Schritt :)‍💨',
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
    q: '> На самом деле есть ещё одна причина: раньше, когда я был очень взвинчен, я сделал вещи (можно сказать, немало), которые задели других — особенно того, кому я совсем не хотел делать больно. Сейчас, когда я об этом думаю, мне стыдно и очень тяжело, а будущее кажется туманным (и учёба, и планы). Поэтому я держусь за единственное, что могу контролировать — программирование — и этим пока прикрываю боль в остальном. Эх🥲 Что делать дальше, я тоже не знаю, буду идти шаг за шагом :)‍💨',
  },

  'README.pl.md': {
    t: '## Po co to zrobiłem',
    p: 'Na początku szukałem moda do CarPlay, aż trafiłem na WestPlay i zobaczyłem, że jest zrobiony naprawdę dobrze (serio, bardzo bardzo dobrze). Tylko optymalizacja była słaba i zawiesiła mi komputer. Więc postanowiłem sam go dopieścić: poprawić wydajność i dodać kilka nowych funkcji (stoję na ramionach olbrzyma, hi hi~😊).',
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
    q: '> Postoji još jedan razlog: ranije, kada sam bio veoma uznemiren, uradio sam stvari (može se reći, mnogo) koje su uticale na druge — posebno na nekoga koga zaista nisam želeo da povredim. Sada kad pomislim na to, osećam se krivim i veoma mi je teško, a budućnost mi izgleda maglovita (i učenje i planovi). Zato se držim jedine stvari koju mogu da kontrolišem — programiranja — i time za sada prekrivam bol na drugim mestima. Eh🥲 Šta da radim dalje, ni ja ne znam, ići ću korak po korak :)‍💨',
  },

  'README.sr-Cyrl.md': {
    t: '## Зашто сам ово направио',
    p: 'Прво сам тражио мод за CarPlay, а онда налетео на WestPlay и видео да је стварно добро направљен (стварно, јако јако добро). Само је оптимизација била слаба и замрзла ми је рачунар. Зато сам одлучио сам да га дорадим: посложим перформансе и додам неколико нових функција (стојећи на раменима дива, хехе~😊).',
    q: '> Постоји још један разлог: раније, када сам био веома узнемирен, урадио сам ствари (може се рећи, много) које су утицале на друге — посебно на некога кога заиста нисам желео да повредим. Сада кад помислим на то, осећам се кривим и веома ми је тешко, а будућност ми изгледа магловита (и учење и планови). Зато се држим једине ствари коју могу да контролишем — програмирања — и тиме за сада прекривам бол на другим местима. Ех🥲 Шта да радим даље, ни ја не знам, ићи ћу корак по корак :)‍💨',
  },

  'README.sl.md': {
    t: '## Zakaj sem to naredil',
    p: 'Najprej sem iskal mod za CarPlay, potem pa naletel na WestPlay in videl, da je res dobro narejen (res, zelo zelo dobro). Le optimizacija je bila slaba in mi je zamrznila računalnik. Zato sem se odločil, da ga sam izpilim: izboljšam delovanje in dodam nekaj novih funkcij (stojim na ramenih velikana, hehe~😊).',
    q: '> Pravzaprav je še en razlog: prej, ko sem bil zelo vznemirjen, sem naredil stvari (lahko rečemo, veliko), ki so prizadele druge — predvsem nekoga, ki ga res nisem hotel prizadeti. Zdaj, ko pomislim na to, se počutim krivega in mi je zelo hudo, prihodnost pa se mi zdi nejasna (tudi študij in načrti). Zato se držim edine stvari, ki jo lahko nadzorujem — programiranja — in z njo za zdaj prekrivam bolečino drugje. Eh🥲 Kaj narediti naprej, tudi ne vem, šel bom korak za korakom :)‍💨',
  },

  'README.mk.md': {
    t: '## Зошто го направив ова',
    p: 'Најпрво барав мод за CarPlay, па налетав на WestPlay и видов дека е навистина добро направен (навистина, многу многу добро). Само оптимизацијата беше слаба и ми го замрзна компјутерот. Затоа решив сам да го дотерам: да ја подобрам брзината и да додадам неколку нови функции (стојам на рамениците на џин, хехе~😊).',
    q: '> Има уште една причина: порано, кога бев многу вознемирен, направив работи (може да се каже, многу) што влијаеја на други — особено на некој што навистина не сакав да го повредам. Сега кога ќе помислам на тоа, се чувствувам виновен и многу ми е тешко, а иднината ми изгледа маглива (и учењето и плановите). Затоа се држам за единственото што можам да го контролирам — програмирањето — и со тоа засега ја покривам болката на други места. Ех🥲 Што да правам понатаму, ни јас не знам, ќе одам чекор по чекор :)‍💨',
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
    q: '> Tiesa, yra dar viena priežastis: anksčiau, kai buvau labai susijaudinęs, padariau dalykų (galima sakyti, daug), kurie paveikė kitus — ypač tuos, kurių tikrai nenorėjau skaudinti. Dabar, kai apie tai pagalvoju, jaučiuosi kaltas ir man labai sunku, o ateitis atrodo miglota (ir mokslai, ir planai). Todėl laikausi vienintelio dalyko, kurį galiu kontroliuoti — programavimo — ir juo kol kas užmaskuoju skausmą kitur. Ech🥲 Ką daryti toliau, irgi nežinau, eisiu žingsnis po žingsnio :)‍💨',
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
