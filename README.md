# airdcpp-runscript-extension [![Travis][build-badge]][build] [![npm package][npm-badge]][npm]

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

## Resources

- [AirDC++ Web API reference](http://apidocs.airdcpp.net)

[build-badge]: https://img.shields.io/travis/peps1/airdcpp-user-commands/master.svg?style=flat-square
[build]: https://travis-ci.org/peps1/airdcpp-user-commands

[npm-badge]: https://img.shields.io/npm/v/airdcpp-user-commands.svg?style=flat-square
[npm]: https://www.npmjs.org/package/airdcpp-user-commands