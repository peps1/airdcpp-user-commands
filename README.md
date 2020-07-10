# airdcpp-user-commands [![Travis][build-badge]][build] [![npm package][npm-badge]][npm] [![npm downloads][npm-dl-badge]][npm] [![codecov][coverage-badge]][coverage]

Extension to run commands to output information.

## Screenshot

![Output](doc/commands_output.png?raw=true "Output")

## Available Commands

| Command | Description | Visibility |
| :--- | :--- | :--- |
| /uptime | Show uptime (Client & System) | (public, visible to everyone) |
| /stats  | Show various stats (Client, Uptime, Ratio, CPU)| (public, visible to everyone) |
| /ratio  | Show Upload/Download stats| (public, visible to everyone) |
| /sratio | Show Session Upload/Download stats| (public, visible to everyone) |
| /list username /share/folder | List all items within a users shared folder, writing items to local file | (private, visible only to yourself) |
| /version | Show user-commands extension version| (private, visible only to yourself) |

## Resources

- [Bug tracker](https://github.com/peps1/airdcpp-user-commands/issues)
- [AirDC++ Web API reference](https://airdcpp.docs.apiary.io/)

[build-badge]: https://img.shields.io/travis/peps1/airdcpp-user-commands/master.svg?style=flat-square
[build]: https://travis-ci.org/peps1/airdcpp-user-commands

[npm-badge]: https://img.shields.io/npm/v/airdcpp-user-commands.svg?style=flat-square
[npm]: https://www.npmjs.org/package/airdcpp-user-commands
[npm-dl-badge]: https://img.shields.io/npm/dt/airdcpp-user-commands?label=npm%20downloads&style=flat-square

[coverage-badge]: https://codecov.io/gh/peps1/airdcpp-user-commands/branch/master/graph/badge.svg
[coverage]: https://codecov.io/gh/peps1/airdcpp-user-commands