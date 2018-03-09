# Property Based Testing: Another test philosophy

Property based testing has become quite famous in functional world. Mainly introduced by `QuickCheck` framework in `Haskell`, it suggests another way to test software. It targets all the scope covered by example based testing: from unit tests to integration tests.

In order to introduce property based testing, this article will use [fast-check](https://github.com/dubzzz/fast-check) framework written for JavaScript and TypeScript testing but examples can easily be converted for other frameworks. Links towards C++ snippets using [RapidCheck](https://github.com/emil-e/rapidcheck/) will also be provided.

## Existing ways

Multiple ways are currently used in the industry in order to prove the correctness of a code.

Here are some of those technics:
- static code analysis: It provides useful hints on potential harmful usages of the language. It can prove very useful in typed langages by raising flags when it encounters an issue.
- example-based testing: It is certainly the most widespread way of testing. It relies on the fact that for a given set of inputs, the algorithm should produce an already known output. It goes far beyond unit tests as this method can also be part of integration, QA-testing...
- proved code: It proves the code mathematically by checking one by one, loop by loop that all the invariants stay true whatever the provided values.
- crash under random: It tends to make a program crash under random inputs - Monkey Testing - or random data - Fuzzing.

## Definition

Property based testing relies on properties. It checks that a function, program or whatever system under test abides by a fixed property. Most of the time, properties do not have to go into too much details about the output. They just have to check for useful characteristics that must be seen in the output.

A property is just something like:

    for all (x, y, ...)
    such as precondition(x, y, ...) holds
    property(x, y, ...) is true

Before explaining how a test executor will understand and execute it, here is a simple _hello world_ property:

    for all (a, b, c) strings
    the concatenation of a, b and c always contains b

In other words, without any precise knowledge of the shape and content of the strings `a`, `b` and `c` I can surely say that `b` is a substring of `a + b + c`.

The executor understanding of a property can be summurized as:

|Property   |Executor understanding |
|-----------|-----------------------|
|for all    |run it _multiple_ times|
|(x, y, ...)|generate random inputs based on specified generators|
|such as precondition(x, y, ...) holds|check pre-conditions (**failure**: go back to previous)|
|property(x, y, ...) is true|run the test (**failure**: try to shrink the example)|

## Benefits

They are numerous advantages to this approach:

- Reproducible: each time it runs a property test, a seed is produced in order to be able to re-run the test again on the same datasets.
- Cover the scope of all possible inputs: it does not limit itself to restricted sets of inputs and can cover the whole range of strings, integers or whatever type required by the system under tests.
- Shrink the input in case of failure: whenever it fails, the framework tries to reduce the input to a smaller input. For instance: if the condition of the failure is the existence of a given character in a string it should return the one-character string having only this character.

It is also important to note that it does not - by any means - replace unit testing. It only provides an additional tool that might prove very efficient to reduce some boilerplate tests. 

## Shrinking through example

In order to get a better understanding of shrinking I will develop a bit more the example described above. Full code example is available at https://github.com/dubzzz/fast-check/tree/master/example/contains

The property we wanted to check was the following:

    for all (a, b, c) strings
    the concatenation of a, b and c always contains b

Let's assume we have a function called `contains` doing the check. In [fast-check](https://github.com/dubzzz/fast-check) we would simply write:

```js
const fc = require('fast-check');

fc.assert(
    fc.property(
            fc.string(), fc.string(), fc.string(),
            (a, b, c) => contains(b, a+b+c))
);
```

Where:
- `fc.assert(<property>(, parameters))`: It executes the test and check that the property stay true for all the `a, b, c` strings produced by the framework. In case of failure, it shrinks the input to the minimal failing example to help the user during its analysis. By default, it runs the property against 100 generated inputs.
- `fc.property(<...arbitraries>, <predicate>)`: It describes the property. `arbitraries` are the instances responsible to build the inputs while `predicate` is the function doing the test against those inputs. `predicate` should either return a `boolean` or just does not return anything and just throw in case of issue.
- `fc.string()`: It is an arbitrary able to generate and shrink random strings.

If you wonder what are the generated inputs you can replace `fc.assert` by `fc.sample` as follow:

```js
fc.sample(
    fc.property(
            fc.string(), fc.string(), fc.string(),
            (a, b, c) => contains(b, a+b+c))
);
```

You might get something like this:


