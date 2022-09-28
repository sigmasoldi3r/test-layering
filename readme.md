# Proof of concept

This POC for a runtime layer constraint mechanism is
intended to enforce a healthy, clean and simple way of defining
structural layers of the project.

**Take note** that the naming is arbitrary, this is only intended
to define an order and hierarchy constraint of the dependencies, not
a good-naming magic enforcer. You could just call your layers `Port`,
`Crust`, `Mantle` and `Core` and it would run perfectly fine, as long
as `Mantle` does not require `Port`.

Layers and their priorities are defined top-down, meaning that
upper layers can make use of lower layers but not otherwise.

Example of defining layers:

```ts
const Controller = layer("controller")
const Action = layer("action");
const Service = layer("service");
```

Example of using only two layers:

```ts
@Action()
class MyAction {
  hello() {
    return "Hello";
  }
}

@Controller()
class MyController {
  constructor(readonly action: MyAction) {}
  greet() {
    console.log(`${this.action.hello()} there!`);
  }
}

get(MyController).greet(); // FIN
```

See `src/` for the working example of this POC.
