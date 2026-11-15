# Corpus Playroom Studio

A local, measured 3D viewer built with React Three Fiber and Three.js. All dimensions in the interface and scene files are millimetres; rendering uses metres.

## Run

Double-click `Open LOLA.command` on this Mac to start the local viewer. Keep its Terminal window open while using it. Or run:

```sh
npm ci
npm run dev -- --port 5173
```

Open http://127.0.0.1:5173. `npm run build` produces a static site in `dist/`. The GitHub Pages workflow tests and builds the app for its published URL.

## Projects and set objects

On your first visit, the viewer opens **Sample Project**, featuring the opening of LOLA through *Island — The first sleep*. Open the show name in the header to create a project with an empty set and script, open the sample, or import and export shows. Projects stay in the current browser at the current site address and can be exported as JSON files.

Use ⌘Z to undo project edits and ⇧⌘Z to redo them. Each show has its own history while the workspace is open. Text fields use the browser’s editing history while focused.

In Set, use Add object to place a box, cylinder, sphere or sail. Drag the placement dot to move the object or the diamond to rotate it. The Dimensions tab applies to the selected object and includes suspension details for sails. Drag in the 3D view to orbit, scroll to zoom and right-drag to pan. View stores named camera viewpoints for the current project.

Set, Lighting and Blocking use a persistent strip to choose an entity. In the 3D view, only the active department’s entities show a bright outline on hover and respond to selection. Lighting’s Aim in viewport tool can target stage surfaces.

In Lighting, use Add light and open Aim. Drag the green dot to move the light along a bar or drop it near another bar to remount it. Drag the crosshair to aim, enter its height, or use the tilt dial. Exact mounting and angle controls sit beneath the map. Choose Room alongside the fixture tabs for whole-show lighting. Choose a fixture to open its Aim and Output settings.

## Blocking

Use Blocking to add wooden mannequins and select them by their name tabs. Drag the dot on the stage map to place the character and the diamond to turn it. Exact placement contains numeric values. At 0° the character faces Audience A.

Placement and Pose share the same inspector, with jump buttons at the top. Choose a preset or drag joints in the left, front and right views. Use arrow keys to nudge and Page Up or Down to cycle joint controls. Drag the body or lift handle to change elevation, or enter it in millimetres. Standing height and colour pickers sit under Character setup.

Use the diamonds beside Position, Facing, Pose preset and Elevation to key those properties independently. The Blocking timeline shows one row per character. Use **Property** to switch the whole cast between Position, Facing, Elevation and Pose. In a timeline preview, a new value stays temporary until it is keyed. Editing an existing key updates it.

## Rehearsal timeline

The bottom tabs switch departments while keeping a shared playhead. Click a script line or timeline marker to jump to it. Play previews Set, Lighting and Blocking together. Setup shows base settings without moving the playhead. Timeline shows the design at the current time. Viewport lighting can be shown as designed or viewed under neutral light.

Set shows one row per object. Sails show their Raise keys and other objects are marked Static. Click a row label to select its object, fixture or character. Scroll through longer track lists while the ruler and scrubber stay in view.

In Lighting, **Opening look** jumps to `00:00.0`. Edits to fixture output or room lighting there save directly into the opening timeline look. Fixture dimmer rows share the ruler and playhead. **Record lighting cue** saves pending dimmer keys together. To make a fade, put keys at its start and end and select **Linear** on the final key. GO markers appear automatically at the start of saved lighting changes. Deleting a key preserves its GO. Select a GO and use **Remove GO marker** to remove the marker from the timeline and cue export while keeping the lighting animation. With **Snap to GO** on, dragged keys snap to nearby starts.

**Export lighting…** in the Lighting inspector header previews one manual GO per row and exports a USITT ASCII `.asc` file with an opening cue, intensity levels for every fixture and patch. Confirm each desk channel and venue DMX address. The preview describes transitions in plain language. When lights changing in the same direction have different fade durations, choose one of those times for the exported cue. The project keeps its original keyframes. Resolve overlapping or repeated changes in the timeline. The file uses fixture intensity independently of ambient fill, Theatre blend and preview colours.

Load mixed conventional and ColorSource exports in Phantom ZerOS. The file carries each LED intensity on a temporary channel patch. In Fixture Schedule, use **Change Fixtures / Modes** to swap each temporary fixture to the matching ColorSource model and venue mode, then set its venue address as listed in the ASCII comments. Check the cues and save a `.zos` show file for the desk.

Choose a timeline track, move the playhead, adjust the value, and save the keyframe. Editing at an existing key updates it. Pending values stay available across seeks and property changes. The unsaved keyframe list lets you jump to, save, or discard each edit. Starting playback or opening another project asks what to do with pending edits. Use timeline zoom and pan to work on nearby keys. Select a key to edit its time or transition. Audio shows read-only cue references in LOLA.

In Script, choose Paste script or Edit script, paste plain text and apply it. Each nonblank line appears as written and becomes a timeline entry. Select a line and choose Start scene here to name a section that begins there. Click a scene title to jump, use the arrow to show or hide its lines, and use its action menu to rename it or remove its marker. If a script edit changes a scene’s start line, review the affected scene and choose a new line or remove the marker.

Timing for new entries is estimated at 190 words per minute, with punctuation pauses and minimum line durations. Editing the script preserves keyframe times and retains scene markers on matching lines. Matching entries from older scripts keep their original timing estimates.

## Venue and LOLA defaults

Stage reference spans: 4160 × 5030 mm. The floor follows the mapped outline, including the flared right wall; those spans do not describe a rectangle. Sail centres: (1000,3160), (3160,3160), (1000,1000), (3160,1000). All plan rotations: −45°. Stick length 1600 mm; fabric 1500 × 1850 mm. Sandbag ties 150 mm, sandbag height 150 mm, open ground clearance 50 mm. Upper stick 2200 mm, lower stick 350 mm.

X increases right from the audience corner. Y increases toward the back of the stage. Internally world X = (X − 2080)/1000, world Z = (2515 − Y)/1000. Plan angles map to rotation about world Y, preserving the source plan's stick endpoints.

The later photographic study requested taller sails without supplying a new measurement. This viewer starts with the dimensioned drawing; edit Upper stick height to explore a taller version. Fabric height updates while floor clearance remains fixed.

## Rigging from the lighting plan

Bar runs are traced from J. Evans’s 17 April 2018 lighting plan, revision A. `reference/lighting-plan-trace.json` records the source coordinates and calibration. `src/rigging-plan.js` contains the bundled geometry and proposed support calculations. Rigging links to the [ADC Theatre’s published lighting plan](https://www.adctheatre.com/media/2706/lighting.pdf).

The stage's three longitudinal runs lie approximately 1700, 2502 and 3805 mm from its left reference edge. The other four runs cover the adjacent audience areas, including a transverse run around 199 mm upstage and another about 695 mm in front of the stage. Source bar endpoints are retained, including portions over the audience areas. The floor and right walls now follow the mapped outline.

The PDF's dimension references map separately to 4160 mm across and 5030 mm deep (390.66 and 472.68 PDF points). This traces the source plan; it is not a surveyed measurement or a nominal-scale assumption. Bar positions are plan-derived approximations. The red patch boxes are projected onto their respective bar axes for schematic marker placement. Forty existing overhead patch IDs are shown; circuits 21 and 22 are removed and circuits 43–48 are floor-level, so those are not modelled as overhead points. Socket positions do not establish available rigging points or luminaire locations.

The rear walls are 2600 mm high, as explicitly stated on the plan. Bar height is not specified, so it remains the editable 3200 mm estimate. The pull handles, return ropes, pulleys and closed-sail floor tie-offs are on the face away from the shared audience corner. Threaded ropes retain six threading points each.

Each sail has exactly two suspension ropes, one at each pickup. The solver intersects the sail's plan axis with the finite bars, selects the closest pair on opposite sides of the centre, and places the pickups on the same axis. The outermost pickup is 10% in from its stick end; the other pickup adjusts proportionally to the anchor distances. This proportion permits positive rope tensions to balance the centred vertical load with no horizontal resultant or net moment, while retaining the requested plan rotation. It does not claim that two arbitrary anchors can hold fixed, symmetric pickup positions in equilibrium.

The support panel displays rope lengths and angles above horizontal. Lengths include the vertical gap to pickup points 15 mm above the stick centre. Unsupported poses show a warning instead of inventing extra supports. The model does not simulate sway, rope stretch, cloth dynamics or actor pull loads, and does not establish structural capacities or approved fixing points.

## Assumptions

Rigging height defaults to 3200 mm as an editable estimate, not a venue measurement. Door position and the angled right-wall outline follow both supplied maps; the opening width scales to about 734 mm and its centre is about (4322, 3941) mm. Door opening height remains an assumed 2050 mm. Audience blocks, seat heights, stick thickness, rope diameter and sandbag width are indicative. The fabric has two ropes with six threading points each. Closed folds, operating ropes and floor anchors are schematic geometry, not cloth or rigging physics. The floor anchor bag's required weight is unspecified. No original photo is used as a source of metric height.

## Validation

`npm test` checks the source plan endpoints, equal stick lengths, measured heights, import validation and clearance conflict detection, the seven source bar runs, existing overhead circuit IDs and the finite-bar suspension endpoint transforms, two-rope force and moment balance at several sail angles, and explicit handling of unsupported positions.

## Lighting editor

The Room tab sets the lighting used in Setup and exposes the Theatre blend track in Timeline. Theatre uses the added fixtures plus adjustable ambient fill. Neutral view in the viewport lets you inspect the stage under neutral light independently of the lighting design. The preview supports up to eight fixtures, all optionally shadow-casting.

Choose a fixture preset from Add light. Drag it onto a bar in Aim or use Exact placement. Fixture positions follow the bars when their height changes. Choose a sail target, aim in the viewport, or edit pan, tilt, and target coordinates. Pan 0° is upstage, 90° is stage-right, and positive tilt points down. Beam angle is the full cone angle. Edge softness changes the penumbra. Dimmer is a relative preview level. Colour previews LED mixing or a tungsten gel. The fixture menu provides duplication and removal, and View contains the beam-guide toggle.

Beam guides are wireframe cones extending to the target, not simulated haze. Actual surface illumination and shadows use Three.js spotlights. Sail cloth approximates a translucent fabric and receives projected shadows from either side. Fresnel/profile distributions and colour are approximate: no IES files, shutter cuts, gobos, oval PAR lenses or calibrated illuminance are modelled.

The published Corpus Playroom specification, last updated 17 August 2023, lists:

| Preset | Listed stock | Preview spread |
| --- | ---: | --- |
| Prelude 28/40 650 W profile | 6 | 28–40°, hard edge |
| Selecon Acclaim 650 W Fresnel | 10 | 6–60°, soft wash |
| ColorSource Spot Jr, Deep Blue | 4 | 25–50°, zoom profile |
| ColorSource PAR, Deep Blue | 2 | Adjustable 15–60° circular approximation; installed lens not specified |

The venue lists its ColorSource fixtures as fixed front cover; placing these elsewhere in the viewer is a design proposal, not confirmation that they can be moved. Stock quantities are informational; the editor warns if the chosen count exceeds the published stock.

Sources:
- Venue specification: https://www.adctheatre.com/media/5833/230817-playroomtechspec.pdf
- Acclaim Fresnel optics: https://www.vari-lite.com/b-dam/vari-lite/products/acclaim-fresnel/datasheet/Acclaim_Fresnel_SpecSheet.pdf
- ColorSource Spot Jr optics: https://www.etcconnect.com/Products/Lighting-Fixtures/ColorSource-Spot-jr/Documentation.aspx
- Three.js spotlight geometry and penumbra: https://threejs.org/docs/pages/SpotLight.html

Lighting is included in scene JSON export/import and browser autosave. Older scene files without lighting migrate to Neutral with an empty fixture list, preserving sail and venue settings.
