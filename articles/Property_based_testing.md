# Property Based Testing: Another test philosophy

Property base testing has become quite famous in functional world. Mainly introduced by `QuickCheck` framework in `Haskell`, it suggests another way to test software. It targets all the scope previously handled by example based testing: from unit-tests to integration tests.

In order to introduce property based testing, this article will use [fast-check](https://github.com/dubzzz/fast-check) framework written for JavaScript and TypeScript testing but examples can easily be converted for other frameworks.

## Existing ways

Multiple ways are currently used in the industry in order to prove the correctness of a code.

Here is an extract of some technics that can be seen:
- static code analysis: It provides useful hints on potential harmful usages of the langage. It can prove very useful in typed langages.
- example-based testing: It is certainly the most widespread way of testing. Its relies on the fact that for a given set of inputs, the algorithm should produce the given results. It goes far beyond unit-tests as this method can also be part of integration, QA-testing...
- proved code: It proves the code mathematically by checking one by one, loop by loop that all the invariants stay true whatever the values.
- crash under random: It tends to make a program crash under random inputs - Monkey Testing - or random data - Fuzzing.

## Definition

Pproperty based testing rely on properties. It tests that a function, program or whatever system under test abide by a fixed property. Most of the time, properties do not have to go into too much details about the output. They just have to check for useful characteristics that must be seen in the output.

A property is just something like:

    for all (x, y, ...)
    such as precondition(x, y, ...) holds
    property(x, y, ...) is true

Before explaining how a test executor will understand and execute it, here is a simple _hello world_ property:

    for all (a, b, c) strings
    the concatenation of a, b and c always contains b

In other words, without any precise knowledge of the shape and content of the strings `a`, `b` and `c` I can surely say that `b` is a substring of `a + b + c`.

For the test executor, it understands it as:

|Property   |Executor understanding |
|-----------|-----------------------|
|for all    |run it _multiple_ times|
|(x, y, ...)|generate random inputs based on specified generators|
|such as precondition(x, y, ...) holds|check pre-conditions (**failure**: go back to previous)|
|property(x, y, ...) is true|run the test (**failure**: try to shrink the example)|

## Benefits

They are numerous advantages to this approach:

- Reproducible: each time it runs a test, a seed is produced in order to be able to re-run the test again on the same datasets.
- Cover the scope of all possible inputs: it does not limit itself to restricted set of inputs and can cover the whole range of strings, integers or whatever type required for the system to be tested.
- Shrink the input in case of failure: whenever it fails, the framework (it is the case in all the frameworks I tested so far), try to reduce the input to a smaller input. For instance: if the condition of the failure is the presence of a given character in a string it should return the string having only this precise character

## 