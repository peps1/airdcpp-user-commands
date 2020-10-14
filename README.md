# airdcpp-user-commands [![GitHub Actions][build-badge]][build] [![npm package][npm-badge]][npm] [![npm downloads][npm-dl-badge]][npm] [![codecov][coverage-badge]][coverage]

Extension to run commands from chat to output information or trigger actions. See `/help` for a full list

- [Bug tracker](https://github.com/peps1/airdcpp-user-commands/issues)
- [Changelog](https://github.com/peps1/airdcpp-user-commands/blob/master/CHANGELOG.md)

## Screenshot

![Output](doc/commands_output.png?raw=true "Output")

## Available Commands

| Command | Description | Visibility |
| :---    | :---        | :---       |
| /help   | Show this help | (private, visible only to yourself) |
| /uptime | Show uptime (Client & System) | (public, visible to everyone) |
| /speed  | Show current network Upload/Download speed | (public, visible to everyone) |
| /os     | Show the operating system | (public, visible to everyone) |
| /stats  | Show various stats (Client, Uptime, Ratio, CPU)| (public, visible to everyone) |
| /ratio  | Show (all-time) Upload/Download stats| (public, visible to everyone) |
| /sratio | Show Session Upload/Download stats| (public, visible to everyone) |
| /user username | Search for a user and show the hub user was found on | (private, visible only to yourself) |
| /list username /share/folder | List all items within a users shared folder<br>Writing items to local file | (private, visible only to yourself) |
| /version | Show AirDC and all extension versions| (private, visible only to yourself) |

## Resources

- [AirDC++ Web API reference](https://airdcpp.docs.apiary.io/)

[build-badge]: https://github.com/peps1/airdcpp-user-commands/workflows/build/badge.svg
[build]: https://github.com/peps1/airdcpp-user-commands/actions

[npm-badge]: https://img.shields.io/npm/v/airdcpp-user-commands.svg?style=flat-square
[npm]: https://www.npmjs.org/package/airdcpp-user-commands
[npm-dl-badge]: https://img.shields.io/npm/dt/airdcpp-user-commands?label=npm%20downloads&style=flat-square

[coverage-badge]: https://codecov.io/gh/peps1/airdcpp-user-commands/branch/master/graph/badge.svg
[coverage]: https://codecov.io/gh/peps1/airdcpp-user-commands