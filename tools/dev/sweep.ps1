# Stops WestPlay Plus processes left over from a previous run, so a build can replace its files.
# Run before `tauri dev` / `tauri build` (package.json's predev and prebuild): Windows keeps a running
# westplay.exe locked, and the build would fail copying over it.
$names = @('westplay', 'westplay-host', 'westplay-maps')
$stopped = 0
foreach ($name in $names) {
  $processes = Get-Process -Name $name -ErrorAction SilentlyContinue
  foreach ($process in $processes) {
    try {
      Stop-Process -Id $process.Id -Force -ErrorAction Stop
      $stopped++
      Write-Host "sweep: stopped $name ($($process.Id))"
    } catch {
      Write-Host "sweep: couldn't stop $name ($($process.Id)): $($_.Exception.Message)"
    }
  }
}

# A WestPlay that's killed (or that panics) leaves its WebView2 browsers running: they outlive it, hold their
# user-data folder open, and the next start's WebView then fails with whatever HRESULT a busy profile gives
# back — 0x800700AA, 0x8000FFFF, 0x800705B4, 0x80080005 have all been seen, each looking like a different
# bug. Stop them too, after the app is gone (they can still be starting up then, hence the retries).
for ($attempt = 0; $attempt -lt 10; $attempt++) {
  $browsers = @(
    Get-CimInstance Win32_Process -Filter "Name='msedgewebview2.exe'" -ErrorAction SilentlyContinue |
      Where-Object { $_.CommandLine -match 'webview-exe-name=westplay' }
  )
  if ($browsers.Count -eq 0) { break }
  foreach ($browser in $browsers) {
    try {
      Stop-Process -Id $browser.ProcessId -Force -ErrorAction Stop
      $stopped++
      Write-Host "sweep: stopped a WebView2 browser left behind ($($browser.ProcessId))"
    } catch {
      Write-Host "sweep: couldn't stop WebView2 browser $($browser.ProcessId): $($_.Exception.Message)"
    }
  }
  Start-Sleep -Milliseconds 400
}

if ($stopped -eq 0) {
  Write-Host 'sweep: nothing to stop'
}
exit 0
