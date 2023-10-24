import { Component, ReactNode, createContext, useContext } from "react";

const currentContextContainer: ContextContainer[] = [];

export function getActiveContextContainer() {
  return currentContextContainer[currentContextContainer.length - 1];
}

export type Context<T, A extends Record<string, unknown> | void> = (
  props: A,
) => T;

export type ContextState =
  | {
      isResolved: true;
      value: any;
      ref: Context<any, any>;
    }
  | {
      isResolved: false;
      constr: () => any;
      ref: Context<any, any>;
    };

class ContextContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  private _resolvementError?: Error;
  private _state: ContextState;
  private _disposers = new Set<() => void>();
  private _isDisposed = false;

  get isDisposed() {
    return this._isDisposed;
  }

  constructor(
    ref: Context<any, any>,
    constr: () => any,
    private _parent: ContextContainer | null,
  ) {
    this._state = {
      isResolved: false,
      ref,
      constr,
    };
  }
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<T, A extends Record<string, unknown> | void>(
    store: Context<T, A>,
  ): T {
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    if (this._state.isResolved && store === this._state.ref) {
      return this._state.value;
    }

    if (!this._state.isResolved && this._state.ref === store) {
      try {
        currentContextContainer.push(this);
        this._state = {
          isResolved: true,
          value: this._state.constr(),
          ref: store,
        };
        currentContextContainer.pop();

        return this._state.value;
      } catch (e) {
        this._resolvementError =
          new Error(`Could not initialize store "${store?.name}":
${String(e)}`);
        throw this._resolvementError;
      }
    }

    return this.resolve(store);
  }
  clear() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });
  }
  dispose() {
    this.clear();
    this._isDisposed = true;
  }
}

const reactContext = createContext<ContextContainer | null>(null);

export class ContextProvider<
  T extends Record<string, unknown>,
> extends Component<{
  context: Context<any, any>;
  props: T;
  children: React.ReactNode;
}> {
  static contextType = reactContext;
  container!: ContextContainer;
  shouldComponentUpdate(): boolean {
    // This component should never reconcile because of its parent. Not that it matters,
    // but just unncessary
    return false;
  }
  componentWillUnmount(): void {
    this.container.dispose();
  }
  render(): ReactNode {
    // React can keep the component reference and mount/unmount it multiple times. Because of that
    // we need to ensure to always have a hooks container instantiated when rendering, as it could
    // have been disposed due to an unmount
    if (!this.container || this.container.isDisposed) {
      this.container = new ContextContainer(
        this.props.context,
        () => this.props.context(this.props.props),
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
    }

    return (
      <reactContext.Provider value={this.container}>
        {this.props.children}
      </reactContext.Provider>
    );
  }
}

export function cleanup(cleaner: () => void) {
  const activeContextContainer = getActiveContextContainer();

  if (!activeContextContainer) {
    throw new Error("You are cleaning up in an invalid context");
  }

  activeContextContainer.registerCleanup(cleaner);
}

export function context<T, A extends Record<string, unknown> | void>(
  store: Context<T, A>,
): (() => T) & {
  Provider: React.FC<A & { children: React.ReactNode }>;
} {
  const useReactiveContext = () => {
    const activeStoresContainer = getActiveContextContainer();

    if (!activeStoresContainer) {
      const storeContainer = useContext(reactContext);

      if (!storeContainer) {
        throw new Error("You are using a store outside its provider");
      }

      return storeContainer.resolve<T, A>(store);
    }

    return activeStoresContainer.resolve(store);
  };

  useReactiveContext.Provider = ({
    children,
    ...props
  }: A & { children: React.ReactNode }) => (
    <ContextProvider props={props} context={store}>
      {children}
    </ContextProvider>
  );

  useReactiveContext.Provider.displayName = "ReactiveContextProvider";

  return useReactiveContext as any;
}