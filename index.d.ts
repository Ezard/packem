/** Declaration file generated by dts-gen */

declare module packem {
  export namespace PackemPlugin {
    /**
     * A modified version of `packem.config.yml`. It includes
     * a few extra fields required during execution of the binaries.
     *
     * For more details, visit: https://packem.github.io/docs/advanced-plugin-apis.html#the-configurationobject.
     */
    export interface ConfigurationObject {
      /**
       * The root module is where the resolver starts to track
       * dependencies and rehydrate them into the module graph.
       */
      root: string;
      /**
       * Output bundle generated by the transformer.
       */
      output: string;
      /**
       * Absolute path to the root module.
       */
      rootPath: string;
      /**
       * Absolute path to the output bundle.
       */
      outputPath: string;
      /**
       * Absolute path to the output bundle's directory.
       * If the output path is `./dist/bundle.js`, the equivalent
       * `outputDir` would be the absolute path prepended to `./dist/` only.
       */
      outputDir: string;
      /**
       * Output path file name without its extension.
       * If the output directory is `./dist/bundle.main.js`, then
       * the equivalent `outputPathFileStem` would be `bundle.main`
       * i.e. excluding `.js`.
       */
      outputPathFileStem: string;
    }

    export interface ModuleInterface {
      /**
       * The mangled ID used to refer to this module.
       */
      id: string;
      /**
       * The absolute path of this module.
       */
      path: string;
      /**
       * A tracker that defines whether this module is dynamic or not.
       *
       * If it is equivalent to "root", then it is not dynamic. Otherwise, it is.
       *
       * Quick Hack: To check if a module is dynamically imported anywhere,
       *
       *    onModuleBundle(mod: ModuleInterface) {
       *       let isDynamicModule: boolean = mod.bundle_id !== "root";
       *       // Do something with `isDynamicModule`
       *    }
       */
      bundle_id: string;
      /**
       * The file extension of this module.
       */
      extension: string;
      /**
       * Content of this module which doesn't exist on non-JavaScript
       * files so don't use it if you're matching a non-text-based file type.
       */
      content?: string;
      /**
       * An array of mangled IDs that represent a module on the flat list
       *  module graph. When bundling this module with its dependencies it
       *  is recursively looped over until all its dependency's sub-dependencies
       *  have been exhaustively transformed then taken to the serializer (when
       *  the same happens to the whole module graph).
       */
      dependencies: string[];
    }

    /**
     * The module graph is a collection of module interfaces generated in the logical
     * context that connects the source code to its final output.
     *
     * Note: The graph's type is intersectional for backwards compatibility.
     * More details: https://packem.github.io/docs/the-module-graph.html.
     */
    export type ModuleGraph = ModuleInterface[] & object;

    /**
     * The dependency map is a simple dictionary with its keys as a `bundle_id` and its values
     * as the corresponding module interface. Just like the module graph, it is also intersectional
     * when used with types (for backwards compatibility).
     */
    export type DependencyMap = {
      [K in keyof object]: ModuleInterface & object
    };

    /**
     * This class provides an interface to encapsulate Packem plugins for execution
     * during build time. The event hooks defined under this class are the built-in
     * ones provided by Packem's core.
     *
     * Different plugins should be able to create a custom container for defining custom
     * event hooks that can be dispatched in the runtime context during build time. This
     * could be achieved using the `PackemEventDispatcher` class which should be available
     * for use in the upcoming releases.
     *
     * More details: https://packem.github.io/docs/plugin-system.html#the-packemplugin-class.
     * More on event hooks: https://packem.github.io/docs/advanced-plugin-apis.html.
     */
    export class PackemPlugin {
      /**
       * This event is dispatched before the module graph is generated.
       *
       * @param configObject A modified version of `packem.config.yml`. It includes
       * a few extra fields required during execution of the binaries.
       */
      onStart(configObject: ConfigurationObject): void;

      /**
       * Allows manipulation of the graph before the `onModuleBundle` hook.
       *
       * @param moduleGraph The module graph.
       */
      onGenerateModuleGraph(moduleGraph: ModuleGraph): void;

      /**
       * Fired when the transformer is running through the module graph in the runtime context.
       *
       * @param mod Overriden content of the current module. If you need a module to export
       * some content, prepend the content with the string `"module.exports = "`.
       */
      onModuleBundle(mod: ModuleInterface): string;

      /**
       * Triggered just before the transformer kicks in.
       *
       * @param mod The `ModuleInterface`.
       */
      onBeforeTransform(mod: ModuleInterface): void;

      /**
       * Triggered just after the transformer handles JavaScript file types.
       *
       * @param transformedCode A transformed version of the input files.
       */
      onAfterTransform(transformedCode: string): void;

      /**
       * This event is dispatched when the bundling cycle is successfully complete.
       */
      onSuccess(): void;

      /**
       * After every core process is complete, this event is dispatched. This makes it
       * the last event hook regarding dispatching sequence.
       * @param config
       */
      onEnd(config: ConfigurationObject): void;
    }
  }

  /**
   * The `NativeUtils` module exposes a collection of utilities from the logical context.
   * Usually, these utilities are used in specific cases so you'll not need this most of
   * the time.
   */
  export namespace NativeUtils {
    /**
     * This function generates the module graph again. It is useful in cases like creating multiple
     * outputs from multiple inputs.
     *
     * @param currentWorkingDirectory The current working directory obtained through `process.cwd()`.
     * @param rootPath Absolute path to the root module.
     * @param outputPathFileStem Output path file name excluding extension.
     *
     * @returns An array containing the module graph, the length of the module graph and the
     * dependency map respectively.
     */
    export function generateModuleGraph(
      currentWorkingDirectory: string,
      rootPath: PackemPlugin.ConfigurationObject.rootPath,
      outputPathFileStem: PackemPlugin.ConfigurationObject.outputPathFileStem
    ): [PackemPlugin.ModuleGraph, number, PackemPlugin.DependencyMap];

    /**
     * This function regenerates the module graph and is specialized for use in the dev plugin.
     *
     * @param currentWorkingDirectory The current working directory obtained through `process.cwd()`.
     * @param outputPathFileStem Output path file name excluding extension.
     * @param moduleID Corresponds to the `bundle_id` property of the active module interface.
     * @param absoluteModulePath The absolute path of the module interface.
     * @param dependencies An array of strings of mangled IDs (`bundle_id`) corresponding to the
     * dependencies of the active module interface.
     * @param dependencySource An array of strings of mangled IDs (`bundle_id`) corresponding to the
     * keys of the dependency map.
     *
     * @returns An array containing the module graph, the length of the module graph and the
     * dependency map respectively.
     */
    export function regenerateModuleGraph(
      currentWorkingDirectory: string,
      outputPathFileStem: PackemPlugin.ConfigurationObject.outputPathFileStem,
      moduleID: string,
      absoluteModulePath: string,
      dependencies: string[],
      dependencySource: PackemPlugin.DependencyMap[]
    ): [PackemPlugin.ModuleGraph, number, PackemPlugin.DependencyMap];
  }
}
