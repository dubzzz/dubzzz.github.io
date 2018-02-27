# Breaking down *return true to win* using properties

The idea of *return true to win* exercises is to build a value such as a given function returns `true`. Values can be of any type but can also be restricted to objects, arrays, functions depending on the problem statement. 
This article focuses on applying property based testing to solve such problems.

Examples of such puzzles are available at: https://alf.nu/ReturnTrue

A proof of concept based on [fast-check](https://github.com/dubzzz/fast-check) framework is available at https://github.com/dubzzz/breaking-return-true-to-win/tree/master

## Property based testing

Property based testing originally born for testing reasons. Its purpose is to find out values that makes a property fail. A property can be described as any statement like:

    Given inputs satisfying a pre-requisite,
    The statement is true

Whenever a failing input is encountered, the framework shrinks it to the minimal failing input. It constitutes one of the most important and useful feature of this methology as it gets automatically rid of all the unnecessary noise surrounding the failing case.

## Application to *return true to win*
  
*Return true to win* statements can easily be switched to a property based testing statement.

Let's take the following example:

Find a JavaScript expression such as: `x == !x`

Instead of looking for falsy values we look for truthy ones. So we just have to take the negative and we get the corresponding property.

## Implementation

Given that, implementation using [fast-check](https://github.com/dubzzz/fast-check) is quite straight forward. For instance, our implementation could have been the following:

```js
function negationEqualsOriginal(x) {
    return x == !x;
}
fc.assert(
    fc.property(
        fc.anything(),
        x => ! negationEqualsOriginal(x)
    )
);
```

Let's take a look at this implementation a bit closer:
- `fc.assert` is responsible to execute the property multiple times in an attempt to check for potential issues. It also handles the shrinking part in order to output values as small as possible (no need to have an object with hundreds of keys, if a single key makes it fail)
- `fc.property` declares the property in terms of what it takes for input and how to assess it worked properly
- `fc.anything()` is an arbitrary object, it is responsible to generate any possible object or primitive. We can use multiple arbitraries for a same property just by putting them directly after the first one. For more details on this, have a look to the [documentation of fast-check](https://github.com/dubzzz/fast-check/blob/master/README.md)
- `x => ! negationEqualsOriginal(x)` is the predicate that the framework expect to see always true. In our case we want it to find the case where it becomes falsy

What about shrinking?

In the example above both `[[[[undefined]]]] == ![[[[undefined]]]]`, `[undefined] == ![undefined]` or `[] == ![]` are `true` but due to shrinking the framework will only provide us the minimal failing example which would be the empty array in this case.

## Going further

Our approach is quite complete but it might accept false positives. Indeed, with the above construction we consider an exception as a `true`. Instead of simply taking the negation we should takes something like:

```js
const wrapIt = function(fn) {
    return (...args) => {
        try { return !fn(...args); }
        catch (err) { return true; }
    };
};
```

And replace `x => ! negationEqualsOriginal(x)` by `x => wrapIt(negationEqualsOriginal)(x)`.

## Conclusion

Using this technic we can easily solve problems that require to find out structures such as arrays, strings or objects. Making it work for examples with functions or manipulations of types through the usage of prototype would require more work and the creation of adapted arbitraries to generate the inputs.

The proof of concept is available on https://github.com/dubzzz/breaking-return-true-to-win
