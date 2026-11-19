import { GAME_KINDS, GAME_NAMES } from '../setup'
import { setWestplayOpen } from '../useHostStatus'
import { Group, Note, Panel, Row, Status, Switch, Tick } from '../room/parts'
import { banner } from '../room/room'
import { GLOW, useScreenAt } from '../room/screen'
import { type PageProps, screenState } from './page'
import type { CoachSpeakers } from '../useSettings'

/**
 * The truck's screen: where WestPlay Plus is now (its headline), WestPlay Plus on it or the truck's own, and the
 * connection from WestPlay Plus to the game to the screen. On the room's screen, Home, and WestPlay Plus saying the
 * same in a banner.
 */
export function ScreenPage({ status, settings, setup, cw }: PageProps) {
  const w = cw.screen
  const state = screenState(status)
  // Known once the cabin page has said (it owns the state): the switch waits for it.
  const open = status?.westplayOpen ?? null
  useScreenAt(
    state === 'original' ? 'dashboard' : 'home',
    GLOW.home,
    state === 'live'
      ? banner(w.banners.live)
      : state === 'original'
        ? banner(w.banners.original)
        : state === 'unsupported'
          ? banner(w.banners.unsupported)
          : state === 'notInCab'
            ? banner(w.banners.notInCab)
            : state === 'noGame'
              ? banner(w.banners.noGame, true)
              : null,
  )
  const fps = status?.framesPerSecond ?? 0
  // The game connected; else the games set up (else both).
  const kinds = status?.game ? [status.game] : setup.games.length ? setup.games.map((game) => game.kind) : GAME_KINDS
  const gameName = kinds.map((kind) => GAME_NAMES[kind]).join(' · ')
  return (
    <Panel place="page" title={w.titles[state]} sub={w.subs[state]}>
      <Group place={4}>
        <Row
          title={w.show}
          detail={w.showDetail}
          accessory={
            <Switch
              on={open ?? false}
              disabled={open === null || !status?.screenDrawing}
              label={w.show}
              change={(on) => {
                setWestplayOpen(on).catch((error: unknown) => console.error('WestPlay Plus could not be switched', error))
              }}
            />
          }
        />
      </Group>
      <Group title={w.connection} place={5}>
        <Row
          title={w.engine}
          value={status?.error ? cw.values.failed : status ? w.engineRunning : w.engineStarting}
          accessory={<Status tone={status?.error ? 'bad' : status ? 'good' : 'busy'} />}
        />
        <Row
          title={gameName}
          value={status?.gameConnected ? w.gameConnected : w.gameNotRunning}
          accessory={<Status tone={status?.gameConnected ? 'good' : 'idle'} />}
        />
        <Row
          title={w.truckScreen}
          value={
            state === 'unsupported'
              ? w.screenUnsupported
              : status?.screenDrawing
                ? w.screenLive.replace('{fps}', String(fps))
                : w.screenNotInView
          }
          accessory={
            <Status
              tone={
                state === 'unsupported'
                  ? 'idle'
                  : status?.screenDrawing
                    ? 'good'
                    : status?.gameConnected
                      ? 'busy'
                      : 'idle'
              }
            />
          }
        />
      </Group>
      {status?.gameElevated && (
        <Note tone="bad">
          <b>{w.elevated.title}</b> {w.elevated.text}
        </Note>
      )}
      <GpuChooser status={status} settings={settings} cw={cw} />
      <PerformanceChooser settings={settings} cw={cw} />
      <CoachChooser status={status} settings={settings} cw={cw} />
      {status?.error && <Note tone="bad">{status.error}</Note>}
    </Panel>
  )
}

/**
 * The graphics card WestPlay Plus's screen is drawn on: WestPlay Plus's pick (the game's), or one the player chooses
 * when that one stutters, as iOS lists choices (a tick on the chosen, as the onboarding's game folders). The
 * one drawing it now says so; a choice starts WestPlay Plus's screen again on that card. Only with more than one
 * card to choose from.
 */
function GpuChooser({ status, settings: state, cw }: Pick<PageProps, 'status' | 'settings' | 'cw'>) {
  const w = cw.screen
  const { settings, update } = state
  const adapters = status?.adapters ?? []
  if (!settings || adapters.length < 2) return null
  const chosen = adapters.some((adapter) => adapter.id === settings.graphics.gpu) ? settings.graphics.gpu : null
  const choose = (gpu: string | null) => {
    if (gpu !== settings.graphics.gpu) void update({ ...settings, graphics: { gpu } })
  }
  return (
    <>
      <Group title={cw.about.gpu} place={6}>
        <Row
          title={w.gpuAuto}
          detail={w.gpuAutoDetail}
          accessory={chosen === null ? <Tick key="auto" /> : undefined}
          onClick={() => choose(null)}
        />
        {adapters.map((adapter) => (
          <Row
            key={adapter.id}
            title={adapter.name}
            detail={adapter.name === status?.cabAdapter ? w.gpuInUse : undefined}
            accessory={chosen === adapter.id ? <Tick key={adapter.id} /> : undefined}
            onClick={() => choose(adapter.id)}
          />
        ))}
      </Group>
      <Note tone="calm">{w.gpuNote}</Note>
    </>
  )
}

/**
 * How hard WestPlay Plus works for the screen (owner 2026-11-19: an Iris Xe ran the game at 40 fps alone, and fell to
 * single digits with WestPlay Plus: the cabin page's Liquid Glass blurs the live map, and both take the graphics card
 * the game needs). The frames a second sent to the game, how much of its look the page draws, and whether the page
 * pauses while the game isn't showing it, chosen as iOS's segmented controls.
 */
function PerformanceChooser({ settings: state, cw }: Pick<PageProps, 'settings' | 'cw'>) {
  const w = cw.screen.performance
  const { settings, update } = state
  if (!settings) return null
  const performance = settings.performance
  const choose = (next: typeof performance) => {
    if (
      next.frameRate === performance.frameRate &&
      next.effects === performance.effects &&
      next.pauseHidden === performance.pauseHidden
    ) {
      return
    }
    // Reduced effects draws the map without its 3D detail too (the biggest cost after the glass): the Map page's
    // switches show it off, and the player can turn them back on there.
    const map = next.effects === 'reduced' ? { ...settings.map, buildings: false, roads: false } : settings.map
    void update({ ...settings, performance: next, map })
  }
  const segments = (
    title: string,
    options: { key: string; label: string; chosen: boolean; pick(): void }[],
  ) => (
    <Row
      title={title}
      accessory={
        <span className="cz-segments">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-checked={option.chosen}
              onClick={option.pick}
            >
              {option.label}
            </button>
          ))}
        </span>
      }
    />
  )
  return (
    <Group title={w.title} place={8}>
      {segments(w.rate, [
        { key: 'fps60', label: w.rate60, chosen: performance.frameRate === 'fps60', pick: () => choose({ ...performance, frameRate: 'fps60' }) },
        { key: 'fps30', label: w.rate30, chosen: performance.frameRate === 'fps30', pick: () => choose({ ...performance, frameRate: 'fps30' }) },
      ])}
      {segments(w.effects, [
        { key: 'full', label: w.effectsFull, chosen: performance.effects === 'full', pick: () => choose({ ...performance, effects: 'full' }) },
        {
          key: 'reduced',
          label: w.effectsReduced,
          chosen: performance.effects === 'reduced',
          pick: () => choose({ ...performance, effects: 'reduced' }),
        },
      ])}
      <Row
        title={w.pause}
        detail={w.pauseDetail}
        accessory={
          <Switch
            on={performance.pauseHidden}
            label={w.pause}
            change={(pauseHidden) => choose({ ...performance, pauseHidden })}
          />
        }
      />
    </Group>
  )
}

/**
 * Which of a coach's speakers play (owner 2026-11-13): the driver's pair round the seat, or every unit over the
 * passengers' seats, as real coaches have a cockpit system and a passengers' one. A choice here, not in the cab; the
 * passengers' are many speakers at once, which a weak processor feels, so the note under it says how many in the coach
 * driven (its own count, from the host). Greyed out outside a coach (owner 2026-11-13).
 */
function CoachChooser({ status, settings: state, cw }: Pick<PageProps, 'status' | 'settings' | 'cw'>) {
  const w = cw.screen
  const { settings, update } = state
  if (!settings) return null
  const chosen = settings.sound.coach
  const count = status?.coachSpeakers ?? null
  const off = count === null
  const choose = (coach: CoachSpeakers) => {
    if (coach !== chosen) void update({ ...settings, sound: { ...settings.sound, coach } })
  }
  return (
    <>
      <Group title={w.coachSpeakers} place={7} disabled={off}>
        <Row
          title={w.coachDriver}
          detail={w.coachDriverDetail}
          accessory={chosen === 'driver' ? <Tick key="driver" /> : undefined}
          onClick={() => choose('driver')}
        />
        <Row
          title={w.coachPassengers}
          detail={w.coachPassengersDetail}
          accessory={chosen === 'passengers' ? <Tick key="passengers" /> : undefined}
          onClick={() => choose('passengers')}
        />
      </Group>
      <Note tone="calm" disabled={off}>
        {off ? w.coachNoteAny : w.coachNote.replace('{n}', String(count))}
      </Note>
    </>
  )
}
