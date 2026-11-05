# Battery Cooling Explainer

All-English, browser-based live prediction of battery-pack temperature fields using a validated POD + Gaussian RBF surrogate. Continuous input values are supported, including conditions never used in training.

## Features
- Live prediction of two 161 × 129 internal cut-plane fields.
- Continuous mass-flow input (0.005–0.020 kg/s) and coolant inlet temperature (25–35 °C).
- Actual RBF responses, five POD coefficients and spatial mode inspection.
- Twenty independent COMSOL test conditions with computed comparison errors.
- CSV/PNG export, shareable parameter state and parameter sweeps.

## Fixed model scope
4C constant-current charging, initial SOC 10%, nominal endpoint 80%, 630 s. Initial battery and ambient temperatures are 35 °C. Geometry and capacity are fixed. Cut-plane heights are 86.5 and 8.5 mm. The separate five-input / 100%-SOC model is not used here.

77 training, 20 validation and 20 independent test cases. Test field RMSE is 0.01093214 K; maximum test point error is 0.07138326 K. Validation is against COMSOL, not experiments. Predictions at custom conditions do not include fabricated ground truth.

## Hosting
This is a standalone static website. Enable GitHub Pages with **GitHub Actions** as its source. The included workflow publishes the site on pushes to `main` or `master`.

Expected GitHub Pages path: https://andyyongxiwu.github.io/battery-cooling-explainer/

The model weights and independent validation fields are included with the owner's explicit authorization for public publication. No COMSOL installation, Python service or package installation is required to use the deployed website.

For local use, serve this folder over HTTP. ES modules and binary assets do not load reliably by opening index.html directly as a file.
