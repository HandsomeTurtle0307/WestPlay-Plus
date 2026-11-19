// Keeps the language bar identical in every README: one at the repo root, the rest in docs/readme.
const fs = require('fs')
const path = require('path')

const root = 'D:/Projects/WestPlay-CN-Plus'
const folder = 'docs/readme'

// A language's own name, as the app's language menu names it.
const NAMES = {
  'README.md': 'English',
  'README.zh-CN.md': '简体中文',
  'README.zh-TW.md': '繁體中文',
  'README.ja.md': '日本語',
  'README.ko.md': '한국어',
  'README.de.md': 'Deutsch',
  'README.fr.md': 'Français',
  'README.fr-CA.md': 'Français (Canada)',
  'README.es.md': 'Español',
  'README.es-419.md': 'Español (Latinoamérica)',
  'README.it.md': 'Italiano',
  'README.pt-BR.md': 'Português (Brasil)',
  'README.pt-PT.md': 'Português (Portugal)',
  'README.ru.md': 'Русский',
  'README.pl.md': 'Polski',
  'README.szl.md': 'Ślōnsko godka',
  'README.nl.md': 'Nederlands',
  'README.tr.md': 'Türkçe',
  'README.uk.md': 'Українська',
  'README.cs.md': 'Čeština',
  'README.sk.md': 'Slovenčina',
  'README.hu.md': 'Magyar',
  'README.ro.md': 'Română',
  'README.bg.md': 'Български',
  'README.hr.md': 'Hrvatski',
  'README.sr-Latn.md': 'Srpski (latinica)',
  'README.sr-Cyrl.md': 'Српски (ћирилица)',
  'README.sl.md': 'Slovenščina',
  'README.mk.md': 'Македонски',
  'README.el.md': 'Ελληνικά',
  'README.sv.md': 'Svenska',
  'README.da.md': 'Dansk',
  'README.no.md': 'Norsk',
  'README.fi.md': 'Suomi',
  'README.et.md': 'Eesti',
  'README.lt.md': 'Lietuvių',
  'README.lv.md': 'Latviešu',
  'README.ca.md': 'Català',
  'README.gl.md': 'Galego',
  'README.eu.md': 'Euskara',
  'README.ka.md': 'ქართული',
  'README.vi.md': 'Tiếng Việt',
}

const ORDER = Object.keys(NAMES)
const rank = (f) => (ORDER.includes(f) ? ORDER.indexOf(f) : 999)

const entries = [{ file: 'README.md', dir: root }]
for (const f of fs.readdirSync(path.join(root, folder))) {
  if (/^README\..+\.md$/.test(f)) entries.push({ file: f, dir: path.join(root, folder) })
}

const href = (from, to) => {
  if (path.resolve(from.dir) === path.resolve(to.dir)) return to.file
  return from.dir === root ? folder + '/' + to.file : '../../' + to.file
}

for (const from of entries) {
  const full = path.join(from.dir, from.file)
  const text = fs.readFileSync(full, 'utf8')
  const re = /<!-- languages:start -->[\s\S]*?<!-- languages:end -->/
  if (!re.test(text)) {
    console.log('no markers: ' + from.file)
    continue
  }
  // Every version lists each language in its own name, the way GitHub does it.
  const name = (f) => NAMES[f] ?? f
  const links = [...entries]
    .sort((a, b) => rank(a.file) - rank(b.file))
    .map((to) =>
      to.file === from.file
        ? `<b>${name(to.file)}</b>`
        : `<a href="${href(from, to)}">${name(to.file)}</a>`,
    )
    .join(' · ')
  const block = `<!-- languages:start -->\n<p align="center">\n  ${links}\n</p>\n<!-- languages:end -->`
  fs.writeFileSync(full, text.replace(re, block), 'utf8')
}

console.log(entries.length + ' files updated')
