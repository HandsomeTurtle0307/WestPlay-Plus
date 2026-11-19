$ErrorActionPreference = 'Stop'
Set-Location 'D:\Projects\WestPlay-CN-Plus'
$dir = (Resolve-Path 'ui\src\companion\onboarding\words').Path
$enc = New-Object System.Text.UTF8Encoding($false)

function Get-DevWords([string]$name) {
  switch ($name) {
    'zh_cn.ts' { return @{
        button = '开发者预览'
        title = '开发者预览模式'
        text = '已跳过设置：游戏里没有安装任何东西，所以这里只有页面和屏幕预览可用。要正式使用，请在「设置」页安装插件。'
        exit = '退出预览'
      } }
    'zh_tw.ts' { return @{
        button = '開發者預覽'
        title = '開發者預覽模式'
        text = '已跳過設定：遊戲裡沒有安裝任何東西，所以這裡只有頁面和螢幕預覽可用。要正式使用，請在「設定」頁安裝外掛。'
        exit = '退出預覽'
      } }
    default { return @{
        button = 'Developer Preview'
        title = 'Developer preview'
        text = 'Setup is skipped: nothing is installed in your game, so only these pages and the screen preview work. Install the plugin from Setup to use it for real.'
        exit = 'Exit Preview'
      } }
  }
}

$files = Get-ChildItem -Path $dir -Filter '*.ts' -File | Where-Object { $_.Name -match '^[a-z][a-z]_[a-z][a-z]\.ts$' }
"locale files: $($files.Count)"
$changed = 0; $skipped = @()
foreach ($f in $files) {
  $bytes = [IO.File]::ReadAllBytes($f.FullName)
  $bom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $text = if ($bom) { [Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3) } else { [Text.Encoding]::UTF8.GetString($bytes) }
  if ($text -match 'dev: \{') { $skipped += $f.Name; continue }
  if ($text -notmatch '(?m)^  summary: \{') { $skipped += $f.Name; continue }
  $w = Get-DevWords $f.Name
  $block = @(
    '  dev: {'
    ("    button: '" + $w.button + "',")
    ("    title: '" + $w.title + "',")
    ("    text: '" + $w.text + "',")
    ("    exit: '" + $w.exit + "',")
    '  },'
  ) -join "`n"
  $evaluator = [System.Text.RegularExpressions.MatchEvaluator] { param($m) $block + "`n" + $m.Value }
  $new = [regex]::Replace($text, '(?m)^  summary: \{', $evaluator, 1)
  [IO.File]::WriteAllText($f.FullName, $new, (New-Object System.Text.UTF8Encoding($bom)))
  $changed++
}
"changed: $changed skipped: $($skipped -join ',')"
