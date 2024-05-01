export type Initializer<T> = T extends any ? (T | (() => T)) : never

export type ObjectLiteral = {[prop: string]: any}

export type GetterValue<T> = T | Promise<Awaited<T>>

export type Getter<T> = (key: string, runtimeValue?: T) => GetterValue<T>

export type GetterType<T extends Getter<any>> = T extends Getter<infer R> ? R : never


type ApiFn<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>
  string: () => ApiGetter<Getter<string>>
  number: () => ApiGetter<Getter<number>>
  boolean: () => ApiGetter<Getter<boolean>>
  optional: () => ApiGetter<Getter<ReturnType<T> | undefined>>
  test: (callback: (value: any) => boolean | Promise<boolean>) => ApiGetter<Getter<T>>,
  parse: <T>(callback: (value: any) => any) => ApiGetter<Getter<T>>
}

export type ApiGetter<T extends Getter<any>> = ApiFn<T>

export type Manipulator<T> = (value: any, errorMessage?: string) => T

export type RuntimeManipulator<T> = (value: Parameters<Manipulator<T>>[0], fallback?: T, errorMessage?: Parameters<Manipulator<T>>[1]) => ReturnType<Manipulator<T>>

export type Definition<T extends ObjectLiteral> = {
  [K in keyof T]: T[K] extends ObjectLiteral ? Definition<T[K]> : Getter<T[K]>
}

export type BaseDefinition<T extends ObjectLiteral = ObjectLiteral, D extends Definition<T> = Definition<T>> = D extends Definition<T> ? T : never

// Util types:
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>
} : T
