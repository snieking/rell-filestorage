# Rell Filestorage
[![CI Build Status](https://github.com/snieking/rell-filestorage/workflows/continuous-integration/badge.svg)](https://github.com/snieking/rell-filestorage/actions)[![Migration Build Status](https://github.com/snieking/rell-filestorage/workflows/migration/badge.svg)](https://github.com/snieking/rell-filestorage/actions)

## Introduction
The idea is to provide a s3-like service dapp. 
Other dapps can connect to the dapp-chain to store and retrieve files.

The storage solution will include two different types of dapps, 
a file chain which stores files, signatures and ensures the integrity of the data. 
The second type is a file hub which is connected to FT3 and will verify that the auth_descriptor 
is allowed to perform operations. The file hub contains the logic of separating data. 
The file hub also has the responsibility of billing.

A file hub can contain multiple file chains.

## Modules
The project consists of 3 modules.
1. **Filehub:** A filehub is a blockchain that handles the logic around on who is allowed to store, 
   and how the billing is done.
2. **Filechain:** A blockchain that stores files. 
   A filechain must be connected to a **Filehub** blockchain. In order to make sure that the user 
   has talked to the **Filehub** prior to storing and that they are to store. 
   A **Filechain** can be connected to different types of **Filehub** implementations with different 
   rules on storing.
3. **Test**: A test client that verifies the integration between the **Filehub** and **Filechain**.
