// Rewrites the subtitle line under the badges: the fork is no longer "for Chinese players",
// it is a fork that adds optimisations and features.
const fs = require('fs')
const path = require('path')

const root = 'D:/Projects/WestPlay-CN-Plus'
const folder = 'docs/readme'
const LINK = '<a href="https://github.com/enes-less/WestPlay">WestPlay</a>'

const LINE = {
  'README.md': `A modified branch of ${LINK}, with some optimisations and new features.`,
  'README.zh-CN.md': `${LINK} 的修改版分支，进行一些优化和功能添加。`,
  'README.zh-TW.md': `${LINK} 的修改版分支，進行一些最佳化與功能新增。`,
  'README.ja.md': `${LINK} の改変ブランチで、いくつかの最適化と新機能を追加しています。`,
  'README.ko.md': `${LINK}의 수정 브랜치로, 몇 가지 최적화와 새 기능을 더했습니다.`,
  'README.de.md': `Ein modifizierter Zweig von ${LINK}, mit einigen Optimierungen und neuen Funktionen.`,
  'README.fr.md': `Une branche modifiée de ${LINK}, avec quelques optimisations et de nouvelles fonctionnalités.`,
  'README.fr-CA.md': `Une branche modifiée de ${LINK}, avec quelques optimisations et de nouvelles fonctionnalités.`,
  'README.es.md': `Una rama modificada de ${LINK}, con algunas optimizaciones y funciones nuevas.`,
  'README.es-419.md': `Una rama modificada de ${LINK}, con algunas optimizaciones y funciones nuevas.`,
  'README.it.md': `Un ramo modificato di ${LINK}, con alcune ottimizzazioni e nuove funzioni.`,
  'README.pt-BR.md': `Uma ramificação modificada do ${LINK}, com algumas otimizações e novos recursos.`,
  'README.pt-PT.md': `Um ramo modificado do ${LINK}, com algumas otimizações e novas funcionalidades.`,
  'README.ru.md': `Изменённая ветка ${LINK}, с рядом оптимизаций и новых функций.`,
  'README.pl.md': `Zmodyfikowana gałąź ${LINK}, z kilkoma optymalizacjami i nowymi funkcjami.`,
  'README.szl.md': `Zmodyfikowanŏ gałōń ${LINK}, s pora optymalizacyjami a nowymi funkcyjami.`,
  'README.nl.md': `Een aangepaste tak van ${LINK}, met wat optimalisaties en nieuwe functies.`,
  'README.tr.md': `${LINK} projesinin, bazı optimizasyonlar ve yeni özellikler eklenmiş değiştirilmiş bir dalı.`,
  'README.uk.md': `Змінена гілка ${LINK}, з низкою оптимізацій і нових функцій.`,
  'README.cs.md': `Upravená větev ${LINK}, s několika optimalizacemi a novými funkcemi.`,
  'README.sk.md': `Upravená vetva ${LINK}, s niekoľkými optimalizáciami a novými funkciami.`,
  'README.hu.md': `A ${LINK} módosított ága, néhány optimalizációval és új funkcióval.`,
  'README.ro.md': `O ramură modificată a ${LINK}, cu câteva optimizări și funcții noi.`,
  'README.bg.md': `Модифициран клон на ${LINK}, с няколко оптимизации и нови функции.`,
  'README.hr.md': `Izmijenjena grana <a href="https://github.com/enes-less/WestPlay">WestPlaya</a>, s nekoliko optimizacija i novih značajki.`,
  'README.sr-Latn.md': `Izmenjena grana <a href="https://github.com/enes-less/WestPlay">WestPlay-a</a>, sa nekoliko optimizacija i novih funkcija.`,
  'README.sr-Cyrl.md': `Измењена грана <a href="https://github.com/enes-less/WestPlay">WestPlay-а</a>, са неколико оптимизација и нових функција.`,
  'README.sl.md': `Spremenjena veja <a href="https://github.com/enes-less/WestPlay">WestPlaya</a>, z nekaj optimizacijami in novimi funkcijami.`,
  'README.mk.md': `Изменета гранка на ${LINK}, со неколку оптимизации и нови функции.`,
  'README.el.md': `Ένας τροποποιημένος κλάδος του ${LINK}, με μερικές βελτιστοποιήσεις και νέες λειτουργίες.`,
  'README.sv.md': `En modifierad gren av ${LINK}, med en del optimeringar och nya funktioner.`,
  'README.da.md': `En modificeret gren af ${LINK}, med nogle optimeringer og nye funktioner.`,
  'README.no.md': `En modifisert gren av ${LINK}, med noen optimaliseringer og nye funksjoner.`,
  'README.fi.md': `<a href="https://github.com/enes-less/WestPlay">WestPlay</a>-projektin muokattu haara, johon on lisätty optimointeja ja uusia ominaisuuksia.`,
  'README.et.md': `${LINK} muudetud haru, kuhu on lisatud optimeerimisi ja uusi funktsioone.`,
  'README.lt.md': `Modifikuota ${LINK} šaka, su kai kuriomis optimizacijomis ir naujomis funkcijomis.`,
  'README.lv.md': `Modificēts ${LINK} atzars, ar dažām optimizācijām un jaunām funkcijām.`,
  'README.ca.md': `Una branca modificada de ${LINK}, amb algunes optimitzacions i funcions noves.`,
  'README.gl.md': `Unha rama modificada de ${LINK}, con algunhas optimizacións e funcións novas.`,
  'README.eu.md': `${LINK}ren adar aldatua, optimizazio batzuekin eta funtzio berriekin.`,
  'README.ka.md': `<a href="https://github.com/enes-less/WestPlay">WestPlay</a>-ის შეცვლილი შტო, რამდენიმე ოპტიმიზაციითა და ახალი ფუნქციით.`,
  'README.vi.md': `Một nhánh sửa đổi của ${LINK}, có thêm một số tối ưu và tính năng mới.`,
}

// Second spot: only the two Chinese versions repeat the "suited to Chinese players" claim.
const ORIGIN = {
  'README.zh-CN.md': [
    '本分支只是在它之上做了适合中文玩家的修改，并对原作者表示由衷感谢。',
    '本分支只是在它之上做了一些优化和功能添加，并对原作者表示由衷感谢。',
  ],
  'README.zh-TW.md': [
    '本分支只是在它之上做了適合中文玩家的修改，並對原作者表達由衷感謝。',
    '本分支只是在它之上做了一些最佳化與功能新增，並對原作者表達由衷感謝。',
  ],
}

const files = [{ file: 'README.md', dir: root }]
for (const f of fs.readdirSync(path.join(root, folder))) {
  if (/^README\..+\.md$/.test(f)) files.push({ file: f, dir: path.join(root, folder) })
}

let done = 0
const bad = []

for (const { file, dir } of files) {
  const full = path.join(dir, file)
  const lines = fs.readFileSync(full, 'utf8').split('\n')
  const want = LINE[file]
  if (!want) {
    bad.push(file + ' (no line defined)')
    continue
  }
  // The first line mentioning enes-less is the subtitle under the badges.
  const at = lines.findIndex((l) => l.includes('enes-less'))
  if (at < 0) {
    bad.push(file + ' (no subtitle line)')
    continue
  }
  const indent = lines[at].match(/^\s*/)[0]
  lines[at] = indent + want

  let text = lines.join('\n')
  if (ORIGIN[file]) text = text.replace(ORIGIN[file][0], ORIGIN[file][1])

  fs.writeFileSync(full, text, 'utf8')
  done++
}

console.log(`updated: ${done}/${files.length}`)
console.log(bad.length ? 'PROBLEMS:\n' + bad.join('\n') : 'subtitle rewritten in every file')
