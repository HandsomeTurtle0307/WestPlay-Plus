//! QQ Music: its own web player (y.qq.com), in a WebView of its own, hidden under the cabin page. The QQ
//! Music app the player sees is WestPlay's own (ui/src/cabin/apps/qqMusic); the page both plays and answers,
//! and a script in it (`qq_music.js`) asks it what the app wants to know — its own API (`musicu.fcg`), with
//! the page's session — and plays what the app picks in an element of its own, given the address QQ Music's
//! own player would have used. So a song picked in the cab plays at once, as Apple Music's does, rather than
//! the page's own player being driven by presses.
//!
//! Signing in is QQ Music's own page, in a window on the PC's desktop (`signin.rs`), on this WebView's profile
//! (one of its own: signing out forgets QQ Music's cookies alone). Nothing of the account passes through
//! WestPlay: the page's session stays in the page, and what comes out is what the app shows.
//!
//! Its sound comes from the truck's own speakers, as the other players' does (`cab_sound.js`, told the truck's
//! speakers, the driver's head and the camera).

use std::cell::{Cell, RefCell};
use std::path::Path;

use crate::signin::{self, Progress, SignInWindow};
use crate::speakers::{self, Equalizer, Head, Speaker};
use crate::webview::{self, OffscreenWebView, Stage};

/// QQ Music's web player.
pub const HOME: &str = "https://y.qq.com/";

/// What its WebView shows while the app is closed: a page of nothing, which costs nothing (the browser, and
/// its memory, stay: y.qq.com's own page is heavy).
const PUT_AWAY: &str = "about:blank";

/// What the cabin page asks of QQ Music (`qqMusic` in ui/src/shared/host.ts).
#[derive(Debug, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(tag = "action", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum Command {
    /// Run (hidden), saying whether it's signed in: the QQ Music app is open.
    Start,
    /// QQ Music's sign-in, in a window on the desktop (its QR code is on the page there).
    SignIn,
    /// Forget the sign-in, and start again signed out.
    SignOut,
    /// A question for QQ Music, answered with the same `id`.
    Ask {
        id: u32,
        question: Question,
    },
    /// Play a list of songs (`songs`, as the app has them) from the one at `at`, in this app's own player.
    Play {
        #[serde(default, skip_serializing_if = "Option::is_none")]
        songs: Option<Vec<Track>>,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        at: Option<u32>,
    },
    Pause,
    Next,
    Previous,
    Seek {
        seconds: f64,
    },
    /// The playing element's volume, 0 to 100 (the cab's fades go through this one, as the other players':
    /// the level itself, not a factor of it).
    Volume {
        percent: f64,
    },
    Shuffle {
        on: bool,
    },
    Repeat {
        mode: Repeat,
    },
    /// The app closed: its page put away (a light page in its place), so QQ Music's own work and memory go
    /// while its browser stays — a browser made again is slow, a page loaded again is not.
    Stop,
}

impl Command {
    /// For QQ Music's page (all but the host's own: running, signing in and out, being put away).
    fn for_page(&self) -> bool {
        !matches!(self, Command::Start | Command::SignIn | Command::SignOut | Command::Stop)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Repeat {
    Off,
    All,
    One,
}

/// What the app may ask of QQ Music, answered by its page (`qq_music.js`).
#[derive(Clone, Debug, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(tag = "ask", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum Question {
    /// What its search finds: songs, playlists, albums, singers (`page` from 1).
    Search {
        query: String,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        page: Option<u32>,
    },
    /// A playlist's page (its songs), `page` 2 on being more of them.
    Playlist {
        id: String,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        page: Option<u32>,
    },
    /// An album's page.
    Album { id: String },
    /// A chart's page (its id, as its home's cards have it): its songs, in its own order. What a home has
    /// without an account.
    Chart { id: String },
    /// A singer's page: their songs, and their albums.
    Artist { id: String },
    /// Home: what QQ Music recommends.
    Home,
    /// The account's own library: its playlists.
    Library,
    /// A song's words.
    Lyrics { id: String },
}

/// A song of a list (a search's, a playlist's), as the cab shows it.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Track {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub cover: Option<String>,
    pub duration: f64,
    /// A song its account may not play without a subscription (the cab says so).
    pub vip: bool,
}

/// A playlist, album or singer, in a list or a search's results.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Item {
    pub id: String,
    pub title: String,
    pub subtitle: String,
    pub image: Option<String>,
    /// `playlist`, `album`, `artist` or `chart`: which page it opens.
    pub kind: String,
}

/// A row of a page: its title, and what it holds.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Shelf {
    pub title: String,
    pub items: Vec<Item>,
    /// A row of songs (a chart's), the cab playing one straight from it (`items` empty then): a home you
    /// can play from without opening anything.
    pub tracks: Vec<Track>,
}

/// A page of QQ Music's own (home, the library): rows of it.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Sections {
    pub shelves: Vec<Shelf>,
    /// The library's: whether it's the account's (a library signed out has no rows).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub signed_in: Option<bool>,
}

/// A search's results.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Results {
    pub songs: Vec<Track>,
    pub playlists: Vec<Item>,
    pub albums: Vec<Item>,
    pub artists: Vec<Item>,
    /// More songs than it sent: the next page's worth.
    pub more: bool,
}

/// A playlist's or album's page: what it is, and its songs.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Collection {
    pub item: Item,
    pub description: String,
    pub year: Option<i32>,
    pub tracks: Vec<Track>,
    /// More songs than it sent: the next page's worth (a playlist's, as its songs come in hundreds).
    pub more: bool,
}

/// A singer's page: what they are, and their songs.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ArtistPage {
    pub item: Item,
    pub top: Vec<Track>,
}

/// A line of a song's words, at its second.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Line {
    pub at: f64,
    pub text: String,
}

/// QQ Music's answer to one question (`id` as asked): the one field its question asked for.
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Answer {
    #[serde(rename(serialize = "id"))]
    pub answer: u32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub search: Option<Results>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub collection: Option<Collection>,
    /// A chart's page (the same as a playlist's: what it is, and its songs).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub chart: Option<Collection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub artist: Option<ArtistPage>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub home: Option<Sections>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub library: Option<Sections>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lyrics: Option<Vec<Line>>,
    /// Why it couldn't answer (its API refused, or the page has no such song): the app says so.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub said: Option<String>,
}

/// What QQ Music plays, and where in it (its page's own element, or the app's).
#[derive(Clone, Debug, Default, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Playback {
    pub track: Option<Track>,
    pub playing: bool,
    /// Asked to play, the sound not yet there: the app counts no time.
    pub loading: bool,
    pub position: f64,
    pub duration: f64,
    pub volume: Option<f64>,
    /// The app's own queue: shuffled, and how it repeats; how many songs it holds, and where it is.
    pub shuffle: bool,
    pub repeat: Option<Repeat>,
    pub queue: u32,
    pub index: i32,
    /// Why the song asked for can't play, when it can't (`subscription`: the account's doesn't cover it,
    /// `unplayable`: QQ Music gave no address for it). The cab says it, rather than showing a song that never
    /// starts.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub said: Option<String>,
}

/// Whether it's signed in, and playing.
#[derive(Clone, Copy, Debug, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub signed_in: bool,
    pub playing: bool,
}

pub struct QQMusic {
    view: OffscreenWebView,
    sign_in: RefCell<Option<SignInWindow>>,
    pending: RefCell<Vec<Report>>,
    /// What the page was told of the cab, sent again when it loads anew.
    told: RefCell<Told>,
    /// Put away (its app closed): its next `Start` loads its page again.
    idle: Cell<bool>,
}

/// What the host tells QQ Music's page of the cab (never the cabin page's to send): the truck's speakers
/// (`None`: as it is, a truck whose speakers aren't known), the driver's head, and the camera outside (its
/// distance, metres; 0: not known). As the other players' (spotify.rs).
#[derive(Debug, PartialEq, serde::Serialize)]
#[serde(tag = "action", rename_all = "camelCase")]
enum Cab {
    Speakers {
        speakers: Option<Vec<Speaker>>,
    },
    Head {
        #[serde(flatten)]
        head: Head,
    },
    Outside {
        on: bool,
        distance: f32,
    },
    /// The player's tone (the cab's Settings › Sound): bass, mid and treble, dB each.
    Equalizer {
        #[serde(flatten)]
        equalizer: Equalizer,
    },
    /// The music's spectrum wanted (the cab's Equalizer open) or not: the page says it as it plays.
    Spectrum {
        on: bool,
    },
}

/// What the page was told last of the cab (sent again to a page that loaded anew).
#[derive(Debug, Default)]
struct Told {
    speakers: Option<Option<Vec<Speaker>>>,
    head: Option<Head>,
    camera: Option<(bool, f32)>,
    equalizer: Option<Equalizer>,
    spectrum: Option<bool>,
    messages: [Option<String>; 5],
}

impl QQMusic {
    /// Its WebView (performance.rs counts its processes).
    pub fn view(&self) -> &OffscreenWebView {
        &self.view
    }

    /// Opens QQ Music's web player in a WebView of `stage`'s frame (`width` x `height`), hidden under the
    /// cabin page.
    pub fn start(stage: &Stage, width: u32, height: u32, user_data: &Path) -> Result<Self, webview::Error> {
        let view = OffscreenWebView::new(stage, width, height, user_data)?;
        view.log_as("qq music")?;
        view.show(false)?;
        stage.add(&view, false)?;
        // The truck speakers' sound first: the page's script makes its own of it.
        view.add_startup_script(concat!(include_str!("cab_sound.js"), "\n", include_str!("qq_music.js")))?;
        view.navigate(HOME)?;
        Ok(Self {
            view,
            sign_in: RefCell::new(None),
            pending: RefCell::new(Vec::new()),
            told: RefCell::default(),
            idle: Cell::new(false),
        })
    }

    pub fn command(&self, command: &Command) -> windows::core::Result<()> {
        match command {
            // Its page again, put away before (there's nothing to load otherwise: it's already there).
            Command::Start => {
                if self.idle.replace(false) {
                    return self.view.navigate(HOME);
                }
                Ok(())
            }
            Command::SignIn => {
                self.open_sign_in(&signin::QQ_MUSIC);
                Ok(())
            }
            Command::SignOut => {
                self.view.delete_cookies()?;
                self.view.navigate(HOME)
            }
            Command::Stop => {
                self.idle.set(true);
                self.view.navigate(PUT_AWAY)
            }
            _ if command.for_page() => self.view.post_json(&serde_json::to_string(command).unwrap_or_default()),
            _ => Ok(()),
        }
    }

    /// QQ Music's sign-in window, opened (or brought forward if it is).
    fn open_sign_in(&self, site: &'static signin::Site) {
        let mut sign_in = self.sign_in.borrow_mut();
        if let Some(window) = sign_in.as_ref() {
            window.bring_forward();
            return;
        }
        match SignInWindow::open(self.view.environment(), site) {
            Ok(window) => *sign_in = Some(window),
            Err(e) => crate::startup::mark(&format!("host: the QQ Music sign-in window couldn't open: {e}")),
        }
    }

    /// The truck's speakers (none: its sound plays as it is), the driver's head, and whether the camera is
    /// outside the cab and how far: the page is told each as it changes (as the other players': spotify.rs).
    pub fn cab(
        &self,
        speakers: Option<&[Speaker]>,
        head: Head,
        outside: bool,
        distance: f32,
        equalizer: Equalizer,
        spectrum: bool,
    ) -> windows::core::Result<()> {
        let mut told = self.told.borrow_mut();
        // The head first: the speakers' loudness is set from where it is as they're placed.
        if told.head != Some(head) && head.is_sound() {
            told.head = Some(head);
            let message = serde_json::to_string(&Cab::Head { head }).unwrap_or_default();
            told.messages[1] = Some(message.clone());
            self.view.post_json(&message)?;
        }
        if told.speakers.as_ref().map(Option::as_deref) != Some(speakers) {
            let speakers = speakers.map(<[_]>::to_vec);
            told.speakers = Some(speakers.clone());
            let message = serde_json::to_string(&Cab::Speakers { speakers }).unwrap_or_default();
            told.messages[0] = Some(message.clone());
            self.view.post_json(&message)?;
        }
        let camera = (outside, if outside { (distance * 4.0).round() / 4.0 } else { 0.0 });
        if told.camera != Some(camera) && camera.1.is_finite() {
            told.camera = Some(camera);
            let message = serde_json::to_string(&Cab::Outside { on: camera.0, distance: camera.1 }).unwrap_or_default();
            told.messages[2] = Some(message.clone());
            self.view.post_json(&message)?;
        }
        if told.equalizer != Some(equalizer) {
            told.equalizer = Some(equalizer);
            let message = serde_json::to_string(&Cab::Equalizer { equalizer }).unwrap_or_default();
            told.messages[3] = Some(message.clone());
            self.view.post_json(&message)?;
        }
        if told.spectrum != Some(spectrum) {
            told.spectrum = Some(spectrum);
            let message = serde_json::to_string(&Cab::Spectrum { on: spectrum }).unwrap_or_default();
            told.messages[4] = Some(message.clone());
            self.view.post_json(&message)?;
        }
        Ok(())
    }

    /// What QQ Music's page said since the last call, and the sign-in window closing.
    pub fn take_reports(&self) -> Vec<Report> {
        let mut reports = std::mem::take(&mut *self.pending.borrow_mut());
        let progress = self.sign_in.borrow().as_ref().map(SignInWindow::progress);
        if let Some(progress @ (Progress::SignedIn | Progress::Closed)) = progress {
            self.sign_in.borrow_mut().take();
            // Its cookies are set on this profile: the page again, signed in (or not).
            let _ = self.view.navigate(HOME);
            reports.push(Report::SignInWindow(progress == Progress::SignedIn));
        }
        for message in self.view.take_page_messages() {
            if let Some(bars) = speakers::read_spectrum(&message) {
                reports.push(Report::Spectrum(bars));
                continue;
            }
            match read_message(&message) {
                Some(Message::SignIn) => self.open_sign_in(&signin::QQ_MUSIC),
                // A page loaded anew: the cab as it is (speakers, head, camera).
                Some(Message::Ready) => {
                    for told in self.told.borrow().messages.iter().flatten() {
                        let _ = self.view.post_json(told);
                    }
                }
                Some(Message::Speakers(said)) => log!("[qq music] speakers: {said}"),
                Some(Message::State(state)) => reports.push(Report::State(state)),
                Some(Message::Playback(playback)) => reports.push(Report::Playback(playback)),
                Some(Message::Answer(answer)) => reports.push(Report::Answer(answer)),
                None => {}
            }
        }
        reports
    }

    /// Whether the WebView failed since the last call (it's then closed and started again when needed).
    pub fn failed(&self) -> bool {
        self.view.take_failure().is_some()
    }

    /// Takes the WebView off the frame; it closes as it's dropped.
    pub fn close(self, stage: &Stage) {
        let _ = stage.remove(&self.view);
    }
}

/// What QQ Music's page says (`qq_music.js`).
#[derive(Debug, PartialEq)]
pub enum Report {
    State(State),
    Playback(Option<Box<Playback>>),
    Answer(Box<Answer>),
    Spectrum(Vec<u8>),
    SignInWindow(bool),
}

/// A message of QQ Music's page (`qq_music.js`).
#[derive(Debug, PartialEq)]
enum Message {
    /// Its "登录" pressed: the sign-in window, please.
    SignIn,
    /// The page loaded (anew): it's told the cab again.
    Ready,
    /// What the truck's speakers made of its sound, for the log.
    Speakers(String),
    State(State),
    Playback(Option<Box<Playback>>),
    Answer(Box<Answer>),
}

fn read_message(message: &str) -> Option<Message> {
    let value: serde_json::Value = serde_json::from_str(message).ok()?;
    if value.get("signIn").and_then(serde_json::Value::as_bool) == Some(true) {
        return Some(Message::SignIn);
    }
    if value.get("ready").and_then(serde_json::Value::as_bool) == Some(true) {
        return Some(Message::Ready);
    }
    if let Some(said) = value.get("speakers").and_then(serde_json::Value::as_str) {
        // Only the page's own two sayings, and short: nothing else of the page reaches the log.
        let known = said == "no media element found" || said.starts_with("through the speakers (");
        return (known && said.len() <= 60).then(|| Message::Speakers(said.to_owned()));
    }
    if value.get("answer").is_some() {
        return serde_json::from_value::<Answer>(value).ok().map(|answer| Message::Answer(Box::new(answer)));
    }
    if let Some(playback) = value.get("playback") {
        if playback.is_null() {
            return Some(Message::Playback(None));
        }
        return serde_json::from_value::<Playback>(playback.clone()).ok().map(|p| Message::Playback(Some(Box::new(p))));
    }
    serde_json::from_value::<State>(value).ok().map(Message::State)
}

/// `{"type":"qqMusic","signedIn":true,"playing":false}` for the cabin page (`null` fields when QQ Music isn't
/// running).
pub fn state_message(state: Option<&State>) -> String {
    serde_json::json!({
        "type": "qqMusic",
        "signedIn": state.map(|s| s.signed_in),
        "playing": state.map(|s| s.playing),
    })
    .to_string()
}

/// `{"type":"qqMusicPlayback","playback":{…}}` (`null`: nothing plays).
pub fn playback_message(playback: Option<&Playback>) -> String {
    serde_json::json!({ "type": "qqMusicPlayback", "playback": playback }).to_string()
}

/// `{"type":"qqMusicAnswer","answer":{…}}` for the cabin page.
pub fn answer_message(answer: &Answer) -> String {
    let mut message = serde_json::to_value(answer).unwrap_or_default();
    message["type"] = "qqMusicAnswer".into();
    message.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_cabin_pages_commands() {
        assert_eq!(serde_json::from_str::<Command>(r#"{"action":"next"}"#).unwrap(), Command::Next);
        assert_eq!(
            serde_json::from_str::<Command>(r#"{"action":"seek","seconds":12.5}"#).unwrap(),
            Command::Seek { seconds: 12.5 }
        );
        assert_eq!(
            serde_json::from_str::<Command>(r#"{"action":"volume","percent":40}"#).unwrap(),
            Command::Volume { percent: 40.0 }
        );
        assert_eq!(
            serde_json::from_str::<Command>(r#"{"action":"repeat","mode":"one"}"#).unwrap(),
            Command::Repeat { mode: Repeat::One }
        );
    }

    #[test]
    fn asks_the_page_its_questions() {
        let ask = Command::Ask { id: 7, question: Question::Search { query: "晴天".into(), page: Some(2) } };
        // Its page reads the question by what it asks (`ask`), and nothing else of it.
        assert_eq!(
            serde_json::to_string(&ask).unwrap(),
            r#"{"action":"ask","id":7,"question":{"ask":"search","query":"晴天","page":2}}"#
        );
        assert_eq!(serde_json::to_string(&Question::Library).unwrap(), r#"{"ask":"library"}"#);
    }

    #[test]
    fn reads_what_the_page_plays() {
        let playback: Playback = serde_json::from_str(
            r#"{"track":{"id":"a","title":"晴天","artist":"周杰伦","album":"","cover":"https://y.qq.com/c.jpg","duration":269},
                "playing":true,"loading":false,"position":31.5,"duration":269,"volume":80,
                "shuffle":false,"repeat":"off","queue":10,"index":2}"#,
        )
        .unwrap();
        assert_eq!(playback.track.as_ref().unwrap().title, "晴天");
        assert_eq!(playback.position, 31.5);
        assert_eq!(playback.queue, 10);
        assert_eq!(playback.repeat, Some(Repeat::Off));
        let message = playback_message(Some(&playback));
        assert!(message.contains(r#""type":"qqMusicPlayback""#));
        assert!(message.contains(r#""title":"晴天""#));
        assert!(message.contains(r#""queue":10"#));
        assert!(playback_message(None).contains("\"playback\":null"));
    }

    #[test]
    fn reads_its_answers() {
        let answer: Answer = serde_json::from_str(
            r#"{"answer":3,"search":{"songs":[{"id":"m1","title":"晴天","artist":"周杰伦","vip":false}],
                "playlists":[{"id":"1","title":"华语","kind":"playlist"}],"more":true}}"#,
        )
        .unwrap();
        assert_eq!(answer.answer, 3);
        assert_eq!(answer.search.as_ref().unwrap().songs[0].title, "晴天");
        assert!(answer.search.as_ref().unwrap().more);
        let message = answer_message(&answer);
        assert!(message.contains(r#""id":3"#));
        assert!(message.contains(r#""type":"qqMusicAnswer""#));
        // Its page's own name for it is gone: the cab reads `id`.
        assert!(!message.contains(r#""answer":3"#));
    }

    #[test]
    fn passes_on_only_what_the_app_shows() {
        // Anything else the page might say is dropped here, as the other players' do.
        assert_eq!(
            read_message(r#"{"playback":{"track":null,"playing":false,"cookies":"uin=1"}}"#),
            Some(Message::Playback(Some(Box::new(Playback::default()))))
        );
        assert_eq!(
            read_message(r#"{"signedIn":true,"playing":false}"#),
            Some(Message::State(State { signed_in: true, playing: false }))
        );
        assert_eq!(read_message(r#"{"speakers":"something else entirely"}"#), None);
    }
}
