type Class = { new (...args: any[]): any };

const layers = new Map<Symbol, Set<Class>>();
const priorities = new Map<Symbol, number>();
const targetLayers = new Map<Class, Symbol>();

const instances = new Map<Class, any>();

class LayerConstraintViolationError extends Error {}

export function get<T extends Class>(Target: T): InstanceType<T> {
  const inst = instances.get(Target);
  if (inst == null) {
    const priority = priorities.get(targetLayers.get(Target));
    const meta = Reflect.getMetadata("design:paramtypes", Target);
    const inst = Reflect.construct(
      Target,
      (meta ?? []).map((Type: Class) => {
        const localPriority = priorities.get(targetLayers.get(Type));
        if (localPriority === priority) {
          throw new LayerConstraintViolationError(
            `Attempting to inject ${Type.name} into ${Target.name}: They belong to the same layer!`
          );
        }
        if (localPriority < priority) {
          throw new LayerConstraintViolationError(
            `Attempting to inject ${Type.name} into ${Target.name}: ${Type.name} should depend on ${Target.name} but not otherwise!`
          );
        }
        return get(Type);
      })
    );
    instances.set(Target, inst);
    return inst;
  }
  return inst;
}

let i = 0;
export default function layer(description?: string) {
  const layer = Symbol(description);
  priorities.set(layer, ++i);
  return function LayerDecoratorFactory() {
    return function LayerDecorator(target: Class, ...other: any[]) {
      targetLayers.set(target, layer);
      const set = layers.get(layer) ?? new Set();
      set.add(target);
      layers.set(layer, set);
    };
  };
}
