# BassFour

Four-bar live hook-bass desk for bedroom producers and AI-music finishers.

Suno and loop DAWs leave a chorus that loops and a low end that does not. The bass is a static root, or a smear of different kicks and subs that never share a body. Remixing the prompt adds entropy. Session bassists write four bars you can hum with the vocal muted.

BassFour seats a live FluidR3 electric bass (finger) on that cut, plays floor vs hook, and exports a punch list, WAV, and MIDI.

Live samples only. No oscillators. Audio never leaves the tab.

## Distinct from yesterday and the rest of the line

| Tool | Job |
| --- | --- |
| AltoFour | Four-bar alto sax line (yesterday) |
| LeadFour | Trumpet / violin top figure |
| WalkEight | Eight-bar jazz walking bass |
| PedalFour | Pedal point — one note held |
| SlideTwo | Two-bar 808 slide into the drop |
| DropFour | Four-bar arrangement drop |
| TomTwo | Tom-fill door |
| MarimFour | Wooden ostinato |
| **BassFour** | Four bars of *finger-bass hook* so the chorus has a low end you can hum |

Yesterday’s ship was AltoFour (the reed line). BassFour is the missing hook bass: not a walk, not a pedal, not a slide, not a reed.

X this week: a bassline is still what people mean when they say the hook slaps, and a Suno take that is not pure slop still cannot be finished by remixing the prompt — entropy wins. One human decision, one live bass body, four bars.

## Loop

1. Pick a groove (Dock Light, Canal, Brick Chorus, Sunday Root, Paper Low, Radio Floor).
2. Hear **A · Floor** — kit, quiet piano, upright root. It loops. No figure.
3. Stamp a bass recipe (hook riff, octave pop, ahead of the vocal, hole answer, late figure, ghosts, air then slam, chromatic door).
4. Hear **B · Hook** — the same four bars with the live finger bass. Then it stops. The next section would start on 5.
5. **Bass only** isolates the figure. Mute Root / Move / Pop.
6. Copy the punch list. Bounce a bass WAV or MIDI and drop it on the unfinished chorus.

Space plays B. A is the floor. 4 is bass only. Esc stops.

## Demo

`public/demo.mp4` — the desk, with the bounced Dock Light hook (live kit, piano, and finger bass).

## Pricing

**One-time $29 lifetime.** This is a finite desk, not a cloud meter.

Do not subscribe it. There is no stem server, no monthly sample library, no seat. Recurring billing belongs to AuraMix / MixForge / the Forge Pass ($9 tool or $24 bundle). BassFour should stay a buy-once utility, same family as AltoFour ($29), GlockFour ($29), LeadFour ($29), and HookGrid ($39).

Sell it on **Lemon Squeezy** (merchant of record, VAT handled) as the primary checkout. Mirror on **Gumroad** for the producer crowd that already buys there. List on Product Hunt, r/WeAreTheMusicMakers, and a single X thread with the desk demo — not the App Store, not Plugin Boutique.

Optional later: include BassFour in Forge Pass at no extra charge. Never required for the core tool.

## Best place to sell

1. **Lemon Squeezy** — primary. Handles tax, EU VAT, payouts. Clean checkout for a $29 utility.
2. **Gumroad** — secondary mirror. Bedroom producers already trust one-time music-tool purchases there.
3. **Product Hunt + one focused X thread + r/WeAreTheMusicMakers** — discovery, not the storefront. Link straight to Lemon Squeezy.
4. Avoid App Store / Plugin Boutique for this class of tool; the value is the focused desk + punch list, not a plugin wrapper.

## Stack

TanStack Start + React. Live FluidR3 electric bass (finger) via the gleitz GM soundfont, plus the PreEight kit, piano, and upright for the dry floor. Deploy on Vercel team `release-forge`.

## License

MIT. Built for workinwithai-create.
