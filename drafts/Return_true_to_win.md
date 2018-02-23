T ghhnbnThe idea of 'return true to win' exercises is to build a value such as a given function returns true. Values can be of any types but can also be restricted to objects, arrays, functions depending on the problem statement. 
This article focuses on applying property based testing to solve such problems. It will keep restricted to puzzles with no fancy prototype or functions with internal states.  
Property based testing originally born for testing reasons. Its purpose is to find out values that makes a property fails. A property can be described as any statement like: given inputs satisfying a pre-requisite, the statement is true. Whenever a failing input is encountered, the framework shrinks it to the minimal failing input (for instance, for an array: it might be the empty array or an array with twice the same value or anything else depending on the failing cases).  
'Return true to win' statements can easily be switched to a property based testing statement. 
Let's take the following example: 
Find a JavaScript expression such as:
x == !x 
Instead of looking for falsy values we look for truthy ones. So we just have to take the negative and we get the corresponding property. 
Using fast-check, our code will be the following: 
function negationEqualsOriginal(x) {   return x == !x;
}
fc.assert(   fc.property(    ‎ fc.anything(),    ‎ x => ! negationEqualsOriginal(x)   )
) 
Let's take the usage of fast-check line by line:
- fc.assert is responsible to execute the property multiple times in an attempt to check for potential issues. It also handles the shrinking part in order to output values as small as possible (no need to have an object with hundreds of keys, if a single key makes it fail)
- ‎fc.property declares the property, in terms of what it takes for input and how to assess it worked
- ‎fc.anything() is an arbitrary object, it is responsible to generate any possible object or primitive. We can use multiple arbitraries for a same property just by putting them directly after the first one 
