# MBA NPV Calculator

Is an MBA worth it? A single-page calculator that treats the degree as an
investment. It compares an MBA career path against staying put and shows:

- **NPV, IRR and payback period** of the incremental cash flows
- **Total programme cost**: net tuition, living costs and loan interest
- **Retirement impact**: projected portfolio at your target age on each path,
  and the monthly income it supports at a chosen withdrawal rate
- Charts for cumulative discounted cash flow, portfolio growth, annual income
  breakdown, loan amortisation and salary trajectory

Comes with presets for several business schools (Saïd, LBS, Judge, INSEAD, Harvard,
Wharton, Stanford, HEC Paris) and Base, Bull, Bear and No-lift scenarios. Every input
is a slider, and you can click the school name and badge in the header to edit them.

## Usage

Open `index.html` in a browser. There is no build step and no backend.
[Chart.js](https://www.chartjs.org/) loads from jsDelivr with a Subresource
Integrity hash, and a strict Content-Security-Policy blocks all other network access.

## Disclaimer

This is an illustrative model, not financial advice. The tuition figures in the
presets are approximate published fees and go out of date quickly, so check them
against each school's website.
