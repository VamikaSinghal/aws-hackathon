# Adaptive Health Working Spec

Adaptive Health is an autonomous health optimization agent. It observes health context, chooses one intervention, acts on the user's environment, measures the result, stores the lesson, and repeats.

The demo should make the loop obvious:

```text
Observe -> Diagnose -> Hypothesize -> Act -> Evaluate -> Remember -> Repeat
```

## Non-Goals Here

- Website implementation
- Dashboard UI implementation
- Marketing page polish

## MVP Demo

Primary user goal:

```text
Increase my energy.
```

The judge presses "Advance One Day" and watches the agent learn across multiple cycles.

| Day | Observation | Diagnosis | Experiment | Action | Evaluation |
| --- | --- | --- | --- | --- | --- |
| 1 | Low sleep, missed morning workout, low energy | Morning workout conflicts with schedule | Move workout to 7 PM | Create evening workout calendar block | Energy improves |
| 2 | Workout completed, sleep still weak, late caffeine | Caffeine is blocking recovery | No caffeine after 2 PM | Reminder | Sleep improves |
| 3 | Sleep improved, low protein breakfast | Nutrition is next bottleneck | Add high-protein breakfast | Grocery list | Energy improves again |

## Sponsor Story

- Nexla normalizes the fragmented health context.
- Zero.xyz runs the reasoning agents.
- Pomerium secures the action bridge.
- AWS schedules the autonomous loop.
- Akash hosts the persistent worker.

