# TRN parameter and numerical audit — 2026-11-09

This update follows the supplied TRN.py and TRN_3D.py, not the older TRN_busbar_NAIL implementation. It is a code-to-code comparison, not a new validation against experimental or paper data.

## Updated physics

- Reference UI cell footprint: 40 × 140 relative geometry units; reference mass 720 g (previously the new default inadvertently used half the older 428 g reference mass).
- Cell specific heat: 1.1 J/(g K); electrochemical energy: 25 Ah × 3.9 V × 3600 = 351000 J.
- Reaction states: xc, xa, xs, z, SOC; initial values 0.04, 0.75, 0.15, 0.033, 1.0. Updated Arrhenius rates, SEI evolution and energy terms follow the supplied code. Vent factor and extra 0.1 trigger-cell loss are included.
- Rx = 0.0064686804, Ry = 0.00501592, Rz = 0.0034855184; contact = 0.004; PCM = 0.041811847; FR = 0.010452962. Directional areas: 0.013468, 0.002366, 0.003848. Cell contact resistance now includes both cell half-paths plus contact resistance.
- Busbar resistance: 9.8. Source presets retain their original network, including non-neighbor busbar paths.
- TRN.py: 6 cells, h=25, reaction thresholds=300 K (electrochemical=433.15 K), vent fraction=0.08, original observation duration=1500 s.
- TRN_3D.py: 25 cells, h=5, reaction thresholds=299 K (electrochemical=433.15 K), vent fraction=0.07, original observation duration=4000 s.
- PCM mass 31.58 g and effective heat capacity follow the supplied code; FR mass 3.02 g and specific heat 0.00004197 J/(g K) are preserved. This exceptionally small FR heat capacity merits a separate units review; it has not been silently changed.
- Neither source actually adds radiative heat transfer to its ODE, despite comments/defined constants mentioning radiation.

## Comparison procedure and results

The Python right-hand sides were extracted without executing plotting/export routines. They were integrated with their original segmented LSODA setup: 0.05 s restarts for TRN.py and 1 s restarts for TRN_3D.py, atol=1e-6, rtol=1e-4. All cells begin at 25°C except cell 1, initialized to 172.763636°C as in the sources. Browser computations use adaptive step doubling, implicit heat transfer and bounded reaction increments. Temperature comparisons below use common 1 s output samples over the entire observation window, all cells included.

| Metric | Six cells, 1500 s | 25 cells, 4000 s |
|---|---:|---:|
| Maximum absolute final-temperature difference | 0.07389 K | 0.10841 K |
| Entire history temperature RMSE | 7.7433 K | 9.8735 K |
| Last 200°C crossing, browser | 931.914 s | 3428.551 s |
| Last crossing, first Python 1 s sample above 200°C | 932 s | 3430 s |
| Max crossing-time change with browser tolerance tightened 100× | 0.11265 s | 0.42516 s |
| Max final-temperature change with tolerance tightened 100× | 0.04527 K | 0.08707 K |

The full-history RMSE is NOT the small endpoint error. Abrupt thermal-runaway rises amplify small onset-time differences into substantial instantaneous temperature differences. These results do not establish complete trajectory equivalence. Both preset runs show the same cell propagation ordering as the supplied segmented Python integrations. Browser tolerance used: 0.001; refinement: 0.00001.

## Source issues retained or handled explicitly

1. TRN_3D.py has a busbar term from zero-based node 10 to node 5, but lacks the reverse term. The source preset preserves it for comparison. This is not an energy-conserving reciprocal thermal link. Freeform models use reciprocal contact links instead. A physically corrected source topology requires an explicit research-model revision and revalidation.
2. The Python concentration gate requires state <= 1 exactly. A separate unsegmented LSODA diagnostic produced SOC=1.0000003265 at cell 2 (230 s, six-cell case), disabling its electrochemical reaction and greatly altering propagation. Browser reaction increments remain bounded, preventing this numerical overshoot. Do not infer model behavior from one unconstrained solver run.
3. The freeform geometry extension now uses the TRN_3D.py parameters (h=5, 299 K solid-reaction gates, vent fraction 0.07) and a default 4000 s observation window. It scales reference mass/energy with footprint, contact area with shared edge length, path resistance with depth and environmental exposure with exposed edges. This is an exploratory extension, not a validated physical mapping to arbitrary commercial cell dimensions.
4. Geometry edits to a source preset switch it to freeform physics. A displayed profile label makes this visible. Selecting another ignition cell changes the trigger location consistently. Select cell 1 for the comparisons above.
5. PCM and PCM+FR examples are custom exploratory layouts, not claimed reproductions of the paper's validated configurations. They were checked for finite temperatures and complete time integration.

## UI checks

Selection outline inset by 2 px (no external gap); flat cell shell/terminal colors; each visit opens an empty assembly; visible cell labels count only cells starting at 1. Layouts can be retained with explicit JSON export/import. Source preset loading, worker execution, Chinese/English controls, full-duration integration, chart axes and session reset were exercised in Chrome.

## Source fingerprints

- TRN.py: SHA-256 `52c78ca530463e00f33e60e68eb9f2b8723796c9a434e5971b76cdad49a17f2b`
- TRN_3D.py: SHA-256 `17c00d5aad9815979e9ee95db0cecc260f71ab185bf5868ef4eaa3f91f831d9f`
