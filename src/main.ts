import "reflect-metadata";
import entry from "ts-entry-point";
import layer, { get } from "./layer";

const Service = layer("service");
const Action = layer("action");

@Action()
class MyAction1 {
  world() {
    return "world";
  }
}

@Action()
class MyAction2 {
  hello() {
    return "Hello";
  }
}

@Service()
class MyService1 {
  constructor(readonly action: MyAction2) {}
  greet() {
    console.log(`${this.action.hello()} there!`);
  }
}

@Service()
class MyService2 {
  constructor(readonly action1: MyAction1, readonly action2: MyAction2) {}
  greetWorld() {
    console.log(`${this.action2.hello()}, ${this.action1.world()}!`);
  }
}

@Service()
class FaultyService {
  constructor(readonly fault: MyService1) {}
}

@Action()
class FaultyAction {
  constructor(readonly fault: MyService2) {}
}

@entry
export default class Main {
  static async main() {
    const service1 = get(MyService1);
    const service2 = get(MyService2);
    service1.greet();
    service2.greetWorld();
    try {
      get(FaultyService);
    } catch (e) {
      console.error(e.message);
    }
    try {
      get(FaultyAction);
    } catch (e) {
      console.error(e.message);
    }
  }
}
