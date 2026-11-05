# Battery Thermal Explorer — five-input model

An English-language interactive predictor using a 24-mode POD + Gaussian RBF model with an affine tail. Five continuous inputs: mass flow 0.005–0.020 kg/s, inlet temperature 25–35 C, initial SOC 10–60%, charge rate 1–5 C and ambient temperature 10–40 C. Initial battery temperature equals ambient. Target SOC is 100%; endpoint time is 3600*(1-SOC0)/C_rate seconds.

304 valid COMSOL cases: 230 training, 34 validation, 40 independent test. GTR011–GTR020 and GVA005–GVA010 exports were unavailable and excluded. Model selection used validation only. Independent test field RMSE: 0.07784396 K; maximum point error: 0.26597716 K. This is comparison to COMSOL, not experimental validation.

The browser evaluates all 230 Gaussian centers and all 24 modes by default; changing the display page only changes which five modes can be inspected. The network fan shows 77 evenly sampled real centers. Upper/Lower switches both the field and the matching vehicle/chassis illustration. Validation loads real held-out COMSOL fields for all 40 test conditions. CSV/PNG and share links include the five inputs. Every input combination is computed live, including values absent from training.

Weights and independent validation fields are public with the owner's authorization. Model binary segments preserve Float64 values exactly. See five_input_verification.json for numerical agreement with Python and behavior checks. No COMSOL/Python service is needed at runtime.

GitHub Pages uses the included GitHub Actions workflow. Serve this directory over HTTP for local use. Website: https://andyyongxiwu.github.io/battery-cooling-explainer/

English and Simplified Chinese are selectable using the top-right language button; preferences persist locally and share URLs include lang=en/zh. An independent Flag Counter (058D) reports this site's visitor countries/regions at https://info.flagcounter.com/058D. The statistics image is served directly by Flag Counter; it is not a screenshot or a shared homepage counter.
