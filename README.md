# Swarm Study

Swarm Study is an interactive Particle Swarm Optimization lab for Dr. Rahul Kumar Verma’s soft computing assignment. It demonstrates how a swarm minimizes a two-dimensional objective using individual memory and a shared best position.

[Launch the simulator](https://aakarsh2007.github.io/Soft-Computing-Assignment/) · [Watch the 3:18 captioned demo](https://aakarsh2007.github.io/Soft-Computing-Assignment/demo.webm) · [Source repository](https://github.com/Aakarsh2007/Soft-Computing-Assignment)

## Try the lab

1. Choose Sphere, Rastrigin, or Rosenbrock. Set the particle count, iteration budget, inertia, personal and social coefficients, and random seed. Select **Apply parameters**.
2. Use **Play**, **Pause**, **Step**, **Reset**, or the timeline to explore the run. Each iteration has separate velocity, movement, and memory-update frames.
3. Select a particle to see its position, velocity, cost, and personal best. During the velocity phase, the map draws the inertia, personal, and social vectors tip to tail. The inspector reports the numbers and random multipliers.
4. Compare the landscapes and watch the best-cost chart. For a controlled comparison, keep the seed and other settings fixed while changing one coefficient.

## Algorithm

For each coordinate, the update is:

```text
v' = w v + c1 r1 (pBest − x) + c2 r2 (gBest − x)
x' = x + v'
```

Each coordinate and particle gets independent uniform draws for both random factors. All particles use the previous swarm best in a given iteration. Crossing a boundary clips the offending coordinate and sets its velocity component to zero. The memory stage accepts strictly lower costs. The chart shows log₁₀(1 + best cost). The gold cross marks the known optimum for reference.

## Verification

Select **Load worked example**, then step through the first iteration. For Sphere, A starts at (2, 1) with velocity (1, 0) and cost 5. B starts at (1, 0) with zero velocity and cost 1. With w = 0.5, c1 = c2 = 1, and both random vectors fixed at (0.5, 0.5):

| Quantity | Expected result |
| --- | --- |
| A’s inertia | (0.5, 0) |
| A’s personal pull | (0, 0) |
| A’s social pull | (−0.5, −0.5) |
| A’s new velocity | (0, −0.5) |
| A’s new position | (2, 0.5) |
| A’s new cost and personal-best cost after the memory update | 4.25 |
| Swarm-best cost | 1 |

The verification panel compares the simulator output with these values. The example is independently hand-worked. **Replay lecture example** reproduces iteration 1 of Problem 1 in *Particle Swarm Optimization: Lecture Notes*, pp. 3?4, along y = 0. The automated check confirms P1?s velocity, position, and cost, and P2?s swarm-best position and cost. The animation workflow takes inspiration from [VisuAlgo](https://visualgo.net/en/).

## Run locally

Open `index.html` in a modern browser. The simulator has no runtime dependencies or build step. For automated verification, run `node verify.cjs`.
