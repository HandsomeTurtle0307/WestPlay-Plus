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
if ($stopped -eq 0) {
  Write-Host 'sweep: nothing to stop'
}
exit 0
