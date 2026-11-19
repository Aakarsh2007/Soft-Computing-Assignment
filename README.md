# Swarm Study

Swarm Study is an interactive Particle Swarm Optimization (PSO) lab built for Dr. Rahul Kumar Verma's Soft Computing assignment. It lets you watch a swarm of particles cooperate to minimize a two-dimensional objective function — combining each particle's own memory with the swarm's shared best discovery to converge on the global minimum.

[Launch the simulator](https://aakarsh2007.github.io/Soft-Computing-Assignment/) · [Watch the 3:18 captioned demo](https://aakarsh2007.github.io/Soft-Computing-Assignment/demo.webm) · [Source repository](https://github.com/Aakarsh2007/Soft-Computing-Assignment)

---

## What is Particle Swarm Optimization?

PSO is a population-based metaheuristic inspired by the social behaviour of bird flocking and fish schooling. A swarm of candidate solutions (particles) moves through the search space. Each particle adjusts its velocity based on three forces:

- **Inertia** — keeps it moving in its current direction
- **Personal (cognitive) pull** — attracts it back toward its own best-known position
- **Social pull** — attracts it toward the best position found by any particle in the swarm

Over many iterations the swarm collectively narrows in on the global minimum without needing gradient information.

---

## Features

- **Three objective functions** — Sphere (single smooth basin), Rastrigin (many local minima), and Rosenbrock (narrow curved valley)
- **Full parameter control** — particle count, iteration budget, inertia w, personal coefficient c₁, social coefficient c₂, and a reproducible random seed
- **Frame-by-frame playback** — each iteration is split into three sub-frames: velocity update, position update, and memory update
- **Vector breakdown** — selecting a particle during the velocity phase draws the inertia, personal, and social vectors tip-to-tail on the map and reports the exact numbers and random multipliers
- **Live inspector** — shows position, velocity, cost, and personal best for any selected particle at every frame
- **Convergence chart** — plots log₁₀(1 + best cost) after each completed iteration so you can compare runs at a glance
- **Worked-example verification** — a hand-calculated two-particle example is embedded; the simulator checks its own output against the expected values and highlights any mismatch
- **Lecture-notes replay** — reproduces iteration 1 of the one-dimensional example from the course lecture notes for direct comparison
- **No dependencies, no build step** — pure HTML, CSS, and vanilla JavaScript; open `index.html` and go

---

## Try the lab

1. **Choose a function.** Sphere is the easiest landscape to understand; Rastrigin shows how the swarm escapes local traps; Rosenbrock tests convergence along a curved ridge.
2. **Set parameters.** Adjust particle count, iteration budget, inertia, personal and social coefficients, and the random seed. Click **Apply parameters** to initialise the swarm.
3. **Explore the run.** Use **Play**, **Pause**, **Step**, **‹ Back**, **Reset**, or drag the timeline scrubber. The speed selector lets you slow down to 0.5× or fast-forward to 3×.
4. **Inspect a particle.** Pick any particle from the dropdown. During the velocity phase the map overlays the three component vectors and the inspector panel shows the exact arithmetic.
5. **Compare experiments.** Fix the seed and change one coefficient at a time to isolate its effect on convergence speed and final cost.

---

## Algorithm

For each particle and each coordinate the velocity and position update is:

```text
v' = w·v  +  c1·r1·(pBest − x)  +  c2·r2·(gBest − x)
x' = x + v'
```

| Symbol | Meaning |
| --- | --- |
| w | Inertia weight |
| c1 | Personal (cognitive) coefficient |
| c2 | Social coefficient |
| r1, r2 | Independent uniform random draws in [0, 1] per coordinate per particle |
| pBest | Particle's own best position so far |
| gBest | Best position found by any particle so far |

**Boundary handling** — if a coordinate moves outside [−5, 5] it is clipped to the boundary and that velocity component is set to zero.

**Memory update** — a particle replaces its personal best only when the new cost is strictly lower than the stored best.

**Chart** — the y-axis shows log₁₀(1 + best cost) so the scale stays readable across functions with very different cost magnitudes. The gold cross marks the known global optimum.

---

## Verification

Select **Load worked example**, then step through the first iteration. For Sphere, particle A starts at (2, 1) with velocity (1, 0) and cost 5. Particle B starts at (1, 0) with zero velocity and cost 1. With w = 0.5, c₁ = c₂ = 1, and both random vectors fixed at (0.5, 0.5):

| Quantity | Expected result |
| --- | --- |
| A's inertia component | (0.5, 0) |
| A's personal pull | (0, 0) |
| A's social pull | (−0.5, −0.5) |
| A's new velocity | (0, −0.5) |
| A's new position | (2, 0.5) |
| A's new cost (= new personal best) | 4.25 |
| Swarm-best cost | 1 (B unchanged) |

The verification panel compares the simulator's live output against these hand-worked values and flags any discrepancy.

**Replay lecture example** reproduces iteration 1 of Problem 1 from *Particle Swarm Optimization: Lecture Notes* (pp. 3–4) along y = 0. The automated check confirms P1's velocity, position, and cost, and P2's swarm-best position and cost.

The step-by-step animation workflow takes inspiration from [VisuAlgo](https://visualgo.net/en/).

---

## Project structure

```
index.html   — markup and UI layout
style.css    — all styling (no external CSS framework)
pso.js       — PSO engine: seeded RNG, particle state, iteration logic
app.js       — rendering, animation loop, UI wiring
verify.cjs   — Node.js script for automated headless verification
```

---

## Run locally

**Browser (no server needed)**
```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

**Local dev server (avoids any browser security restrictions)**
```bash
npx serve .
# or
python3 -m http.server 8080
```
Then visit `http://localhost:8080`.

**Automated verification**
```bash
node verify.cjs
```

No `npm install` or build step is required.

---

## Made by

- **Sparsh Chaudhary** — LIT2024052
- **Aakarsh Saxena** — LIT2024023

Submitted for the Soft Computing course under Dr. Rahul Kumar Verma.
