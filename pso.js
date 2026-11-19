(function (root) {
  const problems = {
    sphere: { name: 'Sphere', formula: 'x² + y²', bound: 5, optimum: [0, 0], f: (x, y) => x*x + y*y },
    rastrigin: { name: 'Rastrigin', formula: '20 + x² + y² − 10[cos(2πx) + cos(2πy)]', bound: 5.12, optimum: [0, 0], f: (x,y) => 20+x*x+y*y-10*(Math.cos(2*Math.PI*x)+Math.cos(2*Math.PI*y)) },
    rosenbrock: { name: 'Rosenbrock', formula: '(1 − x)² + 100(y − x²)²', bound: 3, optimum: [1, 1], f: (x,y) => (1-x)**2+100*(y-x*x)**2 }
  };
  const defaults = { problem:'sphere', count:18, w:0.7, c1:1.5, c2:1.5, seed:42, iterations:60 };
  const hand = { ...defaults, count:2, w:0.5, c1:1, c2:1, iterations:2, example:true };
  const lecture = { ...defaults, count:3, iterations:1, example:'lecture' };
  const lectureFactors = [[0.61,0.86],[0.75,0.25],[0.32,0.84]];
  function seeded(seed) {
    let state = seed >>> 0;
    return () => {
      state = (Math.imul(1664525,state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
  const best = particles => particles.reduce((a,b) => b.bestScore < a.bestScore ? b : a);
  function run(config) {
    const { f, bound } = problems[config.problem];
    const rng = seeded(config.seed);
    const make = (pos, vel) => ({ pos, vel, score:f(...pos), best:pos, bestScore:f(...pos) });
    let particles = config.example === 'lecture'
      ? [4,-3,2].map(x => make([x,0],[0,0]))
      : config.example
      ? [make([2,1],[1,0]),make([1,0],[0,0])]
      : Array.from({length:config.count}, () => make([0,0].map(()=>(rng()*2-1)*bound),[0,0].map(()=>(rng()*2-1)*bound*0.15)));
    let leader = best(particles);
    const frame = (iteration,phase) => ({ iteration, phase, particles, leader });
    const frames = [frame(0,'Initialize')];
    for (let iteration=1; iteration<=config.iterations; iteration++) {
      particles = particles.map((p,i) => {
        const factor = term => config.example === 'lecture' ? [lectureFactors[i][term],0] : [0,0].map(()=>config.example ? 0.5 : rng());
        const r1 = factor(0);
        const r2 = factor(1);
        const inertia = p.vel.map(v=>config.w*v);
        const cognitive = p.pos.map((x,i)=>config.c1*r1[i]*(p.best[i]-x));
        const social = p.pos.map((x,i)=>config.c2*r2[i]*(leader.best[i]-x));
        const proposed = inertia.map((v,i)=>v+cognitive[i]+social[i]);
        return { ...p, trace:{r1,r2,inertia,cognitive,social,proposed, previous:p.pos, previousVelocity:p.vel, previousBest:p.best, guide:leader.best} };
      });
      frames.push(frame(iteration,'Calculate velocity'));
      particles = particles.map(p => {
        const raw = p.pos.map((x,i)=>x+p.trace.proposed[i]);
        const pos = raw.map(x=>Math.max(-bound,Math.min(bound,x)));
        const vel = p.trace.proposed.map((v,i)=>pos[i]===raw[i]?v:0);
        return { ...p,pos,vel,score:f(...pos),clamped:raw.some((x,i)=>x!==pos[i]) };
      });
      frames.push(frame(iteration,'Move and evaluate'));
      particles = particles.map(p => p.score < p.bestScore ? {...p,best:p.pos,bestScore:p.score} : p);
      leader=best(particles);
      frames.push(frame(iteration,'Update bests'));
    }
    return frames;
  }
  const api = {problems,defaults,hand,lecture,run};
  if (typeof module==='object') module.exports=api;
  else root.PSO=api;
})(globalThis);
