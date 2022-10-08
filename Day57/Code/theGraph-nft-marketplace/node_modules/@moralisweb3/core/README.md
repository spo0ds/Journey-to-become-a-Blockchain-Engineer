# @moralisweb3/core

The `@moralisweb3/core` should be used in _every_ application that uses Moralis. It is already included if you install the unbrella package `moralis`.

The core responsibilities of this package are

- Hanlding communication between packages. This is done by registering and requesting modules.
- Moralis Errors
- Controllers like the LoggerController and RequestController that can be used in other packages
- Defining reusable DataTypes, to ensure uniform data formatting accross all packages
- Global types and classes that are used in other packages
- Common utilites

# Table of contents

- [@moralisweb3/core](#moraliscore)
- [Table of contents](#table-of-contents)
- [Modules](#modules)
  - [Registering modules via `registerModules()`](#registering-modules-via-registermodules)
  - [Start all modules with `start()`](#start-all-modules-with-start)
- [Config](#config)
- [Controllers](#controllers)
  - [LoggerController](#loggercontroller)
  - [RequestController](#requestcontroller)
    - [get request](#get-request)
    - [post request](#post-request)
- [Errors](#errors)
- [Data Types](#data-types)

# Modules

## Registering modules via `registerModules()`

**Note: this is automatically handled when using the `moralis` umbrella package**

When you import packages from moralis `@moralisweb3/xxx`, you need to let this core package know what modules you are using. This is required to enable cross-communication between different modules.

You can do this by using the `registerModules()` function. This should be done **before** calling any Moralis logic. Ideally this should be at the top of your code, just after the imports.

_Example when using Moralis with the evm network, evm api and server_

```js
import * as Core from '@moralisweb3/core';
import EvmApi from '@moralisweb3/evm-api';

Core.registerModules([EvmApi]);
```

## Start all modules with `start()`

You can start every package separately via a `start()` function. But easier is to call the `start()` function in the core package. This will start (initialise) all registered modules.

You can provide a configuration object (see [Config](#config)). Some config options are required, depending on what packages you have registered (for example you will need a `apiKey` for any api package).

```js
import * as Core from '@moralisweb3/core';

Core.start({
  apiKey: '<YOUR_API_KEY>',
});
```

As argument you can provide a partial config object, as described in [Config](#config).

# Config

You can set the config when you call `Core.start`. Possible options and default values are can be found in [configOptions](src/MoralisConfig/configOptions.ts)

# Controllers

## LoggerController

The `LoggerController` is used in every package as replacement for console.log, console.warn and console.error. In the config you can specify the logLevel:

```js
enum LogLevel {
  VERBOSE = 5,
  DEBUG = 4,
  INFO = 3,
  WARNING = 2,
  ERROR = 1,
  OFF = 0,
}
```

By specifying a loglevel, any logs up and until that number will be emitted.
For example, by specifying `LogLevel.INFO`, all logs with the level `LogLevel.INFO`, `LogLevel.WARNING` and `LogLevel.ERROR` will be emitted.

Using the LoggerController in a package is as simple as:

```js
const logger = new Logger('moduleName');
logger.warning('this is a warning');
```

## RequestController

the RequestController is a generalized way to handle any external request.

### get request

```js
await RequestController.get(url, params, options, abortSignal);
```

`params`: an object with searchparams. For example:

```js
const params = {
  name: 'batman',
};
```

`options`: an object with possible options (See [RequestController](src/controllers/RequestController.ts) for possible options)

`abortSignal`: a signal from an [AbortController]("https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal"), to cancel the request.

### post request

```js
await RequestController.post(url, params, body, options, abortSignal);
```

Accepts the same options as `get()`, with the addition of `body`, which is an (JSON) object.

# Errors

Errors within Moralis are an instance of `MoralisError`. These are extended into a few different classes:

- `MoralisCoreError`
- `MoralisApiError`

Which are used in there respective packages. Creating a new error must accept the following 2 params:

- `code`: a valid [ErrorCode](/src/Error/ErrorCode.ts)
- `message`: a descriptive message for the user

Additionally the following params can be provided for more information

- `details`: an object with additional data
- `cause`: in case the MoralisError is caused by another Error, you should provide this Error as a cause

Example:

```js
throw new MoralisServerError({
  code: NetworkErrorCode.GENERIC_SERVER_ERROR,
  message: 'Make sure to read the docs',
  details: {
    name: 'Gandalf',
  },
});
```

# Data Types

Moralis DataTypes are used everywhere to enforce consistency and utilities for devs. The core benefits of them are:

- Create with different data formats
- Internally the data is parsed into a single type format
- A `format()` function is used to format the datatype to its requested format. This can globally be configured in the config, or overwritten by giving a param
- Utility functions as:
  - Equality checks
  - Formatted data

If a datatype has a `DataType.create()` function, then it should be created via this function rather than using `new DataType`. For example `EvmChain` accepts an `EvmChainish` as input value. This can be a `string`, `number` or `EvmChain`. In case a `EvmChain` is provided, no new instance is created, but that instance is returned directly. This makes it possible to make generalized functions where we accept a `number`/`string`/existing `EvmChain` as argument
