# Rell Filestorage
[![CI Build Status](https://github.com/snieking/rell-filestorage/workflows/continuous-integration/badge.svg)](https://github.com/snieking/rell-filestorage/actions)
[![fs-client](https://img.shields.io/npm/v/@snieking/fs-client?label=fs-client)](https://www.npmjs.com/package/@snieking/fs-client)
[![fs-client downloads](https://img.shields.io/npm/dt/@snieking/fs-client?label=fs-client%20downloads)](https://www.npmjs.com/package/@snieking/fs-client)

See the [wiki](https://github.com/snieking/rell-filestorage/wiki) for all kinds of information on the project.

## Modules
The project consists of 4 modules.
1. **Filehub:** A filehub is a blockchain that handles the logic around on who is allowed to store, 
   and how the billing is done.
2. **Filechain:** A blockchain that stores files. 
   A filechain must be connected to a **Filehub** blockchain. In order to make sure that the user 
   has talked to the **Filehub** prior to storing and that they are to store. 
   A **Filechain** can be connected to different types of **Filehub** implementations with different 
   rules on storing.
3. **Client:** JS/TS client for interacting with the Filestorage, for details on how to use it, see the [wiki](https://github.com/snieking/rell-filestorage/wiki/JavaScript-&-TypeScript-Client).
3. **Test**: A test client that verifies the integration between the **Filehub** and **Filechain**.
