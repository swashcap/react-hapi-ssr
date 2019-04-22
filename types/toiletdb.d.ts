declare module 'toiletdb' {
  export interface ToiletDB<T = any> {
    // open the db
    open(): Promise<void>
    // read data
    read(): Promise<Record<string, T>>
    read(key: string): Promise<T | null>
    // write a value to a key
    write(key: string, val: any): Promise<void>
    // delete a key
    delete(key: string): Promise<void>
    // deletes everything
    flush(): Promise<void>
    // deletes everything synchronously
    flushSync(): void
  }

  function toilet<T>(pathToJSON: string): ToiletDB<T>

  export default toilet
}
