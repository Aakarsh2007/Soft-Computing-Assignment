const assert = require('node:assert/strict');
const {run, hand, lecture, defaults, problems} = require('./pso.js');

const [start, velocity, movement, memory] = run(hand);
assert.equal(start.leader.bestScore, 1);
assert.deepEqual(velocity.particles[0].trace.inertia, [0.5,0]);
assert.deepEqual(velocity.particles[0].trace.social, [-0.5,-0.5]);
assert.deepEqual(velocity.particles[0].trace.proposed, [0,-0.5]);
assert.deepEqual(movement.particles[0].pos, [2,0.5]);
assert.equal(movement.particles[0].score, 4.25);
assert.equal(movement.particles[0].bestScore, 5);
assert.equal(memory.particles[0].bestScore, 4.25);
assert.equal(memory.leader.bestScore, 1);

const lesson = run(lecture)[3];
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12);
close(lesson.particles[0].vel[0], -2.58);
close(lesson.particles[0].pos[0], 1.42);
close(lesson.particles[0].score, 2.0164);
close(lesson.leader.best[0], -1.125);
close(lesson.leader.bestScore, 1.265625);

for (const [problem, {bound, f, optimum}] of Object.entries(problems)) {
  assert.equal(f(...optimum), 0);
  const config = {...defaults, problem};
  const frames = run(config);
  assert.deepEqual(frames, run(config));
  assert.equal(frames.length, 1 + config.iterations * 3);
  frames.forEach(({leader, particles}, index) => {
    assert.ok(index === 0 || leader.bestScore <= frames[index-1].leader.bestScore);
    for (const particle of particles) {
      assert.ok(particle.pos.every(x=>Math.abs(x)<=bound));
      assert.equal(particle.score, f(...particle.pos));
      assert.equal(particle.bestScore, f(...particle.best));
    }
  });
}
console.log('Hand calculation, phase ordering, repeatability, and swarm invariants passed.');
