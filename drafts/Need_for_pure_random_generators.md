# Need for pure (functional) random generators

Pure random generators can be seen as the combination of two distincts areas of devlopment.
On one side, functional laguages where everything must be pure*.
On the other side, random number generators where the aim is to escape from determinism.

*pure: given an input `x` a function `f` should always return the same output value for `x`

By resorting to an example this story aims to convince of the value of such tool.
It describes the reasons that pushed me to write my own [pure PRNG library for JavaScript and TypeScript](https://github.com/dubzzz/pure-rand).

## Pure random generator

Before going further, let's just see how they look like.

A pure random generator* can be seen as a generator able to produce only a single value along with the next generator (for the next random number).
It's signature might look like:

```typescript
interface RandomGenerator {
    next(): [number, RandomGenerator]
}
```

*pure random generator: not to be interpreted as a PRNG (pseudo random number generator)

## Diving into the example

The project we are working on is: building a tic tac toe game for a single player against an IA.
Our IA is very basic, it acts by choosing at random one of the remaining cells of the grid.
We are really proud of our project but we already experienced multiple issues while trying to reproduce failing cases.

One of the main problem with random is that by definition it should not be predictible.
Hopefully computer science has pseudo random number generators or PRNG.
Those generators provide what seems to be perfectly random except that behind the hood they just do very deterministic operations.
A very simple PRNG might look like:

```javascript
class Random {
  constructor(seed) {
    this.last = seed;
  }
  nextInt (from, to) {
    const v = this.last % (to - from +1) +from;
    this.last = (97 * this.last + 11) % 997;
    return v;
  }
}
```

Even if they look very simple and too predictible, PRNG are really powerful.
The one above is really a too simple one but some PRNG are used for cryptography or security issues.
The latest are called cryptographic pseudo random generator or CPRNG.

For even greater entropy but no predictibility at all, there are hardware random generators.
They provide random based on the entropy of the system and its environment (mouse move, temperature, pressure...).
Their output is theoretically unpredictable at all and cannot be seeded in any mean.
They are definitely not a good candidate to help us in investigating the issues we described above: not able to reproduce the problem.

PRNG on the other hand and perfectly adapted to help us.
Given we refactored our code to use one of these we should be able to replay a game state.
In order to replay, we should be provided with the set of all moves done by the player and the initial seed.
Most of programming languages offer a random class that can be seeded easily.

## Going pure

Now that we have unlocked a way to reproduce our games, we want to go a bit further and start adding new features in the game.
The main feature we want to add is a simple undo-redo mechanism with unlimited number of undos.

In a way the implementation looks pretty simple.
We just have to cancel both IA and player move and it works fine.

In reality it does not work so well.
For instance, if we cancel a move and replay the same move we reach (possibly) another state.
Indeed each time call `next` method on classical PRNG we get another random value.
The only property we have is that the whole generated sequence will always be the same for one seed.

```javascript
// Game State: all moves
[]             // no one played
['0-0', '0-1'] // player played 0-0, IA played 0-1
[]             // player canceled
['0-0', '2-1'] // player played 0-0 again, we ask a new random value to the PRNG
```

So we have in a way to keep track of what was generated.
A clever developer might come with the idea: OK while the player does not change its mind by doing a really different move we just keep the steps we went by.

```javascript
// Game State: num moves, all moves
0, []             // no one played
2, ['0-0', '0-1'] // player played 0-0, IA played 0-1
0, ['0-0', '0-1'] // player canceled, we keep track of the steps just in case it played the same
2, ['0-0', '0-1'] // player played 0-0 again, we just take what we computed previously for IA
```

In reality it only postpone the problem. It makes it even more difficult to analyze.
Indeed, we just have to cancel, play a different move, cancel again and replay the first move to change the state again.

```javascript
// Game State: num moves, all moves
0, []             // no one played
2, ['0-0', '0-1'] // player played 0-0, IA played 0-1
0, ['0-0', '0-1'] // player canceled, we keep track of the steps just in case it played the same
2, ['0-1', '1-1'] // player played 0-1, IA played 1-1
0, ['0-1', '1-1'] // player canceled, we keep track of the steps just in case it played the same
2, ['0-0', '2-1'] // player played 0-0 again, we ask a new random value to the PRNG
```

Moreover, the whole debugging process described above becomes a nightmare as it has to keep in mind all the cancelations and replays that occurred. Indeed if you take a look to the line `2, ['0-1', '1-1'] // player played 0-1, IA played 1-1` you should see that it is the second time that the PRNG has been called while its only the first move of the IA.

Another solution or workaround to solve this whole problem, would be to re-seed the generator and replay all the moves from the very beginning each time we cancel. It should work, but the more we played steps the more it will take time to cancel one.
