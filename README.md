# Take-home API Exercise

In this task, we have provided two things:

* A suite of API tests
* A codebase requiring one more endpoint for the API tests to pass

Your objective is to implement the missing route and make the API tests pass. Treat this like production code, so that means:

* Write tests
* Follow Clean Code conventions
* Follow the existing code conventions

To better understand the code conventions we follow, please read our CTO’s article on [Functional Domain Driven Design](https://antman-does-software.com/functional-domain-driven-design-simplified)

## What we will be assessing you on

Software Engineering can be described as “Programming over time”. That means an engineer isn’t just concerned with writing software that works today, they need to think about the impact of their solution over time. Especially with regards to

* **Readability:** Can we easily follow the code? Do functions and variables have intention revealing names? Do functions do what they say, and are they constrained to a single level of abstraction?
* **Testability:** Is the code written in a way that it could easily be tested? Would the tests provide a good return on investment in terms of effort to maintain versus defects prevented?
* **Maintainability:** Is the code written in a way that it could easily be maintained? Is it a simple solution that can be easily refactored?

We will be asking you how the code patterns used in this challenge supports the three factors above. If you are applying for an IC3 or higher (Senior) role, we expect you to be able to understand this well enough to teach other engineers.

**We also want you to write an [IMPROVEMENTS.md](./IMPROVEMENTS.md) document that outlines any improvements you could make. There is more information in the improvements.md file around what we are looking for** 

## Miscellaneous Information

* We have provided an in-memory persistence layer. This means your application state will reset every time you restart the server. This is intentional for the sake of the test.
* The API Schema is documented in `api-schema.md`

## Solving the problem

1. Install the api test dependencies via `npm ci`. Now you can run the api tests with `npm test`.
2. In `./server` directory install dependencies via `npm ci`. Now you can run the server with `npm start`.
3. Implement the missing route and get the api test suite to pass.
4. Write your suggested improvements in `IMPROVEMENTS.md`. Remember to add your name.
5. Zip up the whole directory and send it back to us. _Please also include your name in the title of the zip file_.

Thank you for taking the time to complete this challenge! We look forward to speaking with you :)