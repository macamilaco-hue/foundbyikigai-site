# Found by Ikigai

Site for foundbyikigai.com.

- `index.html`: landing. Every "Take the FREE Test" button goes to `/quiz/`.
- `quiz/index.html`: the Ikigai tool (quiz, free result, paywall, paid result).
  Built from `ikigai-tool.html` plus the result page redesign handoff.
  Follow up questions: there is no fixed number. The quiz asks one at a time
  until it has enough to give an accurate result, never repeating itself;
  see the PRODUCT RULE comment above checkFollowUps() before changing it.
  Preview without the API: `/quiz/?demo=free` or `/quiz/?demo=paid`.
- `netlify/functions/claude.mjs`: Netlify function the quiz calls at `/api/claude`.
  Needs the `ANTHROPIC_API_KEY` environment variable in the Netlify site.
- `terms.html`, `privacy.html`, `legal.css`: legal pages.

Hosted on Netlify: every push to `main` deploys. `netlify.toml` publishes only
the pages above. Brand files, handoff notes and old tool versions live in the
private `found-by-ikigai-archive` repo, not here.

Payment is not wired yet: "Reveal my full analysis" unlocks without charging.
See `startCheckout()` in `quiz/index.html`.
