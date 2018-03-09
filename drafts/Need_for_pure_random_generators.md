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

Now that we have all the basic notions in mind (at least the names), let's try to see how we might apply them to following programming problem:

The project we are working on is: building a tic tac toe game for a single player against an IA.
Our IA is very basic, it acts by choosing at random one of the remaining cells of the grid.
We are really proud of our project but we already experienced multiple issues while trying to reproduce failing cases.

One of the main problem with random is that by definition it should not be predictible.
Hopefully computer science have what is called pseudo random number generators or PRNG.
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

## Going pure



## ... draft ...

### Overview

Except if we plan running the game for online gambling or e-sports, a simple random generator should be enough. But what if, while testing your game a beta tester encounter an unexpected behavior? How would you be able to understand exactly what went wrong?


## Zoom on PRNG

PRNG are very powerful and useful for developers. They provide what seems to be perfectly random except that behind the hood they just do very deterministic operations. A very simple PRNG might look like:

class Random {
constructor(seed) {this.last = seed;}
nextInt (from, to) {
const v = this.last % (to - from +1) +from;
‎this.last = (97 * this.last + 11) % 997;
‎return v;
};

Which is more or less the implementation of random in Java.

As the generation does not rely on a specific hardware gathering and computing lots of environment characteristics just for one number generation, they are quite efficient in terms of performances while providing quite good quality numbers. They have the ability to reproduce the same sequence of random numbers given the same seed.

That's this feature that makes them so useful.


//explain IA behavior

Here PRNG comes, if you were using such generator, knowing the initial seed and the sequence of moves of your player should be enough to reproduce everything.

But they are not enough, we can do even better.

## Purity

Let's say that our marketing team is planning a soaring in the number of daily players if we implement a basic cancel operation.

In a way the implementation looks pretty simple. We just have to cancel both IA and player move and it works.

Not really because if we cancel a move and replay the same move we reach (possibly) another state. On clever developer might come with the idea: OK while the player does not change its mind by doing a really different move we just keep a pointer to the state we computed and canceled.

But the problem is still there. We just have to cancel, play a different move, cancel again and replay the first move to change the state again. Moreover, the whole debugging process described above becomes a nightmare as it has to keep in mind all the cancelations and replays that occurred.

The other solution might be to re seed the generator and replay all the moves from the very beginning each time we cancel. It will work for a tic tac toe but not really for other problems.

The clé de voûte is pure PRNG.


//text editor, cancel, redo

### PRNG a nice tool

While choosing the right number generator for a given project is important, it's also important to note that the more random they are, the more costly in terms of access time they might be.

Some questions you may ask yourself when choosing one are:

- Am I writing a program dealing with security, secrets or cryptography?

In this case, a CPRNG might be enough depending on the constraints you have.

- ‎Is it problematic if a user succeed in predicting the next random value?

For instance, if you were building an online poker platform, it might be a good choice not to take a too simple and predictable PRNG for production code (eg. : not the random of Java). Indeed a player might discover the seed and break down the sequence.

Except for really critical sections (or to seed a PRNG), you should definitely look into either a CPRNG or a PRNG.

And even in those sections, you might opt for a PRNG when running your units, end to end or integration tests. Indeed reproducible tests are always a good idea.

## depreciated -- Quick overview of Random

Random is a must have for lots of programming problems ranging from game design to security.

It is also a tough question raising lots of possible concerns:
- unpredictable
- unreproducible
- untestable

And coming with multiple options:
- hardware random: provide random based on the entropy of the system and its environment (mouse move, temperature, pressure...). The output is theoretically unpredictable at all
- pseudo random number generator often called PRNG: given an initial seed, a set of arithmetic operations derives it to random sequences which look random but can be reproduced by running it again against the same seed
- cryptographic pseudo random generator often called CPRNG: more secure than prng they provide a prng ready for cryptographic problems
