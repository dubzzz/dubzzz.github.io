# Property Based Testing: Another test philosophy

Property based testing has become quite famous in functional world. Mainly introduced by `QuickCheck` framework in `Haskell`, it suggests another way to test software. It targets all the scope covered by example based testing: from unit tests to integration tests.

In order to introduce property based testing, this article will use [fast-check](https://github.com/dubzzz/fast-check) framework written for JavaScript and TypeScript but examples can easily be converted for other frameworks.

## Existing ways

Multiple ways are currently used in the industry in order to prove the correctness of a code.

Here are some of those technics:
- static code analysis: It provides useful hints on potential harmful usages of the language. It can prove very useful in typed languages by raising flags when it encounters an issue.
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

In order to get a better understanding of shrinking I will develop a bit more the example described above. Interactive code example is available on RunKit: https://runkit.com/dubzzz/contains-example

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
- `fc.assert(<property>(, parameters))`: It executes the test and checks that the property stays true for all the `a, b, c` strings produced by the framework. In case of failure, it shrinks the input to the minimal failing example to help the user during its analysis. By default, it runs the property against 100 generated inputs.
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

You might get generated inputs like:

```
{"a":"=]n#","b":"bs;","c":",r="}
{"a":"CTh7kqc0<","b":"Lr/U+1L`MV","c":"''"}
{"a":"v3.=^>~GS","b":"","c":"0"}
{"a":"","b":"3i","c":"#AP"}
{"a":"N!dAvi","b":"[p23lh","c":"e"}
...
```

Let's suppose that we have the following implementation of `contains` which obviously does not work:

```javascript
const contains = (pattern, text) => {
    return text.substr(1).indexOf(pattern) !== -1;
};
```

The framework will generate multiple inputs and as soon as it finds a failing case it will start the shrinking process. If we take the example above, when running it locally I got a first failure for the entry `{"a":"","b":"I?29S\\~","c":""}`, then the shrinking path was the following:

```javascript
{"a":"","b":"I?29S\\~","c":""} // first failure encountered: start shrinking process
{"a":"","b":"","c":""}
{"a":"","b":"9S\\~","c":""}
{"a":"","b":"","c":""}
{"a":"","b":"\\~","c":""}
{"a":"","b":"","c":""}
{"a":"","b":"~","c":""}
{"a":"","b":"","c":""}
{"a":"","b":" ","c":""} // the last failing case
{"a":"","b":"","c":""}
```

## Going further

Property based testing is a useful and powerful tool. I used it for multiple problems going from testing famous npm repositories to personal snippets. Here are some of the interesting topics I covered with this kind of tool.

### Bug in famous npm packages: js-yaml

While [js-yaml](https://www.npmjs.com/package/js-yaml) is a 1 million downloads per day package, property based testing was able to find a problem in it. The story is available at https://github.com/nodeca/js-yaml/pull/398 and the test at https://runkit.com/dubzzz/multiple-properties-for-js-yaml

Basically I adopted a black-box technic to test it against the most simple property possible: whatever the object I convert into yaml, I should be able to have it back by reading the generated yaml.

### Scenario not covered by units

[Shadows of the knight](https://www.codingame.com/training/medium/shadows-of-the-knight-episode-1) is a programming puzzle available on [CodinGame](https://www.codingame.com/) platform.

While my implementation was passing all the tests provided by the platform, it contained a bug. The property based testing was able to find it.

The source code of the example is available at: https://runkit.com/dubzzz/codingame-example

### UI testing

Certainly one of the most surprising usage is to derive it for UI testing.
I do use it to replace QA checks sometimes and it works pretty well.

For instance I tested a 2048 written in Scala using this technic: https://dubzzz.github.io/scala-2048/

## Conclusion

I highly recommend that you give it a try on some snippets.

By using it you will see how simply it can diagnose and find issues in code.
A next story should come soon to provide useful hints concerning how you can find efficient properties for your algorithms.
So stay tune and leave a comment if you liked it or have suggestions.
