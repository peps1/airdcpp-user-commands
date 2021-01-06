# Changelog

## [v2.2.2](https://github.com/peps1/airdcpp-user-commands/tree/v2.2.2) (2021-01-06)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v2.2.1...v2.2.2)

### Changed
- Update dependencies

## [v2.2.1](https://github.com/peps1/airdcpp-user-commands/tree/v2.2.1) (2020-12-17)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v2.2.0...v2.2.1)

### Changed
- Update `/help` text and README

## [v2.2.0](https://github.com/peps1/airdcpp-user-commands/tree/v2.2.0) (2020-12-17)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v2.2.0-beta.5...v2.2.0)

### Changed
- Small change to `/airdc` output

## [v2.2.0-beta.5](https://github.com/peps1/airdcpp-user-commands/tree/v2.2.0-beta.5) (2020-12-14)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v2.2.0-beta.4...v2.2.0-beta.5)

### Changed
- Small change to `/os` and `/stats` os info output
- Remove some error messages when getting OS information

## [v2.2.0-beta.4](https://github.com/peps1/airdcpp-user-commands/tree/v2.2.0-beta.4) (2020-12-13)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v2.2.0-beta.3...v2.2.0-beta.4)

### Changed
- Add support again for node 10
- optimize `/version` output

## [v2.2.0-beta.3](https://github.com/peps1/airdcpp-user-commands/tree/v2.2.0-beta.3) (2020-10-21)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v2.2.0-beta.1...v2.2.0-beta.3)

### Added
- New command `/airdc`
- New command `/prvstats`

### Changed
- Added extension name to event messages
- Some cleanup
- Updated dependencies

## [v2.2.0-beta.1](https://github.com/peps1/airdcpp-user-commands/tree/v2.2.0-beta.1) (2020-10-18)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v2.1.0...v2.2.0-beta.1)

### Added
- New command `/user`

### Changed
- Lots of code refactoring
- Updated dependencies

## [v2.1.0](https://github.com/peps1/airdcpp-user-commands/tree/v2.1.0) (2020-07-15)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v2.0.0-beta.6...v2.1.0)

### Added
- New command `/os`
- New command `/speed`
- Added to new chat command listeners (needs minimum AirDC++w v2.8.0, otherwise fallback to old ones)
  - https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/event-listeners/private-chat-text-command
  - https://airdcpp.docs.apiary.io/#reference/hub-sessions/event-listeners/hub-text-command

### Changed
- Updated dependencies
- Changed command /version - now showing AirDC version and infos about each installed extension

## [v2.0.0-beta](https://github.com/peps1/airdcpp-user-commands/tree/v2.0.0-beta.6) (2020-07-11)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v1.1.0-beta.1...v2.0.0-beta.6)

### Added
- New command `/list`
- New command `/version`

### Changed
- Change code base to typescript
- Updated dependencies

### Fixed
- OS version output in /stats on MacOS

## [v1.1.0-beta](https://github.com/peps1/airdcpp-user-commands/tree/v1.1.0-beta.1) (2020-07-02)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v1.0.8...v1.1.0-beta.1)

### Changed
- update dependencies
- update depdendency airdcpp-extension to 1.2.0-beta.1

## [v1.0.8](https://github.com/peps1/airdcpp-user-commands/tree/v1.0.8) (2020-01-10)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/v1.0.4...v1.0.8)

### Fixed
- Error when getting OS info [\#1](https://github.com/peps1/airdcpp-user-commands/issues/1)
- print error message only when there are errors 👍
- error output in os detect
- better way to get the Linux version from os-release file
- Better OS version output
- Trying to extract proper OS infos, and hopefully catching errors
- total_stats value

## [v1.0.4](https://github.com/peps1/airdcpp-user-commands/tree/v1.0.4) (2020-01-04)
[Full git log](https://github.com/peps1/airdcpp-user-commands/compare/39335e4ab6e8f79c3b3984b47d80907fc7e89f46...v1.0.4)

Initial release
